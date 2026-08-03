import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { sendWebhookTest } from "@/lib/control-plane/ops";
import { revalidateConsoleTags } from "@/lib/control-plane/revalidate";

export async function POST() {
  const session = await auth();
  if (!session?.user?.accountId || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendWebhookTest({
      accountId: session.user.accountId,
      tenantId: session.user.tenantId,
    });
    revalidateConsoleTags(session.user.tenantId);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook test failed";
    const status = message.includes("Configure") || message.includes("Webhook URL")
      ? 400
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
