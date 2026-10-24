import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { BillingPanel } from "@/components/dashboard/BillingPanel";
import {
  DashboardPageHeader,
  Panel,
} from "@/components/dashboard/ui";
import { isAbaPaywayEnabled } from "@/lib/billing/config";
import { getTenantBrief } from "@/lib/control-plane/accounts";
import {
  approachingLimit,
  atLimit,
  getTenantUsageSnapshot,
} from "@/lib/control-plane/usage";
import {
  formatCount,
  formatMinutes,
  usagePercent,
} from "@/lib/dashboard/format";
import { getPlanDisplayName } from "@/lib/pricing";

type BillingPageProps = {
  searchParams: Promise<{ upgraded?: string }>;
};

export default async function DashboardBillingPage({ searchParams }: BillingPageProps) {
  const session = await auth();
  if (!session?.user?.tenantId || !session.user.accountId) {
    redirect("/start");
  }

  const params = await searchParams;
  const brief = await getTenantBrief(session.user.accountId, session.user.tenantId);
  const planId =
    (brief?.plan ?? session.user.plan ?? "free").trim().toLowerCase() || "free";
  const planName = getPlanDisplayName(planId);
  const tenantId = session.user.tenantId;
  const slug = brief?.slug ?? session.user.tenantSlug ?? null;
  const abaEnabled = isAbaPaywayEnabled();
  const usage = await getTenantUsageSnapshot({
    accountId: session.user.accountId,
    tenantId,
    planId,
  });

  const meters = [
    { label: "Active chatters", meter: usage.activeChatters, format: formatCount },
    { label: "Messages", meter: usage.messages, format: formatCount },
    { label: "Voice participant-min", meter: usage.voiceMinutes, format: formatMinutes },
    { label: "Video participant-min", meter: usage.videoMinutes, format: formatMinutes },
    {
      label: "Storage (GB)",
      meter: usage.storageGB,
      format: (v: number) => String(v),
    },
  ];

  const needsUpgrade =
    usage.available &&
    (meters.some((row) => approachingLimit(row.meter)) ||
      meters.some((row) => atLimit(row.meter)));

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Plan"
        description="Manage your workspace plan and usage allowances."
        actions={
          <Link href="/#pricing" className="console-btn-secondary">
            View plans
          </Link>
        }
      />

      {needsUpgrade ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 text-sm text-console-fg">
          You&apos;re approaching or at a plan limit for {usage.periodLabel}. Upgrade to Plus or Pro
          for higher allowances.
        </div>
      ) : null}

      {!usage.available ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 text-sm text-console-fg">
          Usage is temporarily unavailable — meters below are placeholders, not live zeros.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <BillingPanel
          planId={planId}
          planName={planName}
          tenantId={tenantId}
          slug={slug}
          abaEnabled={abaEnabled}
          upgraded={params.upgraded === "1"}
        />

        <Panel title="Usage vs limits" description={`Live for ${usage.periodLabel}`}>
          <ul className="divide-y divide-console-border text-sm">
            {meters.map((row) => {
              const pct = usage.available
                ? usagePercent(row.meter.used, row.meter.limit)
                : 0;
              const warn =
                usage.available &&
                (approachingLimit(row.meter) || atLimit(row.meter));
              return (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-console-fg">{row.label}</p>
                    <p className="text-xs text-console-muted">
                      {usage.available ? `${pct}% of allowance` : "Unavailable"}
                    </p>
                  </div>
                  <span
                    className={`font-mono text-xs ${
                      warn
                        ? "text-amber-700 [.console-theme[data-theme=dark]_&]:text-amber-300"
                        : "text-console-fg"
                    }`}
                  >
                    {usage.available
                      ? `${row.format(row.meter.used)} / ${formatCount(row.meter.limit)}`
                      : "—"}
                  </span>
                </li>
              );
            })}
          </ul>
          <Link
            href="/dashboard/usage"
            className="mt-4 inline-flex text-sm font-medium text-brand hover:text-brand-strong"
          >
            Full usage →
          </Link>
        </Panel>
      </div>
    </div>
  );
}
