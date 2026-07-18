"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AppsManager } from "@/app/(app)/dashboard/settings/AppsManager";
import { WebhookTestControl } from "@/app/(app)/dashboard/settings/WebhookTestControl";
import { DashboardPageHeader, LoadingButton, StatusPill } from "@/components/dashboard/ui";
import type {
  AccountSettingsView,
  CallSettings,
  ChatSettings,
  TenantAppView,
  TenantSettingsView,
} from "@/lib/control-plane/settings";
import type { WebhookTestResult } from "@/lib/dashboard/webhook";
import { getPlanDisplayName } from "@/lib/pricing";
import { siteConfig } from "@/lib/site";
import { normalizeSlugInput } from "@/lib/control-plane/slug";

type SettingsPanelProps = {
  tenant: TenantSettingsView;
  account: AccountSettingsView;
  apps: TenantAppView[];
  lastWebhookTest: WebhookTestResult | null;
};

function SettingsSection({
  title,
  children,
  footer,
  layout = "rows",
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  layout?: "rows" | "custom";
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold tracking-tight text-console-fg">{title}</h2>
      <div className="overflow-hidden rounded-xl border border-console-border bg-console-panel">
        {layout === "rows" ? (
          <div className="divide-y divide-console-border">{children}</div>
        ) : (
          children
        )}
        {footer ? (
          <div className="flex items-center justify-end gap-3 border-t border-console-border px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(11rem,38%)_minmax(0,1fr)] sm:items-center sm:gap-8">
      <div className="min-w-0">
        <p className="text-sm font-medium text-console-fg">{title}</p>
        {description ? (
          <p className="mt-0.5 text-sm leading-relaxed text-console-muted">{description}</p>
        ) : null}
      </div>
      <div className="min-w-0 sm:max-w-md sm:justify-self-stretch">{children}</div>
    </div>
  );
}

function TextInput({
  className = "",
  mono,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { mono?: boolean }) {
  return (
    <input
      {...props}
      className={`h-9 w-full rounded-md border border-console-border bg-console-canvas px-3 text-sm text-console-fg outline-none transition placeholder:text-console-muted focus:border-brand/50 disabled:opacity-60 ${
        mono ? "font-mono text-xs" : ""
      } ${className}`}
    />
  );
}

function SelectInput({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-9 w-full rounded-md border border-console-border bg-console-canvas px-3 text-sm text-console-fg outline-none transition focus:border-brand/50 disabled:opacity-60 ${className}`}
    >
      {children}
    </select>
  );
}

function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2500);
    }
  }

  return (
    <div className="space-y-1">
      <div className="relative flex h-9 items-center rounded-md border border-console-border bg-console-canvas">
        <input
          readOnly
          value={value}
          className="h-full w-full min-w-0 truncate bg-transparent py-0 pl-3 pr-[4.5rem] font-mono text-xs text-console-fg outline-none"
        />
        <button
          type="button"
          onClick={() => void copy()}
          className="absolute right-1 inline-flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium text-console-muted transition hover:bg-console-sidebar-hover hover:text-console-fg"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
            <rect x="8" y="8" width="11" height="11" rx="1.5" />
            <path d="M6 16V6.5A1.5 1.5 0 0 1 7.5 5H16" strokeLinecap="round" />
          </svg>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {copyError ? (
        <p className="text-xs text-red-600 [.console-theme[data-theme=dark]_&]:text-red-300">
          Copy failed — select the value and copy manually.
        </p>
      ) : null}
    </div>
  );
}

function SaveFooter({
  dirty,
  saving,
  saved,
  error,
  onSave,
}: {
  dirty: boolean;
  saving: boolean;
  saved: boolean;
  error: string | null;
  onSave: () => void;
}) {
  return (
    <>
      {error ? (
        <p className="mr-auto text-xs text-red-600 [.console-theme[data-theme=dark]_&]:text-red-300">
          {error}
        </p>
      ) : saved ? (
        <p className="mr-auto text-xs text-emerald-700 [.console-theme[data-theme=dark]_&]:text-emerald-300">
          Saved
        </p>
      ) : null}
      <LoadingButton
        variant="primary"
        pending={saving}
        pendingLabel="Saving…"
        disabled={!dirty}
        onClick={onSave}
      >
        Save changes
      </LoadingButton>
    </>
  );
}

export function SettingsPanel({
  tenant,
  account,
  apps,
  lastWebhookTest,
}: SettingsPanelProps) {
  const router = useRouter();
  const { update } = useSession();

  const [serverTenant, setServerTenant] = useState(tenant);
  const [name, setName] = useState(tenant.name);
  const [slug, setSlug] = useState(tenant.slug ?? "");
  const [webhookUrl, setWebhookUrl] = useState(tenant.webhookUrl ?? "");
  const [chat, setChat] = useState<ChatSettings>(tenant.chat);
  const [calls, setCalls] = useState<CallSettings>(tenant.calls);

  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [signingOut, setSigningOut] = useState(false);

  const workspaceDirty = useMemo(
    () => name.trim() !== serverTenant.name || slug.trim() !== (serverTenant.slug ?? ""),
    [name, slug, serverTenant.name, serverTenant.slug],
  );

  const slugPreview = useMemo(() => (slug.trim() ? normalizeSlugInput(slug) : ""), [slug]);
  const slugWillChange = Boolean(slugPreview && slugPreview !== slug.trim());

  const webhookDirty = useMemo(
    () => webhookUrl.trim() !== (serverTenant.webhookUrl ?? ""),
    [webhookUrl, serverTenant.webhookUrl],
  );

  const messagingDirty = useMemo(
    () =>
      chat.deletedMessageDisplay !== serverTenant.chat.deletedMessageDisplay ||
      chat.deletedMessagePlaceholder !== serverTenant.chat.deletedMessagePlaceholder,
    [chat, serverTenant.chat],
  );

  const callsDirty = useMemo(
    () =>
      calls.enabled !== serverTenant.calls.enabled ||
      calls.maxParticipants !== serverTenant.calls.maxParticipants ||
      calls.defaultType !== serverTenant.calls.defaultType ||
      calls.ringTimeoutSeconds !== serverTenant.calls.ringTimeoutSeconds,
    [calls, serverTenant.calls],
  );

  async function save(section: "workspace" | "webhook" | "messaging" | "calls") {
    setSavingSection(section);
    setErrors((prev) => ({ ...prev, [section]: null }));
    setSavedSection(null);

    const body: Record<string, unknown> = {};
    if (section === "workspace") {
      body.workspaceName = name.trim();
      body.workspaceSlug = slug.trim();
    } else if (section === "webhook") {
      body.webhookUrl = webhookUrl.trim() || null;
    } else if (section === "messaging") {
      body.chat = chat;
    } else {
      body.calls = {
        ...calls,
        maxParticipants: Number(calls.maxParticipants),
        ringTimeoutSeconds: Number(calls.ringTimeoutSeconds),
      };
    }

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as {
        error?: string;
        tenant?: TenantSettingsView;
        session?: { tenantName: string; tenantSlug: string | null };
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not save settings");
      }

      if (payload.tenant) {
        setServerTenant(payload.tenant);
        if (section === "workspace") {
          setName(payload.tenant.name);
          setSlug(payload.tenant.slug ?? "");
        } else if (section === "webhook") {
          setWebhookUrl(payload.tenant.webhookUrl ?? "");
        } else if (section === "messaging") {
          setChat(payload.tenant.chat);
        } else {
          setCalls(payload.tenant.calls);
        }
      }

      if (payload.session) {
        await update({
          tenantName: payload.session.tenantName,
          tenantSlug: payload.session.tenantSlug,
        });
      }

      setSavedSection(section);
      router.refresh();
      setTimeout(() => setSavedSection((current) => (current === section ? null : current)), 2000);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [section]: error instanceof Error ? error.message : "Could not save settings",
      }));
    } finally {
      setSavingSection(null);
    }
  }

  const providerLabel =
    account.provider === "github"
      ? "GitHub"
      : account.provider === "google"
        ? "Google"
        : account.provider;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <DashboardPageHeader
        title="Settings"
        description="General configuration, webhooks, apps, and runtime defaults."
      />

      <SettingsSection
        title="General"
        footer={
          <SaveFooter
            dirty={workspaceDirty}
            saving={savingSection === "workspace"}
            saved={savedSection === "workspace"}
            error={errors.workspace ?? null}
            onSave={() => void save("workspace")}
          />
        }
      >
        <SettingRow title="Workspace name" description="Displayed throughout the console.">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            autoComplete="organization"
          />
        </SettingRow>
        <SettingRow
          title="Workspace slug"
          description="Stable handle for this workspace. Lowercase letters, numbers, hyphens."
        >
          <div className="space-y-1.5">
            <TextInput
              mono
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              maxLength={48}
            />
            {slugWillChange ? (
              <p className="text-xs text-console-muted">
                Will save as <span className="font-mono text-console-fg">{slugPreview}</span>
              </p>
            ) : null}
          </div>
        </SettingRow>
        <SettingRow title="Tenant ID" description="Use this ID when calling the gateway.">
          <CopyField value={tenant.id} />
        </SettingRow>
        <SettingRow title="Plan" description="Current billing plan for this workspace.">
          <div className="flex h-9 items-center gap-2">
            <StatusPill>{getPlanDisplayName(tenant.plan)}</StatusPill>
            <StatusPill tone={tenant.status === "active" ? "success" : "warning"}>
              {tenant.status}
            </StatusPill>
            <Link
              href="/dashboard/billing"
              className="text-xs font-medium text-brand hover:text-brand-strong"
            >
              Manage plan
            </Link>
          </div>
        </SettingRow>
      </SettingsSection>

      <SettingsSection
        title="Webhooks"
        footer={
          <SaveFooter
            dirty={webhookDirty}
            saving={savingSection === "webhook"}
            saved={savedSection === "webhook"}
            error={errors.webhook ?? null}
            onSave={() => void save("webhook")}
          />
        }
      >
        <SettingRow
          title="Endpoint URL"
          description="HTTPS URL for room, message, and call events. Leave blank to pause delivery. Prefer HTTPS in production."
        >
          <TextInput
            mono
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://api.yourapp.com/webhooks/sendsar"
          />
        </SettingRow>
        <SettingRow
          title="Signing secret"
          description="Verify webhook signatures with the secret from API keys."
        >
          <div className="flex h-9 items-center gap-3 text-sm">
            <Link href="/dashboard/keys" className="font-medium text-brand hover:text-brand-strong">
              Open API keys
            </Link>
            <span className="text-console-muted">·</span>
            <a
              href={`${siteConfig.docsUrl.replace(/\/$/, "")}/webhooks`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand hover:text-brand-strong"
            >
              Event docs
            </a>
          </div>
        </SettingRow>
        <SettingRow
          title="Delivery test"
          description="Posts a signed console.test event to your endpoint and records the result."
        >
          <WebhookTestControl
            hasUrl={Boolean(serverTenant.webhookUrl?.trim())}
            initialResult={lastWebhookTest}
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="Apps" layout="custom">
        <AppsManager apps={apps} />
      </SettingsSection>

      <SettingsSection
        title="Messaging"
        footer={
          <SaveFooter
            dirty={messagingDirty}
            saving={savingSection === "messaging"}
            saved={savedSection === "messaging"}
            error={errors.messaging ?? null}
            onSave={() => void save("messaging")}
          />
        }
      >
        <SettingRow
          title="Deleted messages"
          description="Show a placeholder in the thread, or hide deleted messages completely."
        >
          <SelectInput
            value={chat.deletedMessageDisplay}
            onChange={(e) =>
              setChat((prev) => ({
                ...prev,
                deletedMessageDisplay: e.target.value as ChatSettings["deletedMessageDisplay"],
              }))
            }
          >
            <option value="placeholder">Show placeholder</option>
            <option value="hidden">Hide entirely</option>
          </SelectInput>
        </SettingRow>
        <SettingRow
          title="Placeholder text"
          description="Shown when a message is deleted and display is set to placeholder."
        >
          <TextInput
            value={chat.deletedMessagePlaceholder}
            onChange={(e) =>
              setChat((prev) => ({
                ...prev,
                deletedMessagePlaceholder: e.target.value,
              }))
            }
            disabled={chat.deletedMessageDisplay === "hidden"}
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection
        title="Calls"
        footer={
          <SaveFooter
            dirty={callsDirty}
            saving={savingSection === "calls"}
            saved={savedSection === "calls"}
            error={errors.calls ?? null}
            onSave={() => void save("calls")}
          />
        }
      >
        <SettingRow
          title="Enable calls"
          description="When off, the gateway rejects new call sessions for this tenant."
        >
          <label className="inline-flex h-9 cursor-pointer items-center gap-2 text-sm text-console-fg">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-console-border accent-[var(--brand)]"
              checked={calls.enabled}
              onChange={(e) => setCalls((prev) => ({ ...prev, enabled: e.target.checked }))}
            />
            {calls.enabled ? "On" : "Off"}
          </label>
        </SettingRow>
        <SettingRow
          title="Default type"
          description="Used when a client starts a call without specifying audio or video."
        >
          <SelectInput
            value={calls.defaultType}
            disabled={!calls.enabled}
            onChange={(e) =>
              setCalls((prev) => ({
                ...prev,
                defaultType: e.target.value as CallSettings["defaultType"],
              }))
            }
          >
            <option value="video">Video</option>
            <option value="audio">Audio</option>
          </SelectInput>
        </SettingRow>
        <SettingRow
          title="Max participants"
          description="Hard cap for LiveKit rooms (2–32). Joins above this limit are blocked."
        >
          <TextInput
            type="number"
            min={2}
            max={32}
            disabled={!calls.enabled}
            value={calls.maxParticipants}
            onChange={(e) =>
              setCalls((prev) => ({
                ...prev,
                maxParticipants: Number(e.target.value),
              }))
            }
          />
        </SettingRow>
        <SettingRow
          title="Ring timeout"
          description="Seconds a 1:1 call can ring before the server marks it missed (15–120)."
        >
          <TextInput
            type="number"
            min={15}
            max={120}
            disabled={!calls.enabled}
            value={calls.ringTimeoutSeconds}
            onChange={(e) =>
              setCalls((prev) => ({
                ...prev,
                ringTimeoutSeconds: Number(e.target.value),
              }))
            }
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="Account">
        <SettingRow
          title="Signed-in user"
          description="Console account for this workspace. Profile comes from your OAuth provider."
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {account.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={account.avatarUrl}
                  alt=""
                  className="h-9 w-9 rounded-full border border-console-border object-cover"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                  {(account.name ?? account.email).slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-console-fg">
                  {account.name ?? account.email}
                </p>
                <p className="truncate text-xs text-console-muted">
                  {account.email} · {providerLabel}
                </p>
              </div>
            </div>
          </div>
        </SettingRow>
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-console-fg">Session</p>
            <p className="mt-0.5 text-sm text-console-muted">Sign out of the console on this device.</p>
          </div>
          <LoadingButton
            variant="secondary"
            className="shrink-0"
            pending={signingOut}
            pendingLabel="Signing out…"
            onClick={() => {
              setSigningOut(true);
              void signOut({ callbackUrl: "/" });
            }}
          >
            Sign out
          </LoadingButton>
        </div>
      </SettingsSection>
    </div>
  );
}
