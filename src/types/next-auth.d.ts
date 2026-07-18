import type { DefaultSession } from "next-auth";

export type ConsoleSessionUser = DefaultSession["user"] & {
  accountId: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string | null;
  plan: string;
  onboardingCompleted: boolean;
  keysRevealed: boolean;
};

declare module "next-auth" {
  interface Session {
    user: ConsoleSessionUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accountId?: string;
    tenantId?: string;
    tenantName?: string;
    tenantSlug?: string | null;
    plan?: string;
    onboardingCompleted?: boolean;
    keysRevealed?: boolean;
  }
}
