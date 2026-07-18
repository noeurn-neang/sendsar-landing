import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SettingsPanel } from "@/app/(app)/dashboard/settings/SettingsPanel";
import { getLastWebhookTest } from "@/lib/control-plane/ops";
import { getSettingsPageData } from "@/lib/control-plane/settings";

export default async function DashboardSettingsPage() {
  const session = await auth();
  if (!session?.user?.accountId || !session.user.tenantId) {
    redirect("/start");
  }

  const [data, lastWebhookTest] = await Promise.all([
    getSettingsPageData({
      accountId: session.user.accountId,
      tenantId: session.user.tenantId,
    }),
    getLastWebhookTest(session.user.tenantId),
  ]);

  if (!data) {
    redirect("/start");
  }

  return (
    <SettingsPanel
      tenant={data.tenant}
      account={data.account}
      apps={data.apps}
      lastWebhookTest={lastWebhookTest}
    />
  );
}
