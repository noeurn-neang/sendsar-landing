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
    <div className="console-theme fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(94dvh,760px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-console-border bg-console-panel shadow-2xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-console-border bg-console-panel px-6 py-4">
          <div>
            <h3 id={titleId} className="text-base font-semibold text-console-fg">
              Test Push Notification
            </h3>
            <p className="mt-0.5 text-xs text-console-muted">
              App: <span className="font-mono font-medium text-console-fg">{app.name}</span>{" "}
              <span className="text-console-muted">({app.appCode})</span>
            </p>
          </div>
          <button
            type="button"
            className="console-icon-btn rounded-lg p-1.5 transition"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="flex flex-1 flex-col overflow-y-auto">
          <div className="space-y-4 p-6">
            <div>
              <label className="block text-xs font-semibold text-console-fg mb-1.5">
                Provider
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition text-center ${
                    provider === "AUTO"
                      ? "border-brand bg-brand/10 text-brand font-semibold shadow-xs"
                      : "border-console-border bg-console-canvas text-console-fg hover:bg-console-track"
                  }`}
                  onClick={() => setProvider("AUTO")}
                >
                  Auto-detect
                </button>
                <button
                  type="button"
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition text-center ${
                    provider === "ONESIGNAL"
                      ? "border-brand bg-brand/10 text-brand font-semibold shadow-xs"
                      : "border-console-border bg-console-canvas text-console-fg hover:bg-console-track"
                  }`}
                  onClick={() => setProvider("ONESIGNAL")}
                >
                  OneSignal
                </button>
                <button
                  type="button"
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition text-center ${
                    provider === "FCM"
                      ? "border-brand bg-brand/10 text-brand font-semibold shadow-xs"
                      : "border-console-border bg-console-canvas text-console-fg hover:bg-console-track"
                  }`}
                  onClick={() => setProvider("FCM")}
                >
                  Firebase (FCM)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-console-fg mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 w-full rounded-lg border border-console-border bg-console-canvas px-3 text-sm text-console-fg placeholder:text-console-muted/60 outline-none transition focus:border-brand/50"
                placeholder="Test Notification"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-console-fg mb-1.5">
                Description / Message
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-9 w-full rounded-lg border border-console-border bg-console-canvas px-3 text-sm text-console-fg placeholder:text-console-muted/60 outline-none transition focus:border-brand/50"
                placeholder="This is a test notification from Sendsar."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-console-fg">
                  Target Device Tokens / Subscription IDs
                </label>
                <span className="text-[11px] font-medium text-console-muted">
                  {tokens.length} token{tokens.length === 1 ? "" : "s"}
                </span>
              </div>
              <textarea
                rows={3}
                value={tokensRaw}
                onChange={(e) => setTokensRaw(e.target.value)}
                className="w-full rounded-lg border border-console-border bg-console-canvas p-3 font-mono text-xs text-console-fg placeholder:text-console-muted/60 outline-none transition focus:border-brand/50"
                placeholder="Paste device token(s) or OneSignal player ID(s), one per line or comma-separated"
              />
              <p className="mt-1.5 text-[11px] text-console-muted">
                For OneSignal: enter Player ID / Subscription ID. For Firebase: enter the device registration token.
              </p>
            </div>

            {/* Diagnostic Result */}
            {result ? (
              <div
                className={`rounded-xl border p-4 space-y-2 text-xs transition ${
                  result.success
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StatusPill tone={result.success ? "success" : "warning"}>
                      {result.success ? "Delivered" : "Delivery Issue"}
                    </StatusPill>
                    <span className="font-mono font-semibold text-console-fg">{result.provider}</span>
                  </div>
                  <span className="font-semibold text-console-fg">
                    {result.successfulCount} / {result.targetsCount} accepted
                  </span>
                </div>
                <p className="text-console-fg leading-relaxed">{result.details}</p>
                {result.errors && result.errors.length > 0 ? (
                  <ul className="mt-2 space-y-1.5 border-t border-console-border/40 pt-2 text-[11px] font-mono">
                    {result.errors.map((err, i) => (
                      <li key={i} className="text-red-700 dark:text-red-300">
                        • {err}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-700 dark:text-red-300">
                {error}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-console-border bg-console-panel px-6 py-3.5 mt-auto">
            <LoadingButton
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={sending}
            >
              Close
            </LoadingButton>
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
