import "server-only";

import type { PoolClient } from "pg";

import { generateApiKey, generateWebhookSecret } from "@/lib/control-plane/keys";
import { normalizeSlugInput, slugify } from "@/lib/control-plane/slug";

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

const DEFAULT_SETTINGS = {
  chat: {
    deletedMessageDisplay: "placeholder",
    deletedMessagePlaceholder: "This message was deleted",
  },
};

async function slugExists(client: PoolClient, slug: string, excludeTenantId?: string): Promise<boolean> {
  const result = excludeTenantId
    ? await client.query<{ id: string }>(
        `SELECT id FROM tenants WHERE slug = $1 AND id <> $2 LIMIT 1`,
        [slug, excludeTenantId],
      )
    : await client.query<{ id: string }>(`SELECT id FROM tenants WHERE slug = $1 LIMIT 1`, [slug]);
  return result.rowCount !== null && result.rowCount > 0;
}

async function generateUniqueSlug(
  client: PoolClient,
  baseName: string,
  excludeTenantId?: string,
): Promise<string> {
  const base = normalizeSlugInput(baseName);
  let candidate = base;
  let suffix = 0;

  while (await slugExists(client, candidate, excludeTenantId)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}

async function loadTenant(client: PoolClient, tenantId: string): Promise<TenantRow> {
  const result = await client.query<TenantRow>(
    `SELECT id, name, slug, plan, status, "apiKey", "secretKey"
     FROM tenants
     WHERE id = $1`,
    [tenantId],
  );

  const tenant = result.rows[0];
  if (!tenant) {
    throw new Error(`Tenant ${tenantId} not found`);
  }
  return tenant;
}

export async function upsertPlatformAccount(input: {
  provider: string;
  providerAccountId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}): Promise<UpsertPlatformAccountResult> {
  const { getPool } = await import("@/lib/db");
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query<PlatformAccountRow>(
      `SELECT id, provider, "providerAccountId", email, name, "avatarUrl", "tenantId",
              "onboardingCompleted", "keysRevealed"
       FROM platform_accounts
       WHERE provider = $1 AND "providerAccountId" = $2`,
      [input.provider, input.providerAccountId],
    );

    if (existing.rows[0]) {
      const account = existing.rows[0];
      await client.query(
        `UPDATE platform_accounts
         SET email = $2,
             name = COALESCE($3, name),
             "avatarUrl" = COALESCE($4, "avatarUrl"),
             "lastLoginAt" = NOW(),
             "updatedAt" = NOW()
         WHERE id = $1`,
        [account.id, input.email, input.name, input.avatarUrl],
      );

      const tenant = await loadTenant(client, account.tenantId);
      await client.query("COMMIT");

      return {
        accountId: account.id,
        tenantId: tenant.id,
        tenantName: tenant.name,
        tenantSlug: tenant.slug,
        plan: tenant.plan,
        onboardingCompleted: account.onboardingCompleted,
        keysRevealed: account.keysRevealed,
        isNew: false,
      };
    }

    const workspaceName =
      input.name?.trim() || input.email.split("@")[0]?.trim() || "Workspace";
    const slug = await generateUniqueSlug(client, workspaceName);
    const apiKey = generateApiKey();
    const secretKey = generateWebhookSecret();

    const tenantResult = await client.query<TenantRow>(
      `INSERT INTO tenants (name, slug, plan, status, "apiKey", "secretKey", settings, "createdAt", "updatedAt")
       VALUES ($1, $2, 'free', 'active', $3, $4, $5::jsonb, NOW(), NOW())
       RETURNING id, name, slug, plan, status, "apiKey", "secretKey"`,
      [workspaceName, slug, apiKey, secretKey, JSON.stringify(DEFAULT_SETTINGS)],
    );
    const tenant = tenantResult.rows[0];

    await client.query(
      `INSERT INTO tenant_apps ("tenantId", "appCode", name, "pushPayloadType", "createdAt", "updatedAt")
       VALUES ($1, 'default', $2, 'FULL', NOW(), NOW())`,
      [tenant.id, `${workspaceName} App`],
    );

    const accountResult = await client.query<{ id: string }>(
      `INSERT INTO platform_accounts (
         provider, "providerAccountId", email, name, "avatarUrl", "tenantId",
         "onboardingCompleted", "keysRevealed", "createdAt", "updatedAt", "lastLoginAt"
       )
       VALUES ($1, $2, $3, $4, $5, $6, false, false, NOW(), NOW(), NOW())
       RETURNING id`,
      [
        input.provider,
        input.providerAccountId,
        input.email,
        input.name,
        input.avatarUrl,
        tenant.id,
      ],
    );

    await client.query("COMMIT");

    return {
      accountId: accountResult.rows[0].id,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      plan: tenant.plan,
      onboardingCompleted: false,
      keysRevealed: false,
      isNew: true,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getAccountById(accountId: string): Promise<PlatformAccountRow | null> {
  const { query } = await import("@/lib/db");
  const result = await query<Record<string, unknown>>(
    `SELECT id,
            provider,
            "providerAccountId" AS "providerAccountId",
            email,
            name,
            "avatarUrl" AS "avatarUrl",
            "tenantId" AS "tenantId",
            "onboardingCompleted" AS "onboardingCompleted",
            "keysRevealed" AS "keysRevealed"
     FROM platform_accounts
     WHERE id = $1`,
    [accountId],
  );
  const row = result.rows[0];
  if (!row) return null;

  return {
    id: String(row.id),
    provider: String(row.provider),
    providerAccountId: String(row.providerAccountId),
    email: String(row.email),
    name: (row.name as string | null) ?? null,
    avatarUrl: (row.avatarUrl as string | null) ?? null,
    tenantId: String(row.tenantId),
    onboardingCompleted: Boolean(row.onboardingCompleted),
    keysRevealed: Boolean(row.keysRevealed),
  };
}

export async function completeOnboarding(input: {
  accountId: string;
  tenantId: string;
  workspaceName: string;
  workspaceSlug: string;
}): Promise<{ tenantName: string; tenantSlug: string }> {
  const { getPool } = await import("@/lib/db");
  const client = await getPool().connect();
  const workspaceName = input.workspaceName.trim();
  const workspaceSlug = normalizeSlugInput(input.workspaceSlug || workspaceName);

  if (!workspaceName) {
    throw new Error("Workspace name is required");
  }

  try {
    await client.query("BEGIN");

    if (await slugExists(client, workspaceSlug, input.tenantId)) {
      throw new Error("This workspace slug is already taken");
    }

    await client.query(
      `UPDATE tenants
       SET name = $2, slug = $3, "updatedAt" = NOW()
       WHERE id = $1`,
      [input.tenantId, workspaceName, workspaceSlug],
    );

    await client.query(
      `UPDATE platform_accounts
       SET "onboardingCompleted" = true, "updatedAt" = NOW()
       WHERE id = $1 AND "tenantId" = $2`,
      [input.accountId, input.tenantId],
    );

    await client.query("COMMIT");
    return { tenantName: workspaceName, tenantSlug: workspaceSlug };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getTenantCredentials(tenantId: string): Promise<{
  apiKey: string;
  secretKey: string;
  keysRevealed: boolean;
} | null> {
  const { query } = await import("@/lib/db");
  const result = await query<{ apiKey: string; secretKey: string; keysRevealed: boolean }>(
    `SELECT t."apiKey", t."secretKey", pa."keysRevealed"
     FROM tenants t
     INNER JOIN platform_accounts pa ON pa."tenantId" = t.id
     WHERE t.id = $1
     LIMIT 1`,
    [tenantId],
  );
  return result.rows[0] ?? null;
}

export async function markKeysRevealed(accountId: string): Promise<void> {
  const { query } = await import("@/lib/db");
  await query(
    `UPDATE platform_accounts SET "keysRevealed" = true, "updatedAt" = NOW() WHERE id = $1`,
    [accountId],
  );
}

export { slugify };
