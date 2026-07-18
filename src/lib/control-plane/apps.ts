import "server-only";

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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function normalizeAppCode(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function requireOwnership(accountId: string, tenantId: string) {
  const { query } = await import("@/lib/db");
  const owned = await query<{ id: string }>(
    `SELECT t.id
     FROM tenants t
     INNER JOIN platform_accounts pa ON pa."tenantId" = t.id
     WHERE t.id = $1 AND pa.id = $2
     LIMIT 1`,
    [tenantId, accountId],
  );
  if (!owned.rows[0]) {
    throw new Error("Workspace not found");
  }
}

function toSummary(row: {
  id: string;
  appCode: string;
  name: string;
  pushPayloadType: string;
  oneSignalConfig: unknown;
  fcmConfig: unknown;
  pushyConfig: unknown;
  updatedAt: Date | string | null;
}): TenantAppSummary {
  return {
    id: row.id,
    appCode: row.appCode,
    name: row.name,
    pushPayloadType: row.pushPayloadType || "FULL",
    hasOneSignal: Boolean(asRecord(row.oneSignalConfig)),
    hasFcm: Boolean(asRecord(row.fcmConfig)),
    hasPushy: Boolean(asRecord(row.pushyConfig)),
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
  };
}

export async function listTenantApps(input: {
  accountId: string;
  tenantId: string;
}): Promise<TenantAppSummary[]> {
  await requireOwnership(input.accountId, input.tenantId);
  const { query } = await import("@/lib/db");
  const result = await query<{
    id: string;
    appCode: string;
    name: string;
    pushPayloadType: string;
    oneSignalConfig: unknown;
    fcmConfig: unknown;
    pushyConfig: unknown;
    updatedAt: Date | string | null;
  }>(
    `SELECT id,
            "appCode" AS "appCode",
            name,
            "pushPayloadType" AS "pushPayloadType",
            "oneSignalConfig" AS "oneSignalConfig",
            "fcmConfig" AS "fcmConfig",
            "pushyConfig" AS "pushyConfig",
            "updatedAt" AS "updatedAt"
     FROM tenant_apps
     WHERE "tenantId" = $1
     ORDER BY CASE WHEN "appCode" = 'default' THEN 0 ELSE 1 END, name ASC`,
    [input.tenantId],
  );
  return result.rows.map(toSummary);
}

export async function getTenantAppDetail(input: {
  accountId: string;
  tenantId: string;
  appCode: string;
}): Promise<TenantAppDetail | null> {
  await requireOwnership(input.accountId, input.tenantId);
  const { query } = await import("@/lib/db");
  const result = await query<{
    id: string;
    appCode: string;
    name: string;
    pushPayloadType: string;
    oneSignalConfig: unknown;
    fcmConfig: unknown;
    pushyConfig: unknown;
    updatedAt: Date | string | null;
  }>(
    `SELECT id,
            "appCode" AS "appCode",
            name,
            "pushPayloadType" AS "pushPayloadType",
            "oneSignalConfig" AS "oneSignalConfig",
            "fcmConfig" AS "fcmConfig",
            "pushyConfig" AS "pushyConfig",
            "updatedAt" AS "updatedAt"
     FROM tenant_apps
     WHERE "tenantId" = $1 AND "appCode" = $2
     LIMIT 1`,
    [input.tenantId, input.appCode],
  );
  const row = result.rows[0];
  if (!row) return null;

  const oneSignal = asRecord(row.oneSignalConfig);
  const appId =
    typeof oneSignal?.appId === "string"
      ? oneSignal.appId
      : typeof oneSignal?.app_id === "string"
        ? oneSignal.app_id
        : null;
  const hasRest =
    Boolean(oneSignal?.restApiKey) || Boolean(oneSignal?.rest_api_key);

  return {
    ...toSummary(row),
    oneSignalAppId: appId,
    hasOneSignalRestKey: hasRest,
    hasFcmConfig: Boolean(asRecord(row.fcmConfig)),
    hasPushyConfig: Boolean(asRecord(row.pushyConfig)),
  };
}

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

function parseOptionalJson(label: string, value: string | null | undefined): Record<string, unknown> | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const record = asRecord(parsed);
    if (!record) {
      throw new Error(`${label} must be a JSON object`);
    }
    return record;
  } catch (error) {
    if (error instanceof Error && error.message.includes("must be")) throw error;
    throw new Error(`${label} must be valid JSON`);
  }
}

