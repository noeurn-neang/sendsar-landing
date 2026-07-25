import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/auth";
import {
  DashboardPageHeader,
  EmptyHint,
  MetricCard,
  Panel,
} from "@/components/dashboard/ui";
import { getTenantUsageSnapshot } from "@/lib/control-plane/usage";
import {
  formatCount,
  formatMinutes,
  usagePercent,
} from "@/lib/dashboard/format";
import { getPlanDisplayName } from "@/lib/pricing";

export default async function DashboardUsagePage() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    redirect("/start");
  }

  const planId = session.user.plan ?? "free";
  const planName = getPlanDisplayName(planId);
  const usage = await getTenantUsageSnapshot({
    tenantId: session.user.tenantId,
    planId,
    includeSeries: true,
  });

  const maxMessages = Math.max(1, ...usage.series.map((d) => d.messages));

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Usage"
        description={`Live allowances for ${usage.periodLabel} on the ${planName} plan.`}
        actions={
          <Link href="/dashboard/billing" className="console-btn-secondary">
            Manage plan
          </Link>
        }
      />

      <EmptyHint>{usage.approxNote}</EmptyHint>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Active chatters / mo"
          value={formatCount(usage.activeChatters.used)}
          hint={`Limit ${formatCount(usage.activeChatters.limit)}`}
          progress={usagePercent(usage.activeChatters.used, usage.activeChatters.limit)}
        />
        <MetricCard
          label="Text chat messages"
          value={formatCount(usage.messages.used)}
          hint={`Limit ${formatCount(usage.messages.limit)}`}
          progress={usagePercent(usage.messages.used, usage.messages.limit)}
        />
        <MetricCard
          label="Voice participant-minutes"
          value={formatMinutes(usage.voiceMinutes.used)}
          hint={`Limit ${formatCount(usage.voiceMinutes.limit)}`}
          progress={usagePercent(usage.voiceMinutes.used, usage.voiceMinutes.limit)}
        />
        <MetricCard
          label="Video participant-minutes"
          value={formatMinutes(usage.videoMinutes.used)}
          hint={`Limit ${formatCount(usage.videoMinutes.limit)}`}
          progress={usagePercent(usage.videoMinutes.used, usage.videoMinutes.limit)}
        />
        <MetricCard
          label="Registered users"
          value={formatCount(usage.userCount)}
          hint={`${formatCount(usage.roomCount)} rooms total`}
        />
        <MetricCard
          label="Storage"
          value={`${usage.storageGB.used} GB`}
          hint={`Included ${usage.storageGB.limit} GB`}
          progress={usagePercent(usage.storageGB.used, usage.storageGB.limit)}
        />
      </div>

      <Panel
        title="Messages over time"
        description={`Daily message volume for ${usage.periodLabel} (UTC).`}
      >
        {usage.series.length === 0 ? (
          <p className="py-10 text-center text-sm text-console-muted">
            No messages this month yet. Send traffic through the gateway to populate this chart.
          </p>
        ) : (
          <div className="flex h-48 items-end gap-1.5 sm:gap-2">
            {usage.series.map((point) => {
              const height = Math.max(8, Math.round((point.messages / maxMessages) * 100));
              return (
                <div key={point.day} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-brand/80 transition hover:bg-brand"
                    style={{ height: `${height}%` }}
                    title={`${point.messages} messages on ${point.label}`}
                  />
                  <span className="truncate text-[10px] text-console-muted sm:text-xs">
                    {point.label.replace(/^[A-Za-z]+ /, "")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
