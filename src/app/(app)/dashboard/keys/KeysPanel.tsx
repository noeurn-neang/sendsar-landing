"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import {
  DashboardPageHeader,
  EmptyHint,
  LoadingButton,
  Panel,
  StatusPill,
} from "@/components/dashboard/ui";
import { siteConfig } from "@/lib/site";

type KeysPanelProps = {
  maskedApiKey: string;
  maskedWebhookSecret: string;
  keysRevealed: boolean;
  welcome: boolean;
};

export function KeysPanel({
  maskedApiKey,
  maskedWebhookSecret,
  keysRevealed,
  welcome,
}: KeysPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update } = useSession();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [webhookSecret, setWebhookSecret] = useState<string | null>(null);
  const [revealedFlag, setRevealedFlag] = useState(keysRevealed);
  const [loadingReveal, setLoadingReveal] = useState(false);
  const [loadingRotate, setLoadingRotate] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const shouldPromptReveal = welcome && !revealedFlag;

  useEffect(() => {
    setRevealedFlag(keysRevealed);
  }, [keysRevealed]);

  useEffect(() => {
    if (shouldPromptReveal && !loadingReveal && !apiKey) {
      void revealKeys();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPromptReveal]);

  async function revealKeys() {
    setLoadingReveal(true);
    setError(null);
    try {
      const response = await fetch("/api/keys/reveal", { method: "POST" });
      const payload = (await response.json()) as {
        apiKey?: string;
        webhookSecret?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not reveal keys");
      }
      setApiKey(payload.apiKey ?? null);
      setWebhookSecret(payload.webhookSecret ?? null);
      setRevealedFlag(true);
      await update({ keysRevealed: true });
      if (searchParams.get("welcome")) {
        router.replace("/dashboard/keys");
      }
    } catch (revealError) {
      setError(revealError instanceof Error ? revealError.message : "Could not reveal keys");
    } finally {
      setLoadingReveal(false);
    }
  }

  async function rotateKeys() {
    setLoadingRotate(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/keys/rotate", { method: "POST" });
      const payload = (await response.json()) as {
        apiKey?: string;
        webhookSecret?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not rotate keys");
      }
      setApiKey(payload.apiKey ?? null);
      setWebhookSecret(payload.webhookSecret ?? null);
      setRevealedFlag(true);
      setConfirmRotate(false);
      setNotice(
        "New keys generated. Old keys stop working after gateway cache expires (up to ~5 minutes). Update your server env now.",
      );
      await update({ keysRevealed: true });
      router.refresh();
    } catch (rotateError) {
      setError(rotateError instanceof Error ? rotateError.message : "Could not rotate keys");
    } finally {
      setLoadingRotate(false);
    }
  }

  async function copyValue(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setError("Copy failed — select the value and copy manually.");
    }
  }

  const liveKey = apiKey ?? maskedApiKey;
  const webhook = webhookSecret ?? maskedWebhookSecret;
  const canReveal = !revealedFlag && !apiKey;
  const showingFull = Boolean(apiKey && webhookSecret);

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="API keys"
        description="Server keys authenticate your backend to the Sendsar gateway. Never ship sk_* to Flutter, React Native, or the browser."
        actions={
          <a
            href={siteConfig.quickstartUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="console-btn-secondary"
          >
            Quickstart
          </a>
        }
      />

      {shouldPromptReveal || showingFull ? (
        <Panel
          title={showingFull && !shouldPromptReveal ? "New keys — copy now" : "Save your keys now"}
          description="Shown in full once — copy them to your password manager or server env"
        >
          {loadingReveal ? (
            <p className="text-sm text-console-muted">Loading your live credentials…</p>
          ) : (
            <div className="space-y-4">
              <SecretRow
                label="Live secret"
                value={liveKey}
                onCopy={() => void copyValue("api", liveKey)}
                copied={copied === "api"}
              />
              <SecretRow
                label="Webhook secret"
                value={webhook}
                onCopy={() => void copyValue("wh", webhook)}
                copied={copied === "wh"}
              />
            </div>
          )}
        </Panel>
      ) : null}

      {error ? (
        <EmptyHint>
          <span className="text-red-600 [.console-theme[data-theme=dark]_&]:text-red-300">
            {error}
          </span>
        </EmptyHint>
      ) : null}

      {notice ? <EmptyHint>{notice}</EmptyHint> : null}

      <EmptyHint>
        {revealedFlag || apiKey
          ? "Full secrets were already revealed. Rotate below if you need a new pair."
          : "Reveal once to copy live credentials to your server environment."}
      </EmptyHint>

      <Panel title="Credentials" description="Active keys for this tenant">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-console-border text-xs uppercase tracking-wide text-console-muted">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Key</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium"> </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-console-border">
                <td className="py-3.5 font-medium text-console-fg">Live secret</td>
                <td className="py-3.5">
                  <code className="rounded-md bg-console-canvas px-2 py-1 font-mono text-xs text-console-fg">
                    {liveKey}
                  </code>
                </td>
                <td className="py-3.5">
                  <StatusPill tone="success">Active</StatusPill>
                </td>
                <td className="py-3.5">
                  <div className="flex justify-end gap-2">
                    {canReveal ? (
                      <button
                        type="button"
                        className="rounded-md border border-console-border px-2.5 py-1 text-xs font-medium text-console-fg transition hover:border-brand/40"
                        onClick={() => void revealKeys()}
                        disabled={loadingReveal}
                      >
                        Reveal once
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="rounded-md border border-console-border px-2.5 py-1 text-xs font-medium text-console-fg transition hover:border-brand/40"
                      onClick={() => void copyValue("live", liveKey)}
                    >
                      {copied === "live" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 font-medium text-console-fg">Webhook secret</td>
                <td className="py-3.5">
                  <code className="rounded-md bg-console-canvas px-2 py-1 font-mono text-xs text-console-fg">
                    {webhook}
                  </code>
                </td>
                <td className="py-3.5">
                  <StatusPill tone="success">Active</StatusPill>
                </td>
                <td className="py-3.5">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="rounded-md border border-console-border px-2.5 py-1 text-xs font-medium text-console-fg transition hover:border-brand/40"
                      onClick={() => void copyValue("webhook", webhook)}
                    >
                      {copied === "webhook" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="Rotate keys"
        description="Generates a new live secret and webhook secret. Update your servers immediately."
      >
        {!confirmRotate ? (
          <button
            type="button"
            className="console-btn-secondary"
            onClick={() => setConfirmRotate(true)}
          >
            Rotate API keys…
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-console-muted">
              This invalidates the current pair. Old keys may work for up to ~5 minutes while the
              gateway cache expires. Type <span className="font-mono text-console-fg">rotate</span>{" "}
              is not required — confirm below.
            </p>
            <div className="flex flex-wrap gap-2">
              <LoadingButton
                pending={loadingRotate}
                pendingLabel="Rotating…"
                onClick={() => void rotateKeys()}
              >
                Yes, rotate now
              </LoadingButton>
              <LoadingButton
                variant="secondary"
                disabled={loadingRotate}
                onClick={() => setConfirmRotate(false)}
              >
                Cancel
              </LoadingButton>
            </div>
          </div>
        )}
        <p className="mt-4 text-xs text-console-muted">
          After rotating, re-check{" "}
          <Link href="/dashboard/settings" className="font-medium text-brand hover:text-brand-strong">
            webhook delivery
          </Link>{" "}
          with a test event.
        </p>
      </Panel>
    </div>
  );
}

function SecretRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-console-muted">{label}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <code className="break-all rounded-md bg-console-canvas px-2 py-1 font-mono text-xs text-console-fg">
          {value}
        </code>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-md border border-console-border px-2.5 py-1 text-xs font-medium text-console-fg transition hover:border-brand/40"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
