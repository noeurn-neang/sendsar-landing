"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { LoadingButton, StatusPill } from "@/components/dashboard/ui";
import type { TenantAppView } from "@/lib/control-plane/settings";

type AppDetail = {
  id: string;
  appCode: string;
  name: string;
  pushPayloadType: string;
  hasOneSignal: boolean;
  hasFcm: boolean;
  hasPushy: boolean;
  oneSignalAppId: string | null;
  hasOneSignalRestKey: boolean;
  hasFcmConfig: boolean;
  hasPushyConfig: boolean;
};

type Mode = { type: "create" } | { type: "edit"; appCode: string };

function normalizeAppCodeLocal(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-console-fg">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-console-muted">{hint}</span> : null}
    </label>
  );
}

function inputClass(mono?: boolean) {
  return `h-9 w-full rounded-lg border border-console-border bg-console-canvas px-3 text-sm text-console-fg outline-none transition focus:border-brand/50 disabled:opacity-60 ${
    mono ? "font-mono text-xs" : ""
  }`;
}

function pushSummary(app: TenantAppView) {
  const providers = [
    app.hasOneSignal ? "OneSignal" : null,
    app.hasFcm ? "FCM" : null,
    app.hasPushy ? "Pushy" : null,
  ].filter(Boolean);
  return providers.length > 0 ? providers.join(" · ") : "No push configured";
}

