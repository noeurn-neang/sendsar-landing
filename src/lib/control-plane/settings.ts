import "server-only";

import { consoleFetch } from "@/lib/console-api";

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
};

export async function getSettingsPageData(input: {
  accountId: string;
  tenantId: string;
}): Promise<SettingsPageData | null> {
  return consoleFetch<SettingsPageData | null>(
    `/v1/console/tenants/${input.tenantId}/settings`,
    {
      query: { accountId: input.accountId },
      allowEmpty: true,
    },
  );
}

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
