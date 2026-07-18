import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getPlanDisplayName } from "@/lib/pricing";
import type { WorkspaceSummary } from "@/lib/dashboard/workspace";

export const metadata = {
  title: "Console",
  robots: { index: false, follow: false },
};

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    redirect("/start");
  }
  if (!session.user.onboardingCompleted) {
    redirect("/onboarding");
  }

  const workspace: WorkspaceSummary = {
    id: session.user.tenantId,
    name: session.user.tenantName,
    slug: session.user.tenantSlug,
    planId: session.user.plan,
    planName: getPlanDisplayName(session.user.plan),
  };

  return (
    <AuthSessionProvider session={session}>
      <DashboardShell workspace={workspace}>{children}</DashboardShell>
    </AuthSessionProvider>
  );
}
