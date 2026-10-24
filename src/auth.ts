import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";

import { authConfig } from "@/auth.config";
import {
  getAccountById,
  getTenantBrief,
  upsertPlatformAccount,
} from "@/lib/control-plane/accounts";

/** How often JWT re-reads plan/name from console (browser refresh alone does not hit DB). */
const TENANT_CLAIM_REFRESH_MS = 15_000;

function normalizePlan(plan: string | null | undefined): string {
  const value = (plan ?? "free").trim().toLowerCase();
  return value || "free";
}

async function syncTenantClaims(token: JWT): Promise<void> {
  if (!token.accountId) return;
  const accountRow = await getAccountById(token.accountId);
  if (!accountRow) return;

  token.onboardingCompleted = accountRow.onboardingCompleted;
  token.keysRevealed = accountRow.keysRevealed;
  token.tenantId = accountRow.tenantId;

  const tenant = await getTenantBrief(accountRow.id, accountRow.tenantId);
  if (tenant) {
    token.tenantName = tenant.name;
    token.tenantSlug = tenant.slug;
    token.plan = normalizePlan(tenant.plan);
  }
  token.planSyncedAt = Date.now();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ account, user }) {
      if (!account?.provider || !account.providerAccountId || !user.email) {
        return false;
      }
      return true;
    },
    async jwt({ token, account, user, trigger }) {
      if (account?.provider && account.providerAccountId && user?.email) {
        const result = await upsertPlatformAccount({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          email: user.email,
          name: user.name ?? null,
          avatarUrl: user.image ?? null,
        });

        token.accountId = result.accountId;
        token.tenantId = result.tenantId;
        token.tenantName = result.tenantName;
        token.tenantSlug = result.tenantSlug;
        token.plan = normalizePlan(result.plan);
        token.onboardingCompleted = result.onboardingCompleted;
        token.keysRevealed = result.keysRevealed;
        token.planSyncedAt = Date.now();
      }

      // Never trust client-supplied privilege fields. Re-read from console API on
      // session.update() and periodically so DB plan changes (manual or paid) show up
      // without requiring sign-out.
      const syncedAt =
        typeof token.planSyncedAt === "number" ? token.planSyncedAt : 0;
      const stale = Date.now() - syncedAt > TENANT_CLAIM_REFRESH_MS;
      if (token.accountId && (trigger === "update" || stale)) {
        try {
          await syncTenantClaims(token);
        } catch (err) {
          console.error("[auth] tenant claim sync failed", err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.accountId && token.tenantId) {
        session.user.accountId = token.accountId;
        session.user.tenantId = token.tenantId;
        session.user.tenantName = token.tenantName ?? "Workspace";
        session.user.tenantSlug = token.tenantSlug ?? null;
        session.user.plan = normalizePlan(token.plan);
        session.user.onboardingCompleted = Boolean(token.onboardingCompleted);
        session.user.keysRevealed = Boolean(token.keysRevealed);
      }
      return session;
    },
  },
});
