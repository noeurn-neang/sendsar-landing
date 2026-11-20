"use client";

import { useEffect, useId, useRef, useState } from "react";

import { LoadingButton, StatusPill } from "@/components/dashboard/ui";
import type { PushTestResult } from "@/lib/control-plane/apps";
import type { TenantAppView } from "@/lib/control-plane/settings";

export function TestPushModal({
  app,
  onClose,
}: {
  app: TenantAppView | { appCode: string; name: string; hasOneSignal?: boolean; hasFcm?: boolean };
  onClose: () => void;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const [provider, setProvider] = useState<"AUTO" | "ONESIGNAL" | "FCM">("AUTO");
  const [title, setTitle] = useState("Test Notification");
  const [description, setDescription] = useState("This is a test notification from Sendsar.");
  const [tokensRaw, setTokensRaw] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<PushTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("input,textarea,button")?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const tokens = tokensRaw
    .split(/[\n,]/)
    .map((t) => t.trim())
    .filter(Boolean);

  const canSend = tokens.length > 0 && !sending;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;

    setSending(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/apps/${encodeURIComponent(app.appCode)}/push/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: provider === "AUTO" ? undefined : provider,
          title: title.trim(),
          description: description.trim(),
          tokens,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        result?: PushTestResult;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Push test request failed");
      }
      if (payload.result) {
        setResult(payload.result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send test push notification");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-console-border bg-console-card p-6 shadow-2xl transition max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-console-fg">
              Test Push Notification
            </h2>
            <p className="mt-1 text-xs text-console-muted">
              App: <span className="font-mono text-console-fg font-medium">{app.name}</span> ({app.appCode})
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1 text-console-muted hover:bg-console-canvas hover:text-console-fg transition"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-console-fg mb-1.5">
              Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition text-center ${
                  provider === "AUTO"
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-console-border bg-console-canvas text-console-muted hover:text-console-fg"
                }`}
                onClick={() => setProvider("AUTO")}
              >
                Auto-detect
              </button>
              <button
                type="button"
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition text-center ${
                  provider === "ONESIGNAL"
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-console-border bg-console-canvas text-console-muted hover:text-console-fg"
                }`}
                onClick={() => setProvider("ONESIGNAL")}
              >
                OneSignal
              </button>
              <button
                type="button"
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition text-center ${
                  provider === "FCM"
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-console-border bg-console-canvas text-console-muted hover:text-console-fg"
                }`}
                onClick={() => setProvider("FCM")}
              >
                Firebase (FCM)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-console-fg mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 w-full rounded-lg border border-console-border bg-console-canvas px-3 text-sm text-console-fg outline-none transition focus:border-brand/50"
              placeholder="Test Notification"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-console-fg mb-1">
              Description / Message
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-9 w-full rounded-lg border border-console-border bg-console-canvas px-3 text-sm text-console-fg outline-none transition focus:border-brand/50"
              placeholder="This is a test notification from Sendsar."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-console-fg">
                Target Device Tokens / Subscription IDs
              </label>
              <span className="text-[11px] text-console-muted">
                {tokens.length} token{tokens.length === 1 ? "" : "s"}
              </span>
            </div>
            <textarea
              rows={3}
              value={tokensRaw}
              onChange={(e) => setTokensRaw(e.target.value)}
              className="w-full rounded-lg border border-console-border bg-console-canvas p-2.5 font-mono text-xs text-console-fg outline-none transition focus:border-brand/50"
              placeholder="Paste device token(s) or OneSignal player ID(s), one per line or comma-separated"
            />
            <p className="mt-1 text-[11px] text-console-muted">
              For OneSignal: enter Player ID / Subscription ID. For Firebase: enter the device registration token.
            </p>
          </div>

          {result ? (
            <div
              className={`rounded-xl border p-3.5 space-y-1.5 ${
                result.success
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 [.console-theme[data-theme=dark]_&]:text-emerald-200"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-900 [.console-theme[data-theme=dark]_&]:text-amber-200"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StatusPill tone={result.success ? "success" : "warning"}>
                    {result.success ? "Success" : "Failed / Issue"}
                  </StatusPill>
                  <span className="text-xs font-medium font-mono">{result.provider}</span>
                </div>
                <span className="text-xs font-semibold">
                  {result.successfulCount} / {result.targetsCount} accepted
                </span>
              </div>
              <p className="text-xs">{result.details}</p>
              {result.errors && result.errors.length > 0 ? (
                <ul className="mt-2 space-y-1 border-t border-amber-500/20 pt-2 text-[11px] font-mono">
                  {result.errors.map((err, i) => (
                    <li key={i} className="text-red-700 [.console-theme[data-theme=dark]_&]:text-red-300">
                      • {err}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 [.console-theme[data-theme=dark]_&]:text-red-300">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="console-btn-secondary"
              onClick={onClose}
              disabled={sending}
            >
              Close
            </button>
            <LoadingButton
              type="submit"
              variant="primary"
              pending={sending}
              pendingLabel="Dispatching…"
              disabled={!canSend}
            >
              Send Test Push
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
