"use client";

import { useState } from "react";

import { LoadingButton, StatusPill } from "@/components/dashboard/ui";
import type { WebhookTestResult } from "@/lib/dashboard/webhook";

export function WebhookTestControl({
  hasUrl,
  initialResult,
}: {
  hasUrl: boolean;
  initialResult: WebhookTestResult | null;
}) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<WebhookTestResult | null>(initialResult);
  const [error, setError] = useState<string | null>(null);

  async function runTest() {
    setTesting(true);
    setError(null);
    try {
      const response = await fetch("/api/webhooks/test", { method: "POST" });
      const payload = (await response.json()) as {
        result?: WebhookTestResult;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Webhook test failed");
      }
      setResult(payload.result ?? null);
    } catch (testError) {
      setError(testError instanceof Error ? testError.message : "Webhook test failed");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <LoadingButton
          variant="secondary"
          pending={testing}
          pendingLabel="Sending…"
          disabled={!hasUrl}
          onClick={() => void runTest()}
        >
          Send test event
        </LoadingButton>
        {result ? (
          result.ok ? (
            <StatusPill tone="success">
              {result.statusCode} · {result.latencyMs}ms
            </StatusPill>
          ) : (
            <StatusPill tone="warning">Failed</StatusPill>
          )
        ) : null}
      </div>
      {!hasUrl ? (
        <p className="text-xs text-console-muted">Save an endpoint URL first, then send a test.</p>
      ) : null}
      {result ? (
        <p className="text-xs text-console-muted">
          Last test {new Date(result.testedAt).toLocaleString()}
          {result.error ? ` — ${result.error}` : " — signed console.test delivered."}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-red-600 [.console-theme[data-theme=dark]_&]:text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
