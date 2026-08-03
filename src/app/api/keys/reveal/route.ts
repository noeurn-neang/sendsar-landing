import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getTenantCredentials, markKeysRevealed } from "@/lib/control-plane/accounts";
import { revalidateConsoleTags } from "@/lib/control-plane/revalidate";

export async function POST() {
  const session = await auth();
  if (!session?.user?.accountId || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.keysRevealed) {
    return NextResponse.json({ error: "Keys were already revealed" }, { status: 409 });
  }

  const credentials = await getTenantCredentials(
    session.user.accountId,
    session.user.tenantId,
  );
  if (!credentials) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  await markKeysRevealed(session.user.accountId);
  revalidateConsoleTags(session.user.tenantId);

  return NextResponse.json({
    apiKey: credentials.apiKey,
    webhookSecret: credentials.secretKey,
  });
}
