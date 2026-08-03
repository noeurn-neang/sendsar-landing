import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import { consoleFetch } from "@/lib/console-api";
import { consoleFetchSoft } from "@/lib/console-api-soft";
import { slugify } from "@/lib/control-plane/slug";

export type PlatformAccountRow = {
  id: string;
  provider: string;
  providerAccountId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  tenantId: string;
  onboardingCompleted: boolean;
  keysRevealed: boolean;
};

export type TenantRow = {
  id: string;
  name: string;
  slug: string | null;
  plan: string;
  status: string;
  apiKey: string;
  secretKey: string;
};

export type UpsertPlatformAccountResult = {
  accountId: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string | null;
  plan: string;
  onboardingCompleted: boolean;
  keysRevealed: boolean;
  isNew: boolean;
};

export type TenantCredentials = {
  apiKey: string;
  secretKey: string;
  keysRevealed: boolean;
};

export async function upsertPlatformAccount(input: {
  provider: string;
  providerAccountId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}): Promise<UpsertPlatformAccountResult> {
  return consoleFetch<UpsertPlatformAccountResult>("/v1/console/accounts/upsert", {
    method: "POST",
    body: input,
  });
}

export async function getAccountById(accountId: string): Promise<PlatformAccountRow | null> {
  return consoleFetch<PlatformAccountRow | null>(`/v1/console/accounts/${accountId}`, {
    allowEmpty: true,
  });
}

export async function completeOnboarding(input: {
  accountId: string;
  tenantId: string;
  workspaceName: string;
  workspaceSlug: string;
}): Promise<{ tenantName: string; tenantSlug: string }> {
  return consoleFetch("/v1/console/onboarding", {
    method: "POST",
    body: input,
  });
}

async function fetchTenantCredentials(
  accountId: string,
  tenantId: string,
): Promise<TenantCredentials | null> {
  return consoleFetchSoft<TenantCredentials>(
    `/v1/console/tenants/${tenantId}/credentials`,
    { query: { accountId } },
  );
}

/** Request-deduped + short-lived cache so rapid Keys nav does not stampede Contabo. */
export const getTenantCredentials = cache(async (accountId: string, tenantId: string) => {
  return unstable_cache(
    () => fetchTenantCredentials(accountId, tenantId),
    ["tenant-credentials-v2", accountId, tenantId],
    {
      revalidate: 30,
      tags: [`credentials:${tenantId}`],
    },
  )();
});

export async function markKeysRevealed(accountId: string): Promise<void> {
  await consoleFetch(`/v1/console/accounts/${accountId}/keys-revealed`, {
    method: "POST",
  });
}

export async function getTenantBrief(
  accountId: string,
  tenantId: string,
): Promise<{
  name: string;
  slug: string | null;
  plan: string;
} | null> {
  return consoleFetch(`/v1/console/tenants/${tenantId}/brief`, {
    allowEmpty: true,
    query: { accountId },
  });
}

export { slugify };
