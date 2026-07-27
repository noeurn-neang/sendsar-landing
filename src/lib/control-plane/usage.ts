import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import { consoleFetch } from "@/lib/console-api";
import {
  currentPeriodLabel,
  formatStorageGB,
} from "@/lib/dashboard/format";
import { getPlanUsageLimits } from "@/lib/pricing";

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

type ConsoleUsageRaw = {
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  activeChattersUsed: number;
  messagesUsed: number;
  voiceMinutesUsed: number;
  videoMinutesUsed: number;
  storageBytes: number;
  roomCount: number;
  userCount: number;
  series: UsageSeriesPoint[];
  approxNote: string;
};

async function fetchTenantUsageSnapshot(
  input: GetTenantUsageOptions,
): Promise<TenantUsageSnapshot> {
  const includeSeries = Boolean(input.includeSeries);
  const limits = getPlanUsageLimits(input.planId);
  const raw = await consoleFetch<ConsoleUsageRaw>(
    `/v1/console/tenants/${input.tenantId}/usage`,
    {
      query: { includeSeries: includeSeries ? "true" : "false" },
    },
  );

  return {
    periodLabel: raw.periodLabel || currentPeriodLabel(),
    periodStart: raw.periodStart,
    periodEnd: raw.periodEnd,
    activeChatters: {
      used: Number(raw.activeChattersUsed) || 0,
      limit: limits.activeChatters,
    },
    messages: {
      used: Number(raw.messagesUsed) || 0,
      limit: limits.messages,
    },
    voiceMinutes: {
      used: Number(raw.voiceMinutesUsed) || 0,
      limit: limits.voiceMinutes,
    },
    videoMinutes: {
      used: Number(raw.videoMinutesUsed) || 0,
      limit: limits.videoMinutes,
    },
    storageGB: {
      used: formatStorageGB(Number(raw.storageBytes) || 0),
      limit: limits.storageGB,
    },
    roomCount: Number(raw.roomCount) || 0,
    userCount: Number(raw.userCount) || 0,
    series: Array.isArray(raw.series) ? raw.series : [],
    approxNote: raw.approxNote,
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
    ["tenant-usage-v4-console", input.tenantId, input.planId, periodKey, includeSeries ? "series" : "summary"],
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
