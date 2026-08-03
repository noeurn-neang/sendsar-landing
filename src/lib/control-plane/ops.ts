import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import { consoleFetch } from "@/lib/console-api";
import { consoleFetchSoft } from "@/lib/console-api-soft";
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

async function fetchLastWebhookTest(
  accountId: string,
  tenantId: string,
): Promise<WebhookTestResult | null> {
  return consoleFetchSoft<WebhookTestResult>(
    `/v1/console/tenants/${tenantId}/webhooks/last-test`,
    { query: { accountId } },
  );
}

/** Short-lived cache — overview polls this on every visit. */
export const getLastWebhookTest = cache(async (accountId: string, tenantId: string) => {
  return unstable_cache(
    () => fetchLastWebhookTest(accountId, tenantId),
    ["webhook-last-test-v2", accountId, tenantId],
    {
      revalidate: 30,
      tags: [`webhook-test:${tenantId}`],
    },
  )();
});
