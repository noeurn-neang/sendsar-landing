import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [Google, GitHub],
  pages: {
    signIn: "/start",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 14,
  },
  trustHost: true,
} satisfies NextAuthConfig;
