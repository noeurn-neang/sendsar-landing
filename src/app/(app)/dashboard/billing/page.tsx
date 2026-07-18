import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  DashboardPageHeader,
  Panel,
  StatusPill,
} from "@/components/dashboard/ui";
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
import { siteConfig } from "@/lib/site";

function upgradeMailto(tenantId: string, slug: string | null, plan: string) {
  const subject = encodeURIComponent(`Sendsar upgrade request — ${slug ?? tenantId}`);
  const body = encodeURIComponent(
    `Hi Sendsar team,\n\nI'd like to upgrade my workspace.\n\nTenant ID: ${tenantId}\nSlug: ${slug ?? "n/a"}\nCurrent plan: ${plan}\nDesired plan: Plus / Pro\n\nThanks!`,
  );
  return `mailto:${siteConfig.contactEmail}?subject=${subject}&body=${body}`;
}

export default async function DashboardBillingPage() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    redirect("/start");
  }

  const planId = session.user.plan ?? "free";
  const planName = getPlanDisplayName(planId);
  const tenantId = session.user.tenantId;
  const slug = session.user.tenantSlug ?? null;
  const usage = await getTenantUsageSnapshot({ tenantId, planId });

  const meters = [
    { label: "Active chatters", meter: usage.activeChatters, format: formatCount },
    { label: "Messages", meter: usage.messages, format: formatCount },
    { label: "Voice minutes", meter: usage.voiceMinutes, format: formatMinutes },
    { label: "Video minutes", meter: usage.videoMinutes, format: formatMinutes },
    {
      label: "Storage (GB)",
      meter: usage.storageGB,
      format: (v: number) => String(v),
    },
  ];

  const needsUpgrade =
    meters.some((row) => approachingLimit(row.meter)) ||
    meters.some((row) => atLimit(row.meter));

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Plan"
        description="Free to start. Contact us when you need Plus or Pro — we handle billing manually."
        actions={
          <Link href="/pricing" className="console-btn-secondary">
            Compare plans
          </Link>
        }
      />

      {needsUpgrade ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 text-sm text-console-fg">
          You&apos;re approaching or at a plan limit for {usage.periodLabel}. Request an upgrade and
          we&apos;ll flip your tenant plan manually.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Current plan" description="Synced with your tenant record">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold tracking-tight text-console-fg">{planName}</p>
              <p className="mt-1 text-sm text-console-muted">
                {planId === "free"
                  ? "No payment required — upgrade when you outgrow the free tier."
                  : "Managed billing — reach out to change plans."}
              </p>
            </div>
            <StatusPill tone="success">Active</StatusPill>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={upgradeMailto(tenantId, slug, planName)} className="console-btn-primary">
              Request upgrade
            </a>
            <a
              href={siteConfig.contactTelegram}
              target="_blank"
              rel="noopener noreferrer"
              className="console-btn-secondary"
            >
              Telegram
            </a>
          </div>
          <p className="mt-4 text-xs text-console-muted">
            Include your tenant ID (<span className="font-mono">{tenantId}</span>) so we can locate
            the workspace quickly.
          </p>
        </Panel>

        <Panel title="Usage vs limits" description={`Live for ${usage.periodLabel}`}>
          <ul className="divide-y divide-console-border text-sm">
            {meters.map((row) => {
              const pct = usagePercent(row.meter.used, row.meter.limit);
              const warn = approachingLimit(row.meter) || atLimit(row.meter);
              return (
                <li key={row.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-console-fg">{row.label}</p>
                    <p className="text-xs text-console-muted">{pct}% of allowance</p>
                  </div>
                  <span
                    className={`font-mono text-xs ${
                      warn
                        ? "text-amber-700 [.console-theme[data-theme=dark]_&]:text-amber-300"
                        : "text-console-fg"
                    }`}
                  >
                    {row.format(row.meter.used)} / {formatCount(row.meter.limit)}
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
