import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  CopyButton,
  DashboardPageHeader,
  EmptyHint,
  MetricCard,
  Panel,
  StatusPill,
} from "@/components/dashboard/ui";
import { getLastWebhookTest } from "@/lib/control-plane/ops";
import { getTenantUsageSnapshot } from "@/lib/control-plane/usage";
import {
  formatCount,
  formatMinutes,
  usagePercent,
} from "@/lib/dashboard/format";
import { getPlanDisplayName } from "@/lib/pricing";
import { siteConfig } from "@/lib/site";

export default async function DashboardOverviewPage() {
  const session = await auth();
  if (!session?.user?.tenantId || !session.user.accountId) {
    redirect("/start");
  }

  const planId = session.user.plan ?? "free";
  const planName = getPlanDisplayName(planId);
  const [usage, lastWebhookTest] = await Promise.all([
    getTenantUsageSnapshot({
      accountId: session.user.accountId,
      tenantId: session.user.tenantId,
      planId,
    }),
    getLastWebhookTest(session.user.accountId, session.user.tenantId),
  ]);

  const nextStep = !session.user.keysRevealed
    ? {
        title: "Reveal your API keys",
        body: "Copy the live server secret and webhook signing secret once — store them in your server environment.",
        href: "/dashboard/keys?welcome=1",
        cta: "Reveal API keys",
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="8" cy="14" r="3.25" />
            <path d="M11 14h9v3M17 14v3" strokeLinecap="round" />
          </svg>
        ),
      }
    : !lastWebhookTest
      ? {
          title: "Configure webhooks",
          body: "Add an endpoint URL and send a test event so your backend receives room and message events.",
          href: "/dashboard/settings",
          cta: "Configure webhooks",
          icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 8a3 3 0 0 0-3-3 3 3 0 0 0-3 3v2a3 3 0 0 1-3 3 3 3 0 0 1-3-3" />
              <path d="M12 12v6" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          ),
        }
      : {
          title: "Follow the quickstart",
          body: "Mint end-user JWTs from your BFF and connect the chat SDK directly into your client app.",
          href: siteConfig.quickstartUrl,
          cta: "Open quickstart",
          external: true,
          icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            </svg>
          ),
        };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Overview"
        description="Workspace health, live gateway usage for this period, and integration milestones."
        badge={
          <StatusPill tone="brand">
            Live Gateway
          </StatusPill>
        }
        actions={
          <>
            <Link
              href="/dashboard/keys"
              className="btn-bd-primary inline-flex items-center gap-2 rounded-xl bg-[#0096c8] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#0096c8]/20 transition hover:bg-[#007ba4]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="8" cy="14" r="3.25" />
                <path d="M11 14h9v3M17 14v3" strokeLinecap="round" />
              </svg>
              <span>API keys</span>
            </Link>
            <a
              href={siteConfig.quickstartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-console-border bg-console-panel px-4 py-2 text-sm font-semibold text-console-fg shadow-xs transition hover:border-[#0096c8]/40 hover:bg-console-track"
            >
              <svg className="h-4 w-4 text-console-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <span>Quickstart</span>
              <svg className="h-3.5 w-3.5 text-console-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>
          </>
        }
      />

      <EmptyHint live={usage.available}>
        {usage.available
          ? `Meters are computed in real-time from live gateway telemetry for ${usage.periodLabel}. ${usage.approxNote}`
          : usage.approxNote}
      </EmptyHint>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Active chatters"
          value={usage.available ? formatCount(usage.activeChatters.used) : "—"}
          hint={
            usage.available
              ? `${usagePercent(usage.activeChatters.used, usage.activeChatters.limit)}% of ${formatCount(usage.activeChatters.limit)} / mo`
              : "Telemetry unavailable"
          }
          progress={
            usage.available
              ? usagePercent(usage.activeChatters.used, usage.activeChatters.limit)
              : 0
          }
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <MetricCard
          label="Messages"
          value={usage.available ? formatCount(usage.messages.used) : "—"}
          hint={
            usage.available
              ? `${usagePercent(usage.messages.used, usage.messages.limit)}% of ${formatCount(usage.messages.limit)} / mo`
              : "Telemetry unavailable"
          }
          progress={
            usage.available ? usagePercent(usage.messages.used, usage.messages.limit) : 0
          }
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
        <MetricCard
          label="Voice participant-min"
          value={usage.available ? formatMinutes(usage.voiceMinutes.used) : "—"}
          hint={
            usage.available
              ? `${usagePercent(usage.voiceMinutes.used, usage.voiceMinutes.limit)}% of ${formatCount(usage.voiceMinutes.limit)} / mo`
              : "Telemetry unavailable"
          }
          progress={
            usage.available
              ? usagePercent(usage.voiceMinutes.used, usage.voiceMinutes.limit)
              : 0
          }
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          }
        />
        <MetricCard
          label="Storage"
          value={usage.available ? `${usage.storageGB.used} GB` : "—"}
          hint={
            usage.available
              ? `${usagePercent(usage.storageGB.used, usage.storageGB.limit)}% of ${usage.storageGB.limit} GB`
              : "Telemetry unavailable"
          }
          progress={
            usage.available
              ? usagePercent(usage.storageGB.used, usage.storageGB.limit)
              : 0
          }
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Project Workspace"
          description="Tenant configuration & identification"
          action={<StatusPill tone="success">{planName}</StatusPill>}
        >
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-console-border/70 bg-console-canvas/50 p-3">
              <dt className="text-xs font-medium text-console-muted">Workspace Name</dt>
              <dd className="mt-1 font-semibold text-console-fg">{session.user.tenantName}</dd>
            </div>
            <div className="rounded-xl border border-console-border/70 bg-console-canvas/50 p-3">
              <div className="flex items-center justify-between">
                <dt className="text-xs font-medium text-console-muted">Tenant ID</dt>
                <CopyButton value={session.user.tenantId} label="Copy" />
              </div>
              <dd className="mt-1 truncate font-mono text-xs font-semibold text-console-fg">
                {session.user.tenantId}
              </dd>
            </div>
            <div className="rounded-xl border border-console-border/70 bg-console-canvas/50 p-3">
              <dt className="text-xs font-medium text-console-muted">Slug</dt>
              <dd className="mt-1 font-mono text-xs font-semibold text-console-fg">
                {session.user.tenantSlug ? `@${session.user.tenantSlug}` : "—"}
              </dd>
            </div>
            <div className="rounded-xl border border-console-border/70 bg-console-canvas/50 p-3">
              <dt className="text-xs font-medium text-console-muted">Users & Rooms</dt>
              <dd className="mt-1 font-mono text-xs font-semibold text-console-fg">
                {formatCount(usage.userCount)} users · {formatCount(usage.roomCount)} rooms
              </dd>
            </div>
          </dl>
        </Panel>

        <Panel
          title="This period"
          description={usage.periodLabel}
          action={
            <Link
              href="/dashboard/usage"
              className="text-xs font-semibold text-[#0096c8] transition hover:text-[#007ba4] dark:text-[#38bdf8]"
            >
              View usage breakdown →
            </Link>
          }
        >
          <ul className="space-y-3.5 text-sm">
            <li className="flex items-center justify-between gap-4 rounded-xl border border-console-border/70 bg-console-canvas/50 px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-[#0096c8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <span className="text-xs font-medium text-console-muted">Video participant-min</span>
              </div>
              <span className="font-mono text-xs font-semibold text-console-fg">
                {formatMinutes(usage.videoMinutes.used)} / {formatCount(usage.videoMinutes.limit)}
              </span>
            </li>
            <li className="flex items-center justify-between gap-4 rounded-xl border border-console-border/70 bg-console-canvas/50 px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-[#0096c8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M18 8a3 3 0 0 0-3-3 3 3 0 0 0-3 3v2a3 3 0 0 1-3 3 3 3 0 0 1-3-3" />
                  <path d="M12 12v6" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
                <span className="text-xs font-medium text-console-muted">Webhook test</span>
              </div>
              <div>
                {lastWebhookTest ? (
                  lastWebhookTest.ok ? (
                    <StatusPill tone="success">Passed</StatusPill>
                  ) : (
                    <StatusPill tone="warning">Failed</StatusPill>
                  )
                ) : (
                  <StatusPill tone="neutral">Not tested</StatusPill>
                )}
              </div>
            </li>
            <li className="flex items-center justify-between gap-4 rounded-xl border border-console-border/70 bg-console-canvas/50 px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-[#0096c8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                <span className="text-xs font-medium text-console-muted">Billing plan</span>
              </div>
              <Link
                href="/dashboard/billing"
                className="text-xs font-semibold text-[#0096c8] transition hover:text-[#007ba4] dark:text-[#38bdf8]"
              >
                Manage subscription →
              </Link>
            </li>
          </ul>
        </Panel>
      </div>

      {/* Recommended Next Step Callout */}
      <div className="relative overflow-hidden rounded-2xl border border-[#0096c8]/30 bg-gradient-to-r from-[#0096c8]/10 via-[#0096c8]/5 to-transparent p-6 shadow-sm backdrop-blur-xs transition hover:border-[#0096c8]/50">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0096c8] text-white shadow-md shadow-[#0096c8]/25">
              {nextStep.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0096c8] dark:text-[#38bdf8]">
                  Recommended Action
                </span>
              </div>
              <p className="mt-0.5 text-base font-bold text-console-fg">{nextStep.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-console-muted sm:text-sm">{nextStep.body}</p>
            </div>
          </div>
          {"external" in nextStep && nextStep.external ? (
            <a
              href={nextStep.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-bd-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0096c8] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0096c8]/20 transition hover:bg-[#007ba4]"
            >
              <span>{nextStep.cta}</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>
          ) : (
            <Link
              href={nextStep.href}
              className="btn-bd-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0096c8] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0096c8]/20 transition hover:bg-[#007ba4]"
            >
              <span>{nextStep.cta}</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Guided 3-step getting started */}
      <Panel
        title="Get started"
        description="Wire your backend the same way LiveKit Cloud expects API keys on the server."
      >
        <ol className="grid gap-3.5 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Copy API key & secret",
              body: "Server key + webhook secret — reveal once, then rotate anytime if needed.",
              href: "/dashboard/keys",
              icon: (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="8" cy="14" r="3.25" />
                  <path d="M11 14h9v3M17 14v3" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              step: "02",
              title: "Configure webhook",
              body: "Point Settings → Webhooks at your BFF endpoint, then send a live test payload.",
              href: "/dashboard/settings",
              icon: (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8a3 3 0 0 0-3-3 3 3 0 0 0-3 3v2a3 3 0 0 1-3 3 3 3 0 0 1-3-3" />
                  <path d="M12 12v6" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              ),
            },
            {
              step: "03",
              title: "Monitor live usage",
              body: "Telemetry meters update automatically as messages, calls, and files flow in.",
              href: "/dashboard/usage",
              icon: (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              ),
            },
          ].map((item) => (
            <li
              key={item.step}
              className="group relative rounded-xl border border-console-border bg-console-canvas/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0096c8]/40 hover:bg-console-panel hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0096c8]/10 font-mono text-xs font-bold text-[#0096c8] dark:bg-[#0096c8]/20 dark:text-[#38bdf8]">
                  {item.step}
                </span>
                <div className="text-console-muted transition-colors group-hover:text-[#0096c8]">
                  {item.icon}
                </div>
              </div>
              <p className="mt-3 text-sm font-bold text-console-fg">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-console-muted">{item.body}</p>
              <Link
                href={item.href}
                className="mt-3.5 inline-flex items-center gap-1 text-xs font-semibold text-[#0096c8] transition group-hover:gap-1.5 dark:text-[#38bdf8]"
              >
                <span>Continue</span>
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex items-center justify-between border-t border-console-border/80 pt-3.5 text-xs text-console-muted">
          <span>Need architectural guidance or code samples?</span>
          <a
            href={siteConfig.quickstartUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#0096c8] transition hover:text-[#007ba4] dark:text-[#38bdf8]"
          >
            <span>Full quickstart guide</span>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </a>
        </div>
      </Panel>
    </div>
  );
}
