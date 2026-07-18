import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
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
  if (!session?.user?.tenantId) {
    redirect("/start");
  }

  const planId = session.user.plan ?? "free";
  const planName = getPlanDisplayName(planId);
  const [usage, lastWebhookTest] = await Promise.all([
    getTenantUsageSnapshot({
      tenantId: session.user.tenantId,
      planId,
    }),
    getLastWebhookTest(session.user.tenantId),
  ]);

  const nextStep = !session.user.keysRevealed
    ? {
        title: "Reveal your API keys",
        body: "Copy the live secret and webhook signing secret once — store them in your server env.",
        href: "/dashboard/keys?welcome=1",
        cta: "Open API keys",
      }
    : !lastWebhookTest
      ? {
          title: "Configure webhooks",
          body: "Add an endpoint URL and send a test event so your backend receives room and message events.",
          href: "/dashboard/settings",
          cta: "Open Settings",
        }
      : {
          title: "Follow the quickstart",
          body: "Mint end-user JWTs from your BFF and connect the chat SDK.",
          href: siteConfig.quickstartUrl,
          cta: "Open quickstart",
          external: true,
        };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Overview"
        description="Plan health, live usage for this month, and what to do next."
        actions={
          <>
            <Link href="/dashboard/keys" className="console-btn-primary">
              API keys
            </Link>
            <a
              href={siteConfig.quickstartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="console-btn-secondary"
            >
              Quickstart
            </a>
          </>
        }
      />

      <EmptyHint>
        Meters are computed from live gateway data for {usage.periodLabel}.{" "}
        {usage.approxNote}
      </EmptyHint>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Active chatters"
          value={formatCount(usage.activeChatters.used)}
          hint={`${usagePercent(usage.activeChatters.used, usage.activeChatters.limit)}% of ${formatCount(usage.activeChatters.limit)} / mo`}
          progress={usagePercent(usage.activeChatters.used, usage.activeChatters.limit)}
        />
        <MetricCard
          label="Messages"
          value={formatCount(usage.messages.used)}
          hint={`${usagePercent(usage.messages.used, usage.messages.limit)}% of ${formatCount(usage.messages.limit)} / mo`}
          progress={usagePercent(usage.messages.used, usage.messages.limit)}
        />
        <MetricCard
          label="Voice minutes"
          value={formatMinutes(usage.voiceMinutes.used)}
          hint={`${usagePercent(usage.voiceMinutes.used, usage.voiceMinutes.limit)}% of ${formatCount(usage.voiceMinutes.limit)} / mo`}
          progress={usagePercent(usage.voiceMinutes.used, usage.voiceMinutes.limit)}
        />
        <MetricCard
          label="Storage"
          value={`${usage.storageGB.used} GB`}
          hint={`${usagePercent(usage.storageGB.used, usage.storageGB.limit)}% of ${usage.storageGB.limit} GB`}
          progress={usagePercent(usage.storageGB.used, usage.storageGB.limit)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Project"
          description="Current tenant workspace"
          action={<StatusPill tone="success">{planName}</StatusPill>}
        >
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-console-muted">Name</dt>
              <dd className="mt-0.5 font-medium text-console-fg">{session.user.tenantName}</dd>
            </div>
            <div>
              <dt className="text-console-muted">Tenant ID</dt>
              <dd className="mt-0.5 font-mono text-xs text-console-fg">{session.user.tenantId}</dd>
            </div>
            <div>
              <dt className="text-console-muted">Slug</dt>
              <dd className="mt-0.5 font-mono text-xs text-console-fg">
                {session.user.tenantSlug ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-console-muted">Users · Rooms</dt>
              <dd className="mt-0.5 font-mono text-xs text-console-fg">
                {formatCount(usage.userCount)} · {formatCount(usage.roomCount)}
              </dd>
            </div>
          </dl>
        </Panel>

        <Panel
          title="This period"
          description={usage.periodLabel}
          action={
            <Link href="/dashboard/usage" className="text-sm font-medium text-brand hover:text-brand-strong">
              Details
            </Link>
          }
        >
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between gap-4">
              <span className="text-console-muted">Video minutes</span>
              <span className="font-mono text-console-fg">
                {formatMinutes(usage.videoMinutes.used)} / {formatCount(usage.videoMinutes.limit)}
              </span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-console-muted">Webhook test</span>
              <span className="text-console-fg">
                {lastWebhookTest ? (
                  lastWebhookTest.ok ? (
                    <StatusPill tone="success">OK</StatusPill>
                  ) : (
                    <StatusPill tone="warning">Failed</StatusPill>
                  )
                ) : (
                  "Not tested"
                )}
              </span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-console-muted">Billing</span>
              <Link href="/dashboard/billing" className="font-medium text-brand hover:text-brand-strong">
                Manage plan
              </Link>
            </li>
          </ul>
        </Panel>
      </div>

      <Panel title="Next step" description="Recommended path to go live">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-console-fg">{nextStep.title}</p>
            <p className="mt-1 text-sm text-console-muted">{nextStep.body}</p>
          </div>
          {"external" in nextStep && nextStep.external ? (
            <a
              href={nextStep.href}
              target="_blank"
              rel="noopener noreferrer"
              className="console-btn-primary shrink-0"
            >
              {nextStep.cta}
            </a>
          ) : (
            <Link href={nextStep.href} className="console-btn-primary shrink-0">
              {nextStep.cta}
            </Link>
          )}
        </div>
      </Panel>

      <Panel
        title="Get started"
        description="Wire your backend the same way LiveKit Cloud expects API keys on the server."
      >
        <ol className="grid gap-3 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Copy your API key",
              body: "Server key + webhook secret — reveal once, then rotate if needed.",
              href: "/dashboard/keys",
            },
            {
              step: "2",
              title: "Set webhook + quickstart",
              body: "Point Settings → Webhooks at your BFF, then follow the docs.",
              href: "/dashboard/settings",
            },
            {
              step: "3",
              title: "Watch usage",
              body: "Meters update from live messages, calls, and storage.",
              href: "/dashboard/usage",
            },
          ].map((item) => (
            <li
              key={item.step}
              className="rounded-lg border border-console-border bg-console-canvas/80 p-4 transition hover:border-brand/25"
            >
              <p className="font-mono text-xs text-console-muted">Step {item.step}</p>
              <p className="mt-1 text-sm font-semibold text-console-fg">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-console-muted">{item.body}</p>
              <Link
                href={item.href}
                className="mt-3 inline-block text-sm font-medium text-brand hover:text-brand-strong"
              >
                Continue →
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-console-muted">
          Full guide:{" "}
          <a
            href={siteConfig.quickstartUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand hover:text-brand-strong"
          >
            {siteConfig.quickstartUrl}
          </a>
        </p>
      </Panel>
    </div>
  );
}
