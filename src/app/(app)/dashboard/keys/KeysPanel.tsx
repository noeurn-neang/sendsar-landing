"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

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

type SecretId = "live" | "webhook";

const actionBtnClass =
  "rounded-md border border-console-border px-2.5 py-1 text-xs font-medium text-console-fg transition hover:border-brand/40 disabled:cursor-not-allowed disabled:opacity-40";

export function KeysPanel({
  maskedApiKey,
  maskedWebhookSecret,
  keysRevealed,
  welcome,
}: KeysPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update } = useSession();
  const secretsRef = useRef<{ apiKey: string; webhookSecret: string } | null>(null);
  const loadPromiseRef = useRef<Promise<boolean> | null>(null);

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [webhookSecret, setWebhookSecret] = useState<string | null>(null);
  const [showLive, setShowLive] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [loadingId, setLoadingId] = useState<SecretId | null>(null);
  const [loadingRotate, setLoadingRotate] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [copied, setCopied] = useState<SecretId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!welcome) {
      return;
    }
    void (async () => {
      const ok = await ensureSecrets();
      if (ok) {
        setShowLive(true);
        setShowWebhook(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [welcome]);

  function storeSecrets(nextApiKey: string, nextWebhook: string) {
    secretsRef.current = { apiKey: nextApiKey, webhookSecret: nextWebhook };
    setApiKey(nextApiKey);
    setWebhookSecret(nextWebhook);
  }

  async function ensureSecrets(): Promise<boolean> {
    if (secretsRef.current) {
      return true;
    }
    if (loadPromiseRef.current) {
      return loadPromiseRef.current;
    }

    loadPromiseRef.current = (async () => {
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
        if (!payload.apiKey || !payload.webhookSecret) {
          throw new Error("Could not reveal keys");
        }
        storeSecrets(payload.apiKey, payload.webhookSecret);
        if (!keysRevealed) {
          await update({ keysRevealed: true });
        }
        if (searchParams.get("welcome")) {
          router.replace("/dashboard/keys");
        }
        return true;
      } catch (revealError) {
        setError(revealError instanceof Error ? revealError.message : "Could not reveal keys");
        return false;
      } finally {
        loadPromiseRef.current = null;
      }
    })();

    return loadPromiseRef.current;
  }

  async function revealSecret(id: SecretId) {
    setError(null);
    setLoadingId(id);
    try {
      const ok = await ensureSecrets();
      if (!ok) {
        return;
      }
      if (id === "live") {
        setShowLive(true);
      } else {
        setShowWebhook(true);
      }
    } finally {
      setLoadingId(null);
    }
  }

  function hideSecret(id: SecretId) {
    if (id === "live") {
      setShowLive(false);
    } else {
      setShowWebhook(false);
    }
  }

  async function copySecret(id: SecretId) {
    const value = id === "live" ? apiKey : webhookSecret;
    if (!value || (id === "live" ? !showLive : !showWebhook)) {
      setError("Reveal this key first, then copy.");
      return;
    }
    setError(null);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setError("Copy failed — select the value and copy manually.");
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
      if (!payload.apiKey || !payload.webhookSecret) {
        throw new Error("Could not rotate keys");
      }
      storeSecrets(payload.apiKey, payload.webhookSecret);
      setShowLive(true);
      setShowWebhook(true);
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

      {error ? (
        <EmptyHint>
          <span className="text-red-600 [.console-theme[data-theme=dark]_&]:text-red-300">
            {error}
          </span>
        </EmptyHint>
      ) : null}

      {notice ? <EmptyHint>{notice}</EmptyHint> : null}

      <Panel title="Credentials" description="Masked until you reveal each secret">
        <div className="divide-y divide-console-border">
          <SecretRow
            label="Live secret"
            description="Authenticate your server with the Sendsar gateway"
            masked={maskedApiKey}
            value={apiKey}
            visible={showLive}
            loading={loadingId === "live"}
            copied={copied === "live"}
            onReveal={() => void revealSecret("live")}
            onHide={() => hideSecret("live")}
            onCopy={() => void copySecret("live")}
          />
          <SecretRow
            label="Webhook secret"
            description="Verify webhook signatures from Sendsar"
            masked={maskedWebhookSecret}
            value={webhookSecret}
            visible={showWebhook}
            loading={loadingId === "webhook"}
            copied={copied === "webhook"}
            onReveal={() => void revealSecret("webhook")}
            onHide={() => hideSecret("webhook")}
            onCopy={() => void copySecret("webhook")}
          />
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
              gateway cache expires. Confirm below.
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
  description,
  masked,
  value,
  visible,
  loading,
  copied,
  onReveal,
  onHide,
  onCopy,
}: {
  label: string;
  description: string;
  masked: string;
  value: string | null;
  visible: boolean;
  loading: boolean;
  copied: boolean;
  onReveal: () => void;
  onHide: () => void;
  onCopy: () => void;
}) {
  const display = visible && value ? value : masked;
  const canCopy = Boolean(visible && value);

  return (
    <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-console-fg">{label}</p>
          <StatusPill tone="success">Active</StatusPill>
        </div>
        <p className="text-xs text-console-muted">{description}</p>
        <code className="block break-all rounded-md bg-console-canvas px-2.5 py-2 font-mono text-xs text-console-fg">
          {loading ? "Loading…" : display}
        </code>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 sm:pt-6">
        {visible ? (
          <button type="button" className={actionBtnClass} onClick={onHide}>
            Hide
          </button>
        ) : (
          <button type="button" className={actionBtnClass} onClick={onReveal} disabled={loading}>
            {loading ? "Revealing…" : "Reveal"}
          </button>
        )}
        <button type="button" className={actionBtnClass} onClick={onCopy} disabled={!canCopy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
