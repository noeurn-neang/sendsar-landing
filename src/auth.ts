import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";
import {
  getAccountById,
  getTenantBrief,
  upsertPlatformAccount,
} from "@/lib/control-plane/accounts";

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
        token.plan = result.plan;
        token.onboardingCompleted = result.onboardingCompleted;
        token.keysRevealed = result.keysRevealed;
      }

      // Client called session.update(...) — refresh only from console API.
      // Never trust client-supplied privilege fields (onboardingCompleted, plan, etc.).
      if (trigger === "update" && token.accountId) {
        const accountRow = await getAccountById(token.accountId);
        if (accountRow) {
          token.onboardingCompleted = accountRow.onboardingCompleted;
          token.keysRevealed = accountRow.keysRevealed;
          token.tenantId = accountRow.tenantId;
          const tenant = await getTenantBrief(accountRow.id, accountRow.tenantId);
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
