import { Suspense } from "react";

import { auth } from "@/auth";
import { getTenantCredentials } from "@/lib/control-plane/accounts";
import { maskSecret } from "@/lib/control-plane/keys";
import { redirect } from "next/navigation";

import { KeysPanel } from "./KeysPanel";

type KeysPageProps = {
  searchParams: Promise<{ welcome?: string }>;
};

export default async function DashboardKeysPage({ searchParams }: KeysPageProps) {
  const session = await auth();
  if (!session?.user.tenantId) {
    redirect("/start");
  }

  const credentials = await getTenantCredentials(session.user.tenantId);
  if (!credentials) {
    redirect("/start");
  }

  const params = await searchParams;
  const welcome = params.welcome === "1";

  return (
    <Suspense fallback={<p className="text-sm text-console-muted">Loading keys…</p>}>
      <KeysPanel
        welcome={welcome}
        keysRevealed={session.user.keysRevealed}
        maskedApiKey={maskSecret(credentials.apiKey)}
        maskedWebhookSecret={maskSecret(credentials.secretKey)}
      />
    </Suspense>
  );
}
