import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import {
  currentPeriodLabel,
  formatStorageGB,
} from "@/lib/dashboard/format";
import { getPlanUsageLimits, type PlanUsageLimits } from "@/lib/pricing";

export type UsageMeter = {
  used: number;
  limit: number;
};

export type UsageSeriesPoint = {
  day: string;
  label: string;
  messages: number;
};

export type TenantUsageSnapshot = {
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  activeChatters: UsageMeter;
  messages: UsageMeter;
  voiceMinutes: UsageMeter;
  videoMinutes: UsageMeter;
  storageGB: UsageMeter;
  roomCount: number;
  userCount: number;
  series: UsageSeriesPoint[];
  approxNote: string;
};

export type GetTenantUsageOptions = {
  tenantId: string;
  planId: string;
  /** Daily series is expensive — only load on the Usage page. */
  includeSeries?: boolean;
};

function monthBounds(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

async function fetchTenantUsageSnapshot(
  input: GetTenantUsageOptions,
): Promise<TenantUsageSnapshot> {
  const includeSeries = Boolean(input.includeSeries);
  const limits = getPlanUsageLimits(input.planId);
  const { start, end } = monthBounds();
  const { query } = await import("@/lib/db");
  const params = [input.tenantId, start.toISOString(), end.toISOString()] as const;

  const [chattersRow, callsRow, storageRow, countsRow, messagesOrSeries] = await Promise.all([
    query<{ count: string }>(
      `WITH month_rooms AS (
         SELECT DISTINCT m."roomId"
         FROM messages m
         INNER JOIN rooms r ON r.id = m."roomId"
         WHERE r."tenantId" = $1
           AND m."deletedAt" IS NULL
           AND m."createdAt" >= $2
           AND m."createdAt" < $3
       )
       SELECT COUNT(DISTINCT u.uid)::text AS count
       FROM (
         SELECT m."senderId" AS uid
         FROM messages m
         INNER JOIN month_rooms mr ON mr."roomId" = m."roomId"
         WHERE m."deletedAt" IS NULL
           AND m."createdAt" >= $2
           AND m."createdAt" < $3
         UNION
         SELECT p."userId" AS uid
         FROM participants p
         INNER JOIN month_rooms mr ON mr."roomId" = p."roomId"
         WHERE p."tenantId" = $1
       ) u`,
      [...params],
    ),
    query<{ type: string; minutes: string }>(
      `SELECT type::text AS type,
              COALESCE(SUM(EXTRACT(EPOCH FROM ("endedAt" - "startedAt")) / 60.0), 0)::text AS minutes
       FROM calls
       WHERE "tenantId" = $1
         AND "startedAt" IS NOT NULL
         AND "endedAt" IS NOT NULL
         AND "endedAt" >= $2
         AND "endedAt" < $3
       GROUP BY type`,
      [...params],
    ),
    query<{ bytes: string }>(
      `SELECT COALESCE(SUM("sizeBytes"), 0)::text AS bytes
       FROM uploads
       WHERE "tenantId" = $1 AND status = 'completed'`,
      [input.tenantId],
    ),
    query<{ rooms: string; users: string }>(
      `SELECT
         (SELECT COUNT(*)::text FROM rooms WHERE "tenantId" = $1) AS rooms,
         (SELECT COUNT(*)::text FROM users WHERE "tenantId" = $1) AS users`,
      [input.tenantId],
    ),
    includeSeries
      ? query<{ day: Date | string; messages: string }>(
          `SELECT date_trunc('day', m."createdAt") AS day,
                  COUNT(*)::text AS messages
           FROM messages m
           INNER JOIN rooms r ON r.id = m."roomId"
           WHERE r."tenantId" = $1
             AND m."deletedAt" IS NULL
             AND m."createdAt" >= $2
             AND m."createdAt" < $3
           GROUP BY 1
           ORDER BY 1 ASC`,
          [...params],
        )
      : query<{ count: string }>(
          `SELECT COUNT(*)::text AS count
           FROM messages m
           INNER JOIN rooms r ON r.id = m."roomId"
           WHERE r."tenantId" = $1
             AND m."deletedAt" IS NULL
             AND m."createdAt" >= $2
             AND m."createdAt" < $3`,
          [...params],
        ),
  ]);

  let voiceMinutes = 0;
  let videoMinutes = 0;
  for (const row of callsRow.rows) {
    const minutes = Number(row.minutes) || 0;
    if (row.type === "AUDIO") voiceMinutes = minutes;
    if (row.type === "VIDEO") videoMinutes = minutes;
  }

  const series: UsageSeriesPoint[] = includeSeries
    ? (messagesOrSeries.rows as { day: Date | string; messages: string }[]).map((row) => {
        const day = new Date(row.day);
        return {
          day: day.toISOString(),
          label: new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          }).format(day),
          messages: Number(row.messages) || 0,
        };
      })
    : [];

  const messageCount = includeSeries
    ? series.reduce((sum, point) => sum + point.messages, 0)
    : Number((messagesOrSeries.rows[0] as { count?: string } | undefined)?.count ?? 0);

  return {
    periodLabel: currentPeriodLabel(),
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    activeChatters: {
      used: Number(chattersRow.rows[0]?.count ?? 0),
      limit: limits.activeChatters,
    },
    messages: {
      used: messageCount,
      limit: limits.messages,
    },
    voiceMinutes: { used: voiceMinutes, limit: limits.voiceMinutes },
    videoMinutes: { used: videoMinutes, limit: limits.videoMinutes },
    storageGB: {
      used: formatStorageGB(Number(storageRow.rows[0]?.bytes ?? 0)),
      limit: limits.storageGB,
    },
    roomCount: Number(countsRow.rows[0]?.rooms ?? 0),
    userCount: Number(countsRow.rows[0]?.users ?? 0),
    series,
    approxNote:
      "Active chatters approximate unique senders and participants in rooms with messages this month. Recording minutes are not metered yet.",
  };
}

/**
 * Request-deduped + short-lived cached usage snapshot.
 * Overview/Billing should omit series; Usage page sets includeSeries: true.
 */
export const getTenantUsageSnapshot = cache(async (input: GetTenantUsageOptions) => {
  const includeSeries = Boolean(input.includeSeries);
  const periodKey = currentPeriodLabel();

  return unstable_cache(
    () => fetchTenantUsageSnapshot({ ...input, includeSeries }),
    ["tenant-usage-v2", input.tenantId, input.planId, periodKey, includeSeries ? "series" : "summary"],
    {
      revalidate: 30,
      tags: [`usage:${input.tenantId}`],
    },
  )();
});

export function approachingLimit(meter: UsageMeter): boolean {
  return usagePercentOf(meter) >= 90;
}

export function atLimit(meter: UsageMeter): boolean {
  return meter.limit > 0 && meter.used >= meter.limit;
}

function usagePercentOf(meter: UsageMeter): number {
  if (meter.limit <= 0) return 0;
  return Math.min(100, Math.round((meter.used / meter.limit) * 100));
}

export type { PlanUsageLimits };