export async function createTenantApp(
  input: UpsertTenantAppInput,
): Promise<TenantAppSummary> {
  await requireOwnership(input.accountId, input.tenantId);

  const appCode = normalizeAppCode(input.appCode);
  const name = input.name.trim();
  if (!appCode) throw new Error("App code is required");
  if (!name) throw new Error("App name is required");
  if (name.length > 80) throw new Error("App name must be 80 characters or fewer");

  const pushPayloadType =
    input.pushPayloadType === "DATA" || input.pushPayloadType === "FULL"
      ? input.pushPayloadType
      : "FULL";

  let oneSignal: Record<string, unknown> | null = null;
  if (!input.clearOneSignal) {
    const appId = input.oneSignalAppId?.trim() || "";
    const restKey = input.oneSignalRestApiKey?.trim() || "";
    if (appId || restKey) {
      if (!appId || !restKey) {
        throw new Error("OneSignal requires both App ID and REST API key");
      }
      oneSignal = { appId, restApiKey: restKey };
    }
  }

  const fcm = input.clearFcm ? null : parseOptionalJson("FCM config", input.fcmJson);
  const pushy = input.clearPushy ? null : parseOptionalJson("Pushy config", input.pushyJson);

  const { query } = await import("@/lib/db");
  try {
    const result = await query<{
      id: string;
      appCode: string;
      name: string;
      pushPayloadType: string;
      oneSignalConfig: unknown;
      fcmConfig: unknown;
      pushyConfig: unknown;
      updatedAt: Date | string | null;
    }>(
      `INSERT INTO tenant_apps (
         "tenantId", "appCode", name, "pushPayloadType",
         "oneSignalConfig", "fcmConfig", "pushyConfig",
         "createdAt", "updatedAt"
       )
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, NOW(), NOW())
       RETURNING id,
                 "appCode" AS "appCode",
                 name,
                 "pushPayloadType" AS "pushPayloadType",
                 "oneSignalConfig" AS "oneSignalConfig",
                 "fcmConfig" AS "fcmConfig",
                 "pushyConfig" AS "pushyConfig",
                 "updatedAt" AS "updatedAt"`,
      [
        input.tenantId,
        appCode,
        name,
        pushPayloadType,
        oneSignal ? JSON.stringify(oneSignal) : null,
        fcm ? JSON.stringify(fcm) : null,
        pushy ? JSON.stringify(pushy) : null,
      ],
    );
    return toSummary(result.rows[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("unique") || message.includes("duplicate")) {
      throw new Error(`App code "${appCode}" already exists`);
    }
    throw error;
  }
}

export async function updateTenantApp(
  input: UpsertTenantAppInput,
): Promise<TenantAppSummary> {
  await requireOwnership(input.accountId, input.tenantId);

  const name = input.name.trim();
  if (!name) throw new Error("App name is required");
  if (name.length > 80) throw new Error("App name must be 80 characters or fewer");

  const pushPayloadType =
    input.pushPayloadType === "DATA" || input.pushPayloadType === "FULL"
      ? input.pushPayloadType
      : "FULL";

  const { getPool } = await import("@/lib/db");
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    const current = await client.query<{
      oneSignalConfig: unknown;
      fcmConfig: unknown;
      pushyConfig: unknown;
    }>(
      `SELECT "oneSignalConfig" AS "oneSignalConfig",
              "fcmConfig" AS "fcmConfig",
              "pushyConfig" AS "pushyConfig"
       FROM tenant_apps
       WHERE "tenantId" = $1 AND "appCode" = $2
       FOR UPDATE`,
      [input.tenantId, input.appCode],
    );
    const row = current.rows[0];
    if (!row) {
      throw new Error("App not found");
    }

    let nextOneSignal: Record<string, unknown> | null = asRecord(row.oneSignalConfig);
    if (input.clearOneSignal) {
      nextOneSignal = null;
    } else {
      const appId = input.oneSignalAppId?.trim();
      const restKey = input.oneSignalRestApiKey?.trim();
      if (appId !== undefined || restKey !== undefined) {
        const existingId =
          typeof nextOneSignal?.appId === "string"
            ? nextOneSignal.appId
            : typeof nextOneSignal?.app_id === "string"
              ? nextOneSignal.app_id
              : "";
        const existingKey =
          typeof nextOneSignal?.restApiKey === "string"
            ? nextOneSignal.restApiKey
            : typeof nextOneSignal?.rest_api_key === "string"
              ? nextOneSignal.rest_api_key
              : "";
        const nextId = appId !== undefined && appId !== "" ? appId : existingId;
        const nextKey =
          restKey !== undefined && restKey !== "" ? restKey : existingKey;
        if (nextId || nextKey) {
          if (!nextId || !nextKey) {
            throw new Error("OneSignal requires both App ID and REST API key");
          }
          nextOneSignal = { appId: nextId, restApiKey: nextKey };
        }
      }
    }

    let nextFcm: Record<string, unknown> | null = asRecord(row.fcmConfig);
    if (input.clearFcm) {
      nextFcm = null;
    } else if (input.fcmJson !== undefined) {
      nextFcm = parseOptionalJson("FCM config", input.fcmJson) ?? nextFcm;
      if (input.fcmJson?.trim() === "") {
        // empty string with no clear = keep existing
        nextFcm = asRecord(row.fcmConfig);
      }
    }

    let nextPushy: Record<string, unknown> | null = asRecord(row.pushyConfig);
    if (input.clearPushy) {
      nextPushy = null;
    } else if (input.pushyJson !== undefined) {
      if ((input.pushyJson ?? "").trim() === "") {
        nextPushy = asRecord(row.pushyConfig);
      } else {
        nextPushy = parseOptionalJson("Pushy config", input.pushyJson);
      }
    }

    const result = await client.query<{
      id: string;
      appCode: string;
      name: string;
      pushPayloadType: string;
      oneSignalConfig: unknown;
      fcmConfig: unknown;
      pushyConfig: unknown;
      updatedAt: Date | string | null;
    }>(
      `UPDATE tenant_apps
       SET name = $3,
           "pushPayloadType" = $4,
           "oneSignalConfig" = $5::jsonb,
           "fcmConfig" = $6::jsonb,
           "pushyConfig" = $7::jsonb,
           "updatedAt" = NOW()
       WHERE "tenantId" = $1 AND "appCode" = $2
       RETURNING id,
                 "appCode" AS "appCode",
                 name,
                 "pushPayloadType" AS "pushPayloadType",
                 "oneSignalConfig" AS "oneSignalConfig",
                 "fcmConfig" AS "fcmConfig",
                 "pushyConfig" AS "pushyConfig",
                 "updatedAt" AS "updatedAt"`,
      [
        input.tenantId,
        input.appCode,
        name,
        pushPayloadType,
        nextOneSignal ? JSON.stringify(nextOneSignal) : null,
        nextFcm ? JSON.stringify(nextFcm) : null,
        nextPushy ? JSON.stringify(nextPushy) : null,
      ],
    );

    await client.query("COMMIT");
    return toSummary(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteTenantApp(input: {
  accountId: string;
  tenantId: string;
  appCode: string;
}): Promise<void> {
  await requireOwnership(input.accountId, input.tenantId);

  if (input.appCode === "default") {
    throw new Error('The "default" app cannot be deleted');
  }

  const { getPool } = await import("@/lib/db");
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query<{ id: string }>(
      `SELECT id FROM tenant_apps WHERE "tenantId" = $1 AND "appCode" = $2 FOR UPDATE`,
      [input.tenantId, input.appCode],
    );
    if (!existing.rows[0]) {
      throw new Error("App not found");
    }

    const linked = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM users
       WHERE "tenantId" = $1 AND "appCode" = $2`,
      [input.tenantId, input.appCode],
    );
    const linkedCount = Number(linked.rows[0]?.count ?? 0);
    if (linkedCount > 0) {
      // Detach users so FK allows delete; they fall back to "default" for push.
      await client.query(
        `UPDATE users SET "appCode" = NULL WHERE "tenantId" = $1 AND "appCode" = $2`,
        [input.tenantId, input.appCode],
      );
    }

    await client.query(
      `DELETE FROM tenant_apps WHERE "tenantId" = $1 AND "appCode" = $2`,
      [input.tenantId, input.appCode],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export { normalizeAppCode };
