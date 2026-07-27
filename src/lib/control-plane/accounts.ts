import "server-only";

import { consoleFetch } from "@/lib/console-api";
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

export async function getTenantCredentials(tenantId: string): Promise<{
  apiKey: string;
  secretKey: string;
  keysRevealed: boolean;
} | null> {
  return consoleFetch(`/v1/console/tenants/${tenantId}/credentials`, {
    allowEmpty: true,
  });
}

export async function markKeysRevealed(accountId: string): Promise<void> {
  await consoleFetch(`/v1/console/accounts/${accountId}/keys-revealed`, {
    method: "POST",
  });
}

export async function getTenantBrief(tenantId: string): Promise<{
  name: string;
  slug: string | null;
  plan: string;
} | null> {
  return consoleFetch(`/v1/console/tenants/${tenantId}/brief`, {
    allowEmpty: true,
  });
}

export { slugify };
