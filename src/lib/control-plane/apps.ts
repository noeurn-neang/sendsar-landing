import "server-only";

import { consoleFetch } from "@/lib/console-api";

export type TenantAppSummary = {
  id: string;
  appCode: string;
  name: string;
  pushPayloadType: string;
  hasOneSignal: boolean;
  hasFcm: boolean;
  hasPushy: boolean;
  updatedAt: string | null;
};

export type TenantAppDetail = TenantAppSummary & {
  oneSignalAppId: string | null;
  hasOneSignalRestKey: boolean;
  /** True when FCM JSON exists — raw secrets are never returned. */
  hasFcmConfig: boolean;
  /** True when Pushy JSON exists — raw secrets are never returned. */
  hasPushyConfig: boolean;
};

export type UpsertTenantAppInput = {
  accountId: string;
  tenantId: string;
  appCode: string;
  name: string;
  pushPayloadType?: string;
  oneSignalAppId?: string | null;
  oneSignalRestApiKey?: string | null;
  clearOneSignal?: boolean;
  fcmJson?: string | null;
  clearFcm?: boolean;
  pushyJson?: string | null;
  clearPushy?: boolean;
};

function normalizeAppCode(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function listTenantApps(input: {
  accountId: string;
  tenantId: string;
}): Promise<TenantAppSummary[]> {
  return consoleFetch(`/v1/console/tenants/${input.tenantId}/apps`, {
    query: { accountId: input.accountId },
  });
}

export async function getTenantAppDetail(input: {
  accountId: string;
  tenantId: string;
  appCode: string;
}): Promise<TenantAppDetail | null> {
  return consoleFetch(
    `/v1/console/tenants/${input.tenantId}/apps/${encodeURIComponent(input.appCode)}`,
    {
      query: { accountId: input.accountId },
      allowEmpty: true,
    },
  );
}

export async function createTenantApp(
  input: UpsertTenantAppInput,
): Promise<TenantAppSummary> {
  const { tenantId, ...body } = input;
  return consoleFetch(`/v1/console/tenants/${tenantId}/apps`, {
    method: "POST",
    body,
  });
}

export async function updateTenantApp(
  input: UpsertTenantAppInput,
): Promise<TenantAppSummary> {
  const { tenantId, appCode, ...body } = input;
  return consoleFetch(
    `/v1/console/tenants/${tenantId}/apps/${encodeURIComponent(appCode)}`,
    {
      method: "PATCH",
      body: { ...body, appCode },
    },
  );
}

export async function deleteTenantApp(input: {
  accountId: string;
  tenantId: string;
  appCode: string;
}): Promise<void> {
  await consoleFetch(
    `/v1/console/tenants/${input.tenantId}/apps/${encodeURIComponent(input.appCode)}`,
    {
      method: "DELETE",
      query: { accountId: input.accountId },
    },
  );
}

export { normalizeAppCode };
