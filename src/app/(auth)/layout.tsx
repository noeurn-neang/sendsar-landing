import Link from "next/link";

import { auth } from "@/auth";
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata = {
  title: "Get started",
  robots: { index: false, follow: false },
};

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <AuthSessionProvider session={session}>
      <AuthShell>{children}</AuthShell>
    </AuthSessionProvider>
  );
}
