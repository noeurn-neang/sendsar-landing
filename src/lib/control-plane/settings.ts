import "server-only";

import { normalizeSlugInput } from "@/lib/control-plane/slug";

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

const DEFAULT_CHAT: ChatSettings = {
  deletedMessageDisplay: "placeholder",
  deletedMessagePlaceholder: "This message was deleted",
};

const DEFAULT_CALLS: CallSettings = {
  enabled: true,
  maxParticipants: 8,
  defaultType: "video",
  ringTimeoutSeconds: 45,
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function parseChat(settings: unknown): ChatSettings {
  const root = asRecord(settings);
  const chat = asRecord(root?.chat);
  const display = chat?.deletedMessageDisplay;
  const placeholder = chat?.deletedMessagePlaceholder;

  return {
    deletedMessageDisplay:
      display === "hidden" || display === "placeholder"
        ? display
        : DEFAULT_CHAT.deletedMessageDisplay,
    deletedMessagePlaceholder:
      typeof placeholder === "string" && placeholder.trim()
        ? placeholder.trim()
        : DEFAULT_CHAT.deletedMessagePlaceholder,
  };
}

function parseCalls(settings: unknown): CallSettings {
  const root = asRecord(settings);
  const calls = asRecord(root?.calls);

  const maxParticipants =
    typeof calls?.maxParticipants === "number"
      ? Math.floor(calls.maxParticipants)
      : DEFAULT_CALLS.maxParticipants;
  const ringTimeoutSeconds =
    typeof calls?.ringTimeoutSeconds === "number"
      ? Math.floor(calls.ringTimeoutSeconds)
      : DEFAULT_CALLS.ringTimeoutSeconds;
  const defaultType = calls?.defaultType;

  return {
    enabled: typeof calls?.enabled === "boolean" ? calls.enabled : DEFAULT_CALLS.enabled,
    maxParticipants:
      maxParticipants >= 2 && maxParticipants <= 32
        ? maxParticipants
        : DEFAULT_CALLS.maxParticipants,
    defaultType:
      defaultType === "audio" || defaultType === "video"
        ? defaultType
        : DEFAULT_CALLS.defaultType,
    ringTimeoutSeconds:
      ringTimeoutSeconds >= 15 && ringTimeoutSeconds <= 120
        ? ringTimeoutSeconds
        : DEFAULT_CALLS.ringTimeoutSeconds,
  };
}

function mergeSettingsJson(
  current: unknown,
  chat: ChatSettings,
  calls: CallSettings,
): Record<string, unknown> {
  const existing = { ...(asRecord(current) ?? {}) };
  existing.chat = {
    deletedMessageDisplay: chat.deletedMessageDisplay,
    deletedMessagePlaceholder: chat.deletedMessagePlaceholder,
  };
  existing.calls = {
    enabled: calls.enabled,
    maxParticipants: calls.maxParticipants,
    defaultType: calls.defaultType,
    ringTimeoutSeconds: calls.ringTimeoutSeconds,
  };
  return existing;
}

function isValidWebhookUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function getSettingsPageData(input: {
  accountId: string;
  tenantId: string;
}): Promise<SettingsPageData | null> {
  const { query } = await import("@/lib/db");
  const result = await query<{
    id: string;
    name: string;
    slug: string | null;
    plan: string;
    status: string;
    webhookUrl: string | null;
    settings: unknown;
    createdAt: Date | string | null;
    email: string;
    accountName: string | null;
    provider: string;
    avatarUrl: string | null;
    lastLoginAt: Date | string | null;
  }>(
    `SELECT t.id,
            t.name,
            t.slug,
            t.plan,
            t.status,
            t."webhookUrl" AS "webhookUrl",
            t.settings,
            t."createdAt" AS "createdAt",
            pa.email,
            pa.name AS "accountName",
            pa.provider,
            pa."avatarUrl" AS "avatarUrl",
            pa."lastLoginAt" AS "lastLoginAt"
     FROM tenants t
     INNER JOIN platform_accounts pa ON pa."tenantId" = t.id
     WHERE t.id = $1 AND pa.id = $2
     LIMIT 1`,
    [input.tenantId, input.accountId],
  );

  const row = result.rows[0];
  if (!row) return null;

  const appsResult = await query<{
    id: string;
    appCode: string;
    name: string;
    pushPayloadType: string;
    oneSignalConfig: unknown;
    fcmConfig: unknown;
    pushyConfig: unknown;
  }>(
    `SELECT id,
            "appCode" AS "appCode",
            name,
            "pushPayloadType" AS "pushPayloadType",
            "oneSignalConfig" AS "oneSignalConfig",
            "fcmConfig" AS "fcmConfig",
            "pushyConfig" AS "pushyConfig"
     FROM tenant_apps
     WHERE "tenantId" = $1
     ORDER BY CASE WHEN "appCode" = 'default' THEN 0 ELSE 1 END, name ASC`,
    [input.tenantId],
  );

  return {
    tenant: {
      id: row.id,
      name: row.name,
      slug: row.slug,
      plan: row.plan,
      status: row.status,
      webhookUrl: row.webhookUrl,
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
      chat: parseChat(row.settings),
      calls: parseCalls(row.settings),
    },
    account: {
      email: row.email,
      name: row.accountName,
      provider: row.provider,
      avatarUrl: row.avatarUrl,
      lastLoginAt: row.lastLoginAt ? new Date(row.lastLoginAt).toISOString() : null,
    },
    apps: appsResult.rows.map((app) => ({
      id: app.id,
      appCode: app.appCode,
      name: app.name,
      pushPayloadType: app.pushPayloadType || "FULL",
      hasOneSignal: Boolean(asRecord(app.oneSignalConfig)),
      hasFcm: Boolean(asRecord(app.fcmConfig)),
      hasPushy: Boolean(asRecord(app.pushyConfig)),
    })),
  };
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
  const { getPool } = await import("@/lib/db");
  const client = await getPool().connect();

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

    const current = await client.query<{
      name: string;
      slug: string | null;
      webhookUrl: string | null;
      settings: unknown;
      plan: string;
      status: string;
      createdAt: Date | string | null;
    }>(
      `SELECT name, slug, "webhookUrl" AS "webhookUrl", settings, plan, status, "createdAt" AS "createdAt"
       FROM tenants WHERE id = $1`,
      [input.tenantId],
    );
    const tenant = current.rows[0];
    if (!tenant) {
      throw new Error("Workspace not found");
    }

    let nextName = tenant.name;
    if (typeof input.workspaceName === "string") {
      const trimmed = input.workspaceName.trim();
      if (!trimmed) {
        throw new Error("Workspace name is required");
      }
      if (trimmed.length > 80) {
        throw new Error("Workspace name must be 80 characters or fewer");
      }
      nextName = trimmed;
    }

    let nextSlug = tenant.slug;
    if (typeof input.workspaceSlug === "string") {
      const normalized = normalizeSlugInput(input.workspaceSlug);
      const clash = await client.query<{ id: string }>(
        `SELECT id FROM tenants WHERE slug = $1 AND id <> $2 LIMIT 1`,
        [normalized, input.tenantId],
      );
      if (clash.rowCount && clash.rowCount > 0) {
        throw new Error("This workspace slug is already taken");
      }
      nextSlug = normalized;
    }

    let nextWebhook = tenant.webhookUrl;
    if (input.webhookUrl !== undefined) {
      const raw = input.webhookUrl?.trim() ?? "";
      if (raw && !isValidWebhookUrl(raw)) {
        throw new Error("Webhook URL must be a valid http(s) URL");
      }
      nextWebhook = raw || null;
    }

    const chat = {
      ...parseChat(tenant.settings),
      ...(input.chat ?? {}),
    };
    if (chat.deletedMessageDisplay !== "placeholder" && chat.deletedMessageDisplay !== "hidden") {
      throw new Error("Invalid deleted message display");
    }
    chat.deletedMessagePlaceholder = chat.deletedMessagePlaceholder.trim() || DEFAULT_CHAT.deletedMessagePlaceholder;

    const calls = {
      ...parseCalls(tenant.settings),
      ...(input.calls ?? {}),
    };
    if (calls.maxParticipants < 2 || calls.maxParticipants > 32) {
      throw new Error("Max participants must be between 2 and 32");
    }
    if (calls.ringTimeoutSeconds < 15 || calls.ringTimeoutSeconds > 120) {
      throw new Error("Ring timeout must be between 15 and 120 seconds");
    }
    if (calls.defaultType !== "audio" && calls.defaultType !== "video") {
      throw new Error("Default call type must be audio or video");
    }

    const nextSettings = mergeSettingsJson(tenant.settings, chat, calls);

    await client.query(
      `UPDATE tenants
       SET name = $2,
           slug = $3,
           "webhookUrl" = $4,
           settings = $5::jsonb,
           "updatedAt" = NOW()
       WHERE id = $1`,
      [input.tenantId, nextName, nextSlug, nextWebhook, JSON.stringify(nextSettings)],
    );

    await client.query("COMMIT");

    return {
      id: input.tenantId,
      name: nextName,
      slug: nextSlug,
      plan: tenant.plan,
      status: tenant.status,
      webhookUrl: nextWebhook,
      createdAt: tenant.createdAt ? new Date(tenant.createdAt).toISOString() : null,
      chat,
      calls,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
