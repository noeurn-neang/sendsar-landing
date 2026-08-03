import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SettingsPanel } from "@/app/(app)/dashboard/settings/SettingsPanel";
import { getSettingsPageData } from "@/lib/control-plane/settings";

export default async function DashboardSettingsPage() {
  const session = await auth();
  if (!session?.user?.accountId || !session.user.tenantId) {
    redirect("/start");
  }

  const data = await getSettingsPageData({
    accountId: session.user.accountId,
    tenantId: session.user.tenantId,
  });

  if (!data) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <h2 className="text-lg font-semibold text-console-fg">Couldn’t load settings</h2>
        <p className="text-sm text-console-muted">
          The gateway took too long or was busy. Your session is fine — retry in a moment.
        </p>
        <Link href="/dashboard/settings" className="console-btn-primary inline-flex">
          Try again
        </Link>
      </div>
    );
  }

  return (
    <SettingsPanel
      tenant={data.tenant}
      account={data.account}
      apps={data.apps}
      lastWebhookTest={data.lastWebhookTest}
    />
  );
}
