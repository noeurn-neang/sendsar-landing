import "server-only";

import { consoleFetch } from "@/lib/console-api";
import type { WebhookTestResult } from "@/lib/dashboard/webhook";

export type { WebhookTestResult };

export async function rotateTenantKeys(input: {
  accountId: string;
  tenantId: string;
}): Promise<{ apiKey: string; secretKey: string }> {
  return consoleFetch(`/v1/console/tenants/${input.tenantId}/keys/rotate`, {
    method: "POST",
    body: { accountId: input.accountId },
  });
}

export async function sendWebhookTest(input: {
  accountId: string;
  tenantId: string;
}): Promise<WebhookTestResult> {
  return consoleFetch(`/v1/console/tenants/${input.tenantId}/webhooks/test`, {
    method: "POST",
    body: { accountId: input.accountId },
  });
}

export async function getLastWebhookTest(
  tenantId: string,
): Promise<WebhookTestResult | null> {
  return consoleFetch(`/v1/console/tenants/${tenantId}/webhooks/last-test`, {
    allowEmpty: true,
  });
}
