import "server-only";

import { createHmac } from "node:crypto";

import type { WebhookTestResult } from "@/lib/dashboard/webhook";
import { generateApiKey, generateWebhookSecret } from "@/lib/control-plane/keys";

export type { WebhookTestResult };

export async function rotateTenantKeys(input: {
  accountId: string;
  tenantId: string;
}): Promise<{ apiKey: string; secretKey: string }> {
  const { getPool } = await import("@/lib/db");
  const client = await getPool().connect();
  const apiKey = generateApiKey();
  const secretKey = generateWebhookSecret();

  try {
    await client.query("BEGIN");

    const owned = await client.query<{ id: string }>(
      `SELECT t.id
       FROM tenants t
       INNER JOIN platform_accounts pa ON pa."tenantId" = t.id
       WHERE t.id = $1 AND pa.id = $2
       LIMIT 1`,
      [input.tenantId, input.accountId],
    );
    if (!owned.rows[0]) {
      throw new Error("Workspace not found");
    }

    await client.query(
      `UPDATE tenants
       SET "apiKey" = $2, "secretKey" = $3, "updatedAt" = NOW()
       WHERE id = $1`,
      [input.tenantId, apiKey, secretKey],
    );

    // Keys are returned once in the rotate response — mark as revealed.
    await client.query(
      `UPDATE platform_accounts
       SET "keysRevealed" = true, "updatedAt" = NOW()
       WHERE id = $1 AND "tenantId" = $2`,
      [input.accountId, input.tenantId],
    );

    await client.query("COMMIT");
    return { apiKey, secretKey };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function sendWebhookTest(input: {
  accountId: string;
  tenantId: string;
}): Promise<WebhookTestResult> {
  const { query } = await import("@/lib/db");
  const result = await query<{
    webhookUrl: string | null;
    secretKey: string;
  }>(
    `SELECT t."webhookUrl" AS "webhookUrl", t."secretKey"
     FROM tenants t
     INNER JOIN platform_accounts pa ON pa."tenantId" = t.id
     WHERE t.id = $1 AND pa.id = $2
     LIMIT 1`,
    [input.tenantId, input.accountId],
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Workspace not found");
  }
  if (!row.webhookUrl?.trim()) {
    throw new Error("Configure a webhook URL in Settings first");
  }

  const url = row.webhookUrl.trim();
  const payload = {
    event: "console.test",
    roomId: "console-test",
    message: {
      id: `test_${Date.now()}`,
      text: "Sendsar console webhook test",
      source: "sendsar-console",
    },
  };
  const body = JSON.stringify(payload);
  const signature =
    "sha256=" +
    createHmac("sha256", row.secretKey).update(body).digest("hex");

  const started = Date.now();
  const testedAt = new Date().toISOString();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "User-Agent": "Sendsar-Console/1.0",
      },
      body,
      signal: controller.signal,
    });
    clearTimeout(timer);
    const latencyMs = Date.now() - started;
    const ok = response.status >= 200 && response.status < 300;

    await storeWebhookTestResult(input.tenantId, {
      ok,
      statusCode: response.status,
      latencyMs,
      error: ok ? null : `HTTP ${response.status}`,
      testedAt,
      url,
    });

    return {
      ok,
      statusCode: response.status,
      latencyMs,
      error: ok ? null : `Endpoint returned HTTP ${response.status}`,
      testedAt,
      url,
    };
  } catch (error) {
    const latencyMs = Date.now() - started;
    const message =
      error instanceof Error
        ? error.name === "AbortError"
          ? "Request timed out after 10s"
          : error.message
        : "Delivery failed";

    await storeWebhookTestResult(input.tenantId, {
      ok: false,
      statusCode: null,
      latencyMs,
      error: message,
      testedAt,
      url,
    });

    return {
      ok: false,
      statusCode: null,
      latencyMs,
      error: message,
      testedAt,
      url,
    };
  }
}

async function storeWebhookTestResult(tenantId: string, result: WebhookTestResult) {
  const { query } = await import("@/lib/db");
  await query(
    `UPDATE tenants
     SET settings = jsonb_set(
       COALESCE(settings, '{}'::jsonb),
       '{console,lastWebhookTest}',
       $2::jsonb,
       true
     ),
     "updatedAt" = NOW()
     WHERE id = $1`,
    [tenantId, JSON.stringify(result)],
  );
}

export async function getLastWebhookTest(
  tenantId: string,
): Promise<WebhookTestResult | null> {
  const { query } = await import("@/lib/db");
  const result = await query<{ settings: unknown }>(
    `SELECT settings FROM tenants WHERE id = $1`,
    [tenantId],
  );
  const settings = result.rows[0]?.settings;
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return null;
  }
  const consoleMeta = (settings as Record<string, unknown>).console;
  if (!consoleMeta || typeof consoleMeta !== "object" || Array.isArray(consoleMeta)) {
    return null;
  }
  const last = (consoleMeta as Record<string, unknown>).lastWebhookTest;
  if (!last || typeof last !== "object" || Array.isArray(last)) {
    return null;
  }
  const row = last as Record<string, unknown>;
  if (typeof row.testedAt !== "string" || typeof row.url !== "string") {
    return null;
  }
  return {
    ok: Boolean(row.ok),
    statusCode: typeof row.statusCode === "number" ? row.statusCode : null,
    latencyMs: typeof row.latencyMs === "number" ? row.latencyMs : 0,
    error: typeof row.error === "string" ? row.error : null,
    testedAt: row.testedAt,
    url: row.url,
  };
}
