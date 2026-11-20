"use client";

import { useEffect, useId, useRef, useState } from "react";

import { LoadingButton, StatusPill } from "@/components/dashboard/ui";
import type { PushTestResult } from "@/lib/control-plane/apps";
import type { TenantAppView } from "@/lib/control-plane/settings";

type AppLike = TenantAppView | {
  appCode: string;
  name: string;
  hasOneSignal?: boolean;
  hasFcm?: boolean;
  hasPushy?: boolean;
};

export function TestPushModal({
  app,
  onClose,
}: {
  app: AppLike;
  onClose: () => void;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const hasOneSignal = Boolean(app.hasOneSignal);
  const hasFcm = Boolean(app.hasFcm);

  // Default provider to configured one if only one exists
  const defaultProvider = !hasOneSignal && hasFcm ? "FCM" : hasOneSignal && !hasFcm ? "ONESIGNAL" : "AUTO";
  const [provider, setProvider] = useState<"AUTO" | "ONESIGNAL" | "FCM">(defaultProvider);

  const [activeTab, setActiveTab] = useState<"test" | "docs">("test");
  const [title, setTitle] = useState("Test Notification");
  const [description, setDescription] = useState("Hello from Sendsar! This is a test push notification.");
  const [tokensRaw, setTokensRaw] = useState("");
  const [customDataRaw, setCustomDataRaw] = useState("");
  const [showCustomData, setShowCustomData] = useState(false);
  const [customDataError, setCustomDataError] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<PushTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

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

  const canSend = tokens.length > 0 && !sending && !customDataError;

  function handleCustomDataChange(val: string) {
    setCustomDataRaw(val);
    if (!val.trim()) {
      setCustomDataError(null);
      return;
    }
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        setCustomDataError("Custom data must be a JSON object (key-value pairs)");
      } else {
        setCustomDataError(null);
      }
    } catch {
      setCustomDataError("Invalid JSON syntax");
    }
  }

  function handleInsertSampleToken(type: "fcm" | "onesignal") {
    if (type === "onesignal") {
      setTokensRaw("b7e6d982-1234-4567-89ab-cdef01234567");
      setProvider("ONESIGNAL");
    } else {
      setTokensRaw("eA1Bc2DeFgH:APA91bG-mock-sample-device-token-1234567890abcdefghijklmnopqrstuvwxyz");
      setProvider("FCM");
    }
  }

  function copyToClipboard(text: string, label: string) {
    void navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(null), 2000);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;

    let parsedData: Record<string, unknown> | undefined;
    if (showCustomData && customDataRaw.trim()) {
      try {
        parsedData = JSON.parse(customDataRaw);
      } catch {
        setCustomDataError("Invalid JSON syntax");
        return;
      }
    }

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
          data: parsedData,
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

  const jsSnippet = `// In your React / Web client (after connect()):
await client.registerDeviceToken({
  provider: "${provider === "FCM" ? "FCM" : "ONESIGNAL"}",
  token: ${provider === "FCM" ? "fcmToken" : "oneSignalSubscriptionId"},
  platform: "web", // or "ios", "android"
});`;

  const flutterSnippet = `// In your Flutter app:
await client.registerDeviceToken(RegisterDeviceTokenParams(
  provider: "${provider === "FCM" ? "FCM" : "ONESIGNAL"}",
  token: ${provider === "FCM" ? "fcmToken" : "oneSignalSubscriptionId"},
  platform: "android", // or "ios"
));`;

  const curlSnippet = `curl -X POST "https://YOUR_API_HOST/v1/tenant-apps/${app.appCode}/push/test" \\
  -H "x-api-key: sk_YOUR_TENANT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "provider": "${provider === "AUTO" ? (hasOneSignal ? "ONESIGNAL" : "FCM") : provider}",
    "title": "${title}",
    "description": "${description}",
    "tokens": [${tokens.length > 0 ? tokens.map((t) => JSON.stringify(t)).join(", ") : '"TARGET_DEVICE_TOKEN"'}]
  }'`;

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
        className="relative z-10 flex max-h-[min(94dvh,820px)] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-console-border bg-console-panel shadow-2xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-console-border bg-console-panel px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 id={titleId} className="text-base font-semibold text-console-fg">
                Test Push Notification
              </h3>
              <StatusPill tone="neutral" dot={false}>
                {app.appCode}
              </StatusPill>
            </div>
            <p className="mt-1 text-xs text-console-muted">
              Simulate push dispatch directly through your app\x27s configured credentials.
            </p>
          </div>
          <button
            type="button"
            className="console-icon-btn rounded-lg p-1.5 transition text-console-muted hover:text-console-fg"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher: Test Push vs Developer Snippets */}
        <div className="flex border-b border-console-border bg-console-canvas px-6">
          <button
            type="button"
            className={`border-b-2 py-2.5 px-3 text-xs font-medium transition ${
              activeTab === "test"
                ? "border-brand text-brand font-semibold"
                : "border-transparent text-console-muted hover:text-console-fg"
            }`}
            onClick={() => setActiveTab("test")}
          >
            Send Test
          </button>
          <button
            type="button"
            className={`border-b-2 py-2.5 px-3 text-xs font-medium transition ${
              activeTab === "docs"
                ? "border-brand text-brand font-semibold"
                : "border-transparent text-console-muted hover:text-console-fg"
            }`}
            onClick={() => setActiveTab("docs")}
          >
            Developer Code & cURL
          </button>
        </div>

        {activeTab === "test" ? (
          /* Form Body */
          <form onSubmit={handleSend} className="flex flex-1 flex-col overflow-y-auto">
            <div className="space-y-4 p-6">
              {/* Provider Selector Cards */}
              <div>
                <label className="block text-xs font-semibold text-console-fg mb-1.5">
                  Target Push Provider
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    className={`rounded-xl border p-2.5 text-left transition flex flex-col justify-between ${
                      provider === "AUTO"
                        ? "border-brand bg-brand/10 text-brand ring-1 ring-brand"
                        : "border-console-border bg-console-canvas hover:border-console-border hover:bg-console-track text-console-fg"
                    }`}
                    onClick={() => setProvider("AUTO")}
                  >
                    <div>
                      <div className="text-xs font-semibold">Auto-detect</div>
                      <div className="text-[10px] text-console-muted mt-0.5">
                        {hasOneSignal && hasFcm
                          ? "OneSignal first"
                          : hasFcm
                          ? "Routes to FCM"
                          : hasOneSignal
                          ? "Routes to OneSignal"
                          : "Uses available"}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`rounded-xl border p-2.5 text-left transition flex flex-col justify-between ${
                      provider === "ONESIGNAL"
                        ? "border-brand bg-brand/10 text-brand ring-1 ring-brand"
                        : "border-console-border bg-console-canvas hover:border-console-border hover:bg-console-track text-console-fg"
                    }`}
                    onClick={() => setProvider("ONESIGNAL")}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">OneSignal</span>
                        {hasOneSignal ? (
                          <span className="h-2 w-2 rounded-full bg-emerald-500" title="Configured" />
                        ) : null}
                      </div>
                      <div className="text-[10px] text-console-muted mt-0.5">
                        {hasOneSignal ? "Configured" : "Not set up"}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`rounded-xl border p-2.5 text-left transition flex flex-col justify-between ${
                      provider === "FCM"
                        ? "border-brand bg-brand/10 text-brand ring-1 ring-brand"
                        : "border-console-border bg-console-canvas hover:border-console-border hover:bg-console-track text-console-fg"
                    }`}
                    onClick={() => setProvider("FCM")}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Firebase (FCM)</span>
                        {hasFcm ? (
                          <span className="h-2 w-2 rounded-full bg-emerald-500" title="Configured" />
                        ) : null}
                      </div>
                      <div className="text-[10px] text-console-muted mt-0.5">
                        {hasFcm ? "HTTP v1 ready" : "Not set up"}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Title & Body */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-console-fg mb-1">
                    Notification Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-9 w-full rounded-lg border border-console-border bg-console-canvas px-3 text-sm text-console-fg placeholder:text-console-muted/60 outline-none transition focus:border-brand/50"
                    placeholder="e.g. New Message"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-console-fg mb-1">
                    Message Body
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-9 w-full rounded-lg border border-console-border bg-console-canvas px-3 text-sm text-console-fg placeholder:text-console-muted/60 outline-none transition focus:border-brand/50"
                    placeholder="e.g. You received an update."
                  />
                </div>
              </div>

              {/* Tokens input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-console-fg">
                    Target Device Tokens / Subscription IDs
                  </label>
                  <div className="flex items-center gap-2">
                    {tokens.length === 0 ? (
                      <span className="text-[11px] text-console-muted">
                        Sample:{" "}
                        <button
                          type="button"
                          className="text-brand hover:underline"
                          onClick={() => handleInsertSampleToken("fcm")}
                        >
                          FCM
                        </button>{" "}
                        ·{" "}
                        <button
                          type="button"
                          className="text-brand hover:underline"
                          onClick={() => handleInsertSampleToken("onesignal")}
                        >
                          OneSignal
                        </button>
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-brand">
                        {tokens.length} token{tokens.length === 1 ? "" : "s"} entered
                      </span>
                    )}
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={tokensRaw}
                  onChange={(e) => setTokensRaw(e.target.value)}
                  className="w-full rounded-lg border border-console-border bg-console-canvas p-3 font-mono text-xs text-console-fg placeholder:text-console-muted/60 outline-none transition focus:border-brand/50"
                  placeholder="Paste target device tokens or OneSignal subscription IDs (one per line or comma-separated)"
                />
                <p className="mt-1 text-[11px] text-console-muted">
                  For Firebase: paste the FCM registration token from the mobile/web SDK. For OneSignal: paste the Subscription ID / Player ID.
                </p>
              </div>

              {/* Optional Custom Data JSON */}
              <div className="rounded-lg border border-console-border bg-console-canvas p-3">
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-xs font-semibold text-console-fg"
                  onClick={() => setShowCustomData((prev) => !prev)}
                >
                  <span>Optional: Custom Data Payload (JSON)</span>
                  <span className="text-console-muted text-xs font-normal">
                    {showCustomData ? "Hide" : "+ Add key-value data"}
                  </span>
                </button>
                {showCustomData ? (
                  <div className="mt-2 space-y-1">
                    <textarea
                      rows={2}
                      value={customDataRaw}
                      onChange={(e) => handleCustomDataChange(e.target.value)}
                      className="w-full rounded-md border border-console-border bg-console-panel p-2 font-mono text-xs text-console-fg outline-none focus:border-brand/50"
                      placeholder={'{"roomId": "room-uuid", "action": "open_chat"}'}
                    />
                    {customDataError ? (
                      <p className="text-[11px] text-red-600 dark:text-red-400">
                        {customDataError}
                      </p>
                    ) : (
                      <p className="text-[10px] text-console-muted">
                        Passed to client apps via data message payloads (for deep linking or custom notifications).
                      </p>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Results & Diagnostics */}
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
                        {result.success ? "Accepted" : "Delivery Issue"}
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
            <div className="flex items-center justify-between gap-2 border-t border-console-border bg-console-panel px-6 py-3.5 mt-auto">
              <span className="text-[11px] text-console-muted">
                Target App: <code className="font-mono text-console-fg">{app.appCode}</code>
              </span>
              <div className="flex items-center gap-2">
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
            </div>
          </form>
        ) : (
          /* Developer Quick Reference */
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-console-muted mb-2">
                1. Registering Device Tokens from Client SDKs
              </h4>
              <p className="text-xs text-console-muted mb-3 leading-relaxed">
                When a user logs into your client app, register their push subscription token with Sendsar so they receive offline notifications:
              </p>

              <div className="space-y-3">
                <div className="rounded-lg border border-console-border bg-console-canvas p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-console-fg">JavaScript / React SDK</span>
                    <button
                      type="button"
                      className="text-[11px] text-brand hover:underline"
                      onClick={() => copyToClipboard(jsSnippet, "js")}
                    >
                      {copiedSnippet === "js" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <pre className="overflow-x-auto font-mono text-[11px] text-console-fg leading-relaxed">
                    {jsSnippet}
                  </pre>
                </div>

                <div className="rounded-lg border border-console-border bg-console-canvas p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-console-fg">Flutter SDK</span>
                    <button
                      type="button"
                      className="text-[11px] text-brand hover:underline"
                      onClick={() => copyToClipboard(flutterSnippet, "flutter")}
                    >
                      {copiedSnippet === "flutter" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <pre className="overflow-x-auto font-mono text-[11px] text-console-fg leading-relaxed">
                    {flutterSnippet}
                  </pre>
                </div>
              </div>
            </div>

            <div className="border-t border-console-border pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-console-muted mb-2">
                2. Test via Direct cURL Command
              </h4>
              <p className="text-xs text-console-muted mb-3 leading-relaxed">
                You can trigger this exact push test endpoint directly via terminal or automated CI/CD pipeline:
              </p>

              <div className="rounded-lg border border-console-border bg-console-canvas p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-console-fg">cURL Request</span>
                  <button
                    type="button"
                    className="text-[11px] text-brand hover:underline"
                    onClick={() => copyToClipboard(curlSnippet, "curl")}
                  >
                    {copiedSnippet === "curl" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="overflow-x-auto font-mono text-[11px] text-console-fg leading-relaxed whitespace-pre-wrap break-all">
                  {curlSnippet}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                className="console-btn-secondary text-xs"
                onClick={() => setActiveTab("test")}
              >
                Back to Test Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
