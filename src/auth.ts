import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";
import { getAccountById, upsertPlatformAccount } from "@/lib/control-plane/accounts";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ account, user }) {
      if (!account?.provider || !account.providerAccountId || !user.email) {
        return false;
      }
      return true;
    },
    async jwt({ token, account, user, trigger, session }) {
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
        token.plan = result.plan;
        token.onboardingCompleted = result.onboardingCompleted;
        token.keysRevealed = result.keysRevealed;
      }

      // Client called session.update(...) — merge payload and refresh from DB.
      if (trigger === "update" && token.accountId) {
        if (session && typeof session === "object") {
          const patch = session as {
            onboardingCompleted?: boolean;
            keysRevealed?: boolean;
            tenantName?: string;
            tenantSlug?: string | null;
            plan?: string;
          };
          if (typeof patch.onboardingCompleted === "boolean") {
            token.onboardingCompleted = patch.onboardingCompleted;
          }
          if (typeof patch.keysRevealed === "boolean") {
            token.keysRevealed = patch.keysRevealed;
          }
          if (typeof patch.tenantName === "string") {
            token.tenantName = patch.tenantName;
          }
          if ("tenantSlug" in patch) {
            token.tenantSlug = patch.tenantSlug ?? null;
          }
          if (typeof patch.plan === "string") {
            token.plan = patch.plan;
          }
        }

        const accountRow = await getAccountById(token.accountId);
        if (accountRow) {
          token.onboardingCompleted = accountRow.onboardingCompleted;
          token.keysRevealed = accountRow.keysRevealed;
          const { query } = await import("@/lib/db");
          const tenantResult = await query<{
            name: string;
            slug: string | null;
            plan: string;
          }>(`SELECT name, slug, plan FROM tenants WHERE id = $1`, [accountRow.tenantId]);
          const tenant = tenantResult.rows[0];
          if (tenant) {
            token.tenantName = tenant.name;
            token.tenantSlug = tenant.slug;
            token.plan = tenant.plan;
          }
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
        session.user.plan = token.plan ?? "free";
        session.user.onboardingCompleted = Boolean(token.onboardingCompleted);
        session.user.keysRevealed = Boolean(token.keysRevealed);
      }
      return session;
    },
  },
});
