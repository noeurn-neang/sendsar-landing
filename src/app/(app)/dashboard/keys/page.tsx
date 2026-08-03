import Link from "next/link";
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
  if (!session?.user.tenantId || !session.user.accountId) {
    redirect("/start");
  }

  const credentials = await getTenantCredentials(
    session.user.accountId,
    session.user.tenantId,
  );
  const params = await searchParams;
  const welcome = params.welcome === "1";

  if (!credentials) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <h2 className="text-lg font-semibold text-console-fg">Couldn’t load API keys</h2>
        <p className="text-sm text-console-muted">
          The gateway took too long or was busy (common with a remote database). Your session is
          fine — retry in a moment.
        </p>
        <Link href="/dashboard/keys" className="console-btn-primary inline-flex">
          Try again
        </Link>
      </div>
    );
  }

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
