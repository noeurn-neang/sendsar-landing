import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import { consoleFetch } from "@/lib/console-api";
import { consoleFetchSoft } from "@/lib/console-api-soft";
import type { WebhookTestResult } from "@/lib/dashboard/webhook";

export type ChatSettings = {
  deletedMessageDisplay: "placeholder" | "hidden";
  deletedMessagePlaceholder: string;
};

export type CallSettings = {
  enabled: boolean;
  maxParticipants: number;
  defaultType: "audio" | "video";
  ringTimeoutSeconds: number;
};

export type TenantSettingsView = {
  id: string;
  name: string;
  slug: string | null;
  plan: string;
  status: string;
  webhookUrl: string | null;
  createdAt: string | null;
  chat: ChatSettings;
  calls: CallSettings;
};

export type AccountSettingsView = {
  email: string;
  name: string | null;
  provider: string;
  avatarUrl: string | null;
  lastLoginAt: string | null;
};

export type TenantAppView = {
  id: string;
  appCode: string;
  name: string;
  pushPayloadType: string;
  hasOneSignal: boolean;
  hasFcm: boolean;
  hasPushy: boolean;
};

export type SettingsPageData = {
  tenant: TenantSettingsView;
  account: AccountSettingsView;
  apps: TenantAppView[];
  lastWebhookTest: WebhookTestResult | null;
};

async function fetchSettingsPageData(input: {
  accountId: string;
  tenantId: string;
}): Promise<SettingsPageData | null> {
  return consoleFetchSoft<SettingsPageData | null>(
    `/v1/console/tenants/${input.tenantId}/settings`,
    {
      query: { accountId: input.accountId },
    },
  );
}

/** Request-deduped + short-lived cache for rapid Settings nav. */
export const getSettingsPageData = cache(
  async (input: { accountId: string; tenantId: string }) => {
    return unstable_cache(
      () => fetchSettingsPageData(input),
      ["settings-page-v1", input.tenantId, input.accountId],
      {
        revalidate: 30,
        tags: [`settings:${input.tenantId}`],
      },
    )();
  },
);

export type UpdateSettingsInput = {
  accountId: string;
  tenantId: string;
  workspaceName?: string;
  workspaceSlug?: string;
  webhookUrl?: string | null;
  chat?: Partial<ChatSettings>;
  calls?: Partial<CallSettings>;
};

export async function updateTenantSettings(
  input: UpdateSettingsInput,
): Promise<TenantSettingsView> {
  const { tenantId, ...body } = input;
  return consoleFetch<TenantSettingsView>(`/v1/console/tenants/${tenantId}/settings`, {
    method: "PATCH",
    body,
  });
}
