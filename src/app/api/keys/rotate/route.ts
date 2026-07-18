import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { rotateTenantKeys } from "@/lib/control-plane/ops";

export async function POST() {
  const session = await auth();
  if (!session?.user?.accountId || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const keys = await rotateTenantKeys({
      accountId: session.user.accountId,
      tenantId: session.user.tenantId,
    });

    return NextResponse.json({
      ok: true,
      apiKey: keys.apiKey,
      webhookSecret: keys.secretKey,
      session: { keysRevealed: true },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not rotate keys";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