export function AppsManager({ apps: initialApps }: { apps: TenantAppView[] }) {
  const router = useRouter();
  const [apps, setApps] = useState(initialApps);
  const [mode, setMode] = useState<Mode | null>(null);
  const [refreshing, startTransition] = useTransition();

  useEffect(() => {
    setApps(initialApps);
  }, [initialApps]);

  function closeModal() {
    setMode(null);
  }

  function onSaved(app: TenantAppView) {
    setApps((prev) => {
      const idx = prev.findIndex((row) => row.appCode === app.appCode);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = app;
        return next;
      }
      return [...prev, app].sort((a, b) => {
        if (a.appCode === "default") return -1;
        if (b.appCode === "default") return 1;
        return a.name.localeCompare(b.name);
      });
    });
    closeModal();
    startTransition(() => router.refresh());
  }

  function onDeleted(appCode: string) {
    setApps((prev) => prev.filter((app) => app.appCode !== appCode));
    closeModal();
    startTransition(() => router.refresh());
  }

  return (
    <>
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="min-w-0 sm:max-w-[38%]">
          <p className="text-sm font-medium text-console-fg">Client apps</p>
          <p className="mt-0.5 text-sm leading-relaxed text-console-muted">
            Optional for chat and calls. Attach push credentials when you need mobile notifications.
          </p>
        </div>
        <button
          type="button"
          className="console-btn-secondary shrink-0 self-start sm:self-center"
          disabled={refreshing}
          onClick={() => setMode({ type: "create" })}
        >
          New app
        </button>
      </div>

      {apps.length === 0 ? (
        <div className="border-t border-console-border px-5 py-8 text-center text-sm text-console-muted">
          No apps yet. Create one to attach push credentials.
        </div>
      ) : (
        <div className="border-t border-console-border">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-console-muted">
            <span>App</span>
            <span className="pr-16 text-right sm:pr-20">Push</span>
          </div>
          <ul className="divide-y divide-console-border border-t border-console-border">
            {apps.map((app) => (
              <li
                key={app.appCode}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-console-fg">{app.name}</p>
                    <StatusPill>{app.appCode}</StatusPill>
                    {app.appCode === "default" ? (
                      <StatusPill tone="success">default</StatusPill>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-console-muted">
                    Payload {app.pushPayloadType}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden text-xs text-console-muted sm:inline">
                    {pushSummary(app)}
                  </span>
                  <button
                    type="button"
                    className="console-btn-secondary shrink-0"
                    onClick={() => setMode({ type: "edit", appCode: app.appCode })}
                  >
                    Manage
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mode ? (
        <AppModal mode={mode} onClose={closeModal} onSaved={onSaved} onDeleted={onDeleted} />
      ) : null}
    </>
  );
}

function AppModal({
  mode,
  onClose,
  onSaved,
  onDeleted,
}: {
  mode: Mode;
  onClose: () => void;
  onSaved: (app: TenantAppView) => void;
  onDeleted: (appCode: string) => void;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const isCreate = mode.type === "create";

  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [appCode, setAppCode] = useState("");
  const [name, setName] = useState("");
  const [pushPayloadType, setPushPayloadType] = useState("FULL");
  const [oneSignalAppId, setOneSignalAppId] = useState("");
  const [oneSignalRestApiKey, setOneSignalRestApiKey] = useState("");
  const [hasOneSignalRestKey, setHasOneSignalRestKey] = useState(false);
  const [clearOneSignal, setClearOneSignal] = useState(false);
  const [hasFcmConfig, setHasFcmConfig] = useState(false);
  const [hasPushyConfig, setHasPushyConfig] = useState(false);
  const [fcmJson, setFcmJson] = useState("");
  const [clearFcm, setClearFcm] = useState(false);
  const [pushyJson, setPushyJson] = useState("");
  const [clearPushy, setClearPushy] = useState(false);

  const normalizedCode = useMemo(() => normalizeAppCodeLocal(appCode), [appCode]);
  const canSave = isCreate
    ? Boolean(normalizedCode && name.trim())
    : Boolean(name.trim());
  const canDelete =
    !isCreate && appCode !== "default" && deleteConfirmText.trim() === appCode;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("input,button,select,textarea")?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  useEffect(() => {
    if (isCreate) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const code = mode.type === "edit" ? mode.appCode : "";
        const response = await fetch(`/api/apps/${encodeURIComponent(code)}`);
        const payload = (await response.json()) as { app?: AppDetail; error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Could not load app");
        if (cancelled || !payload.app) return;
        const app = payload.app;
        setAppCode(app.appCode);
        setName(app.name);
        setPushPayloadType(app.pushPayloadType || "FULL");
        setOneSignalAppId(app.oneSignalAppId ?? "");
        setHasOneSignalRestKey(app.hasOneSignalRestKey);
        setHasFcmConfig(app.hasFcmConfig);
        setHasPushyConfig(app.hasPushyConfig);
        setShowAdvanced(app.hasFcmConfig || app.hasPushyConfig);
        setFcmJson("");
        setPushyJson("");
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Could not load app");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [isCreate, mode]);

  async function save() {
    if (!canSave) return;
    if (clearOneSignal || clearFcm || clearPushy) {
      const ok = window.confirm(
        "This will permanently remove the selected push credentials. Continue?",
      );
      if (!ok) return;
    }

    setSaving(true);
    setError(null);
    try {
      const body = {
        name: name.trim(),
        pushPayloadType,
        oneSignalAppId: clearOneSignal ? null : oneSignalAppId.trim() || null,
        oneSignalRestApiKey: clearOneSignal ? null : oneSignalRestApiKey.trim() || null,
        clearOneSignal,
        fcmJson: clearFcm ? null : fcmJson,
        clearFcm,
        pushyJson: clearPushy ? null : pushyJson,
        clearPushy,
        ...(isCreate ? { appCode: normalizedCode } : {}),
      };

      const response = await fetch(
        isCreate ? "/api/apps" : `/api/apps/${encodeURIComponent(appCode)}`,
        {
          method: isCreate ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const payload = (await response.json()) as { app?: TenantAppView; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not save app");
      if (!payload.app) throw new Error("Could not save app");
      onSaved(payload.app);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save app");
    } finally {
      setSaving(false);
    }
  }

  async function removeApp() {
    if (!canDelete) return;
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/apps/${encodeURIComponent(appCode)}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not delete app");
      onDeleted(appCode);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete app");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-console-border bg-console-panel shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-console-border px-5 py-4">
          <div>
            <h3 id={titleId} className="text-base font-semibold text-console-fg">
              {isCreate ? "Create app" : "Manage app"}
            </h3>
            <p className="mt-0.5 text-xs text-console-muted">
              {isCreate
                ? "Add a client app for push routing and multi-app setups."
                : "Update name and push credentials. App code cannot be changed."}
            </p>
          </div>
          <button type="button" className="console-icon-btn inline-flex" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-sm text-console-muted">Loading app…</p>
          ) : (
            <div className="space-y-4">
              {isCreate ? (
                <Field
                  label="App code"
                  hint={
                    normalizedCode && normalizedCode !== appCode.trim()
                      ? `Will save as: ${normalizedCode}`
                      : "Stable ID used in the API (e.g. default, driver, customer). Cannot be renamed later."
                  }
                >
                  <input
                    className={inputClass(true)}
                    value={appCode}
                    onChange={(e) => setAppCode(e.target.value.toLowerCase())}
                    placeholder="customer"
                    maxLength={48}
                  />
                </Field>
              ) : (
                <Field label="App code" hint="Immutable after creation — used by users and the API.">
                  <input className={inputClass(true)} value={appCode} readOnly disabled />
                </Field>
              )}

              <Field label="Display name">
                <input
                  className={inputClass()}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Customer app"
                  maxLength={80}
                />
              </Field>

              <Field label="Push payload" hint="FULL includes message preview text in the notification body.">
                <select
                  className={inputClass()}
                  value={pushPayloadType}
                  onChange={(e) => setPushPayloadType(e.target.value)}
                >
                  <option value="FULL">FULL</option>
                  <option value="DATA">DATA</option>
                </select>
              </Field>

              <div className="rounded-lg border border-console-border p-3">
                <p className="text-sm font-medium text-console-fg">OneSignal</p>
                <p className="mt-0.5 text-xs text-console-muted">
                  Primary push provider supported by the gateway today.
                </p>
                <div className="mt-3 space-y-3">
                  <input
                    className={inputClass(true)}
                    value={oneSignalAppId}
                    onChange={(e) => setOneSignalAppId(e.target.value)}
                    placeholder="App ID"
                    disabled={clearOneSignal}
                  />
                  <input
                    className={inputClass(true)}
                    type="password"
                    autoComplete="new-password"
                    value={oneSignalRestApiKey}
                    onChange={(e) => setOneSignalRestApiKey(e.target.value)}
                    placeholder={
                      hasOneSignalRestKey && !isCreate
                        ? "Leave blank to keep current REST key"
                        : "REST API key"
                    }
                    disabled={clearOneSignal}
                  />
                  {!isCreate && (hasOneSignalRestKey || oneSignalAppId) ? (
                    <label className="inline-flex items-center gap-2 text-xs text-console-muted">
                      <input
                        type="checkbox"
                        className="accent-[var(--brand)]"
                        checked={clearOneSignal}
                        onChange={(e) => setClearOneSignal(e.target.checked)}
                      />
                      Remove OneSignal config
                    </label>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                className="text-xs font-medium text-brand hover:text-brand-strong"
                onClick={() => setShowAdvanced((open) => !open)}
              >
                {showAdvanced ? "Hide advanced providers" : "Show FCM / Pushy (advanced)"}
              </button>

              {showAdvanced ? (
                <div className="space-y-4 rounded-lg border border-dashed border-console-border p-3">
                  <p className="text-xs text-amber-700 [.console-theme[data-theme=dark]_&]:text-amber-300">
                    FCM and Pushy configs are stored for future use. Gateway send is OneSignal-first today —
                    saving here does not enable FCM delivery yet.
                  </p>
                  <Field
                    label="FCM config (JSON)"
                    hint={
                      hasFcmConfig && !fcmJson && !clearFcm
                        ? "Configured. Leave blank to keep, or paste JSON to replace."
                        : "Optional JSON object. Secrets are never shown after save."
                    }
                  >
                    <textarea
                      className="min-h-[88px] w-full rounded-lg border border-console-border bg-console-canvas px-3 py-2 font-mono text-xs text-console-fg outline-none focus:border-brand/50 disabled:opacity-60"
                      value={fcmJson}
                      onChange={(e) => setFcmJson(e.target.value)}
                      placeholder={hasFcmConfig ? "•••• configured — paste JSON to replace" : '{"projectId":"..."}'}
                      disabled={clearFcm}
                    />
                    {!isCreate && hasFcmConfig ? (
                      <label className="mt-2 inline-flex items-center gap-2 text-xs text-console-muted">
                        <input
                          type="checkbox"
                          className="accent-[var(--brand)]"
                          checked={clearFcm}
                          onChange={(e) => setClearFcm(e.target.checked)}
                        />
                        Remove FCM config
                      </label>
                    ) : null}
                  </Field>
                  <Field
                    label="Pushy config (JSON)"
                    hint={
                      hasPushyConfig && !pushyJson && !clearPushy
                        ? "Configured. Leave blank to keep, or paste JSON to replace."
                        : "Optional. Secrets are never shown after save."
                    }
                  >
                    <textarea
                      className="min-h-[88px] w-full rounded-lg border border-console-border bg-console-canvas px-3 py-2 font-mono text-xs text-console-fg outline-none focus:border-brand/50 disabled:opacity-60"
                      value={pushyJson}
                      onChange={(e) => setPushyJson(e.target.value)}
                      placeholder={hasPushyConfig ? "•••• configured — paste JSON to replace" : '{"apiKey":"..."}'}
                      disabled={clearPushy}
                    />
                    {!isCreate && hasPushyConfig ? (
                      <label className="mt-2 inline-flex items-center gap-2 text-xs text-console-muted">
                        <input
                          type="checkbox"
                          className="accent-[var(--brand)]"
                          checked={clearPushy}
                          onChange={(e) => setClearPushy(e.target.checked)}
                        />
                        Remove Pushy config
                      </label>
                    ) : null}
                  </Field>
                </div>
              ) : null}

              {!isCreate && appCode !== "default" ? (
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                  <p className="text-sm font-medium text-console-fg">Delete app</p>
                  <p className="mt-0.5 text-xs text-console-muted">
                    Users linked to this app code will be detached. The default app cannot be deleted.
                  </p>
                  {confirmDelete ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-console-muted">
                        Type <span className="font-mono text-console-fg">{appCode}</span> to confirm.
                      </p>
                      <input
                        className={inputClass(true)}
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder={appCode}
                      />
                      <button
                        type="button"
                        className="console-btn-secondary border-red-500/40 text-red-700 disabled:opacity-40 [.console-theme[data-theme=dark]_&]:text-red-300"
                        disabled={!canDelete || deleting}
                        onClick={() => void removeApp()}
                      >
                        {deleting ? "Deleting…" : "Delete permanently"}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="mt-3 text-xs font-medium text-red-700 hover:underline [.console-theme[data-theme=dark]_&]:text-red-300"
                      onClick={() => setConfirmDelete(true)}
                    >
                      I want to delete this app
                    </button>
                  )}
                </div>
              ) : null}

              {error ? (
                <p className="text-sm text-red-600 [.console-theme[data-theme=dark]_&]:text-red-300">
                  {error}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-console-border px-5 py-3">
          <LoadingButton
            variant="secondary"
            onClick={onClose}
            disabled={saving || deleting}
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            pending={saving}
            pendingLabel="Saving…"
            disabled={loading || deleting || !canSave}
            onClick={() => void save()}
          >
            {isCreate ? "Create app" : "Save changes"}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
