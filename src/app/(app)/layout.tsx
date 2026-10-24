import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getTenantBrief } from "@/lib/control-plane/accounts";
import { getPlanDisplayName } from "@/lib/pricing";
import type { WorkspaceSummary } from "@/lib/dashboard/workspace";

export const metadata = {
  title: "Console",
  robots: { index: false, follow: false },
};

/** Plan/name come from console API — never serve a static cached Free shell. */
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user?.tenantId || !session.user.accountId) {
    redirect("/start");
  }
  if (!session.user.onboardingCompleted) {
    redirect("/onboarding");
  }

  // Live plan from console — JWT alone can stay "free" after a DB upgrade.
  const brief = await getTenantBrief(session.user.accountId, session.user.tenantId);
  const planId = (brief?.plan ?? session.user.plan ?? "free").trim().toLowerCase() || "free";
  const workspace: WorkspaceSummary = {
    id: session.user.tenantId,
    name: brief?.name ?? session.user.tenantName,
    slug: brief?.slug ?? session.user.tenantSlug,
    planId,
    planName: getPlanDisplayName(planId),
  };

  return (
    <AuthSessionProvider session={session}>
      <DashboardShell workspace={workspace}>{children}</DashboardShell>
    </AuthSessionProvider>
  );
}
