import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getSettingsPageData,
  updateTenantSettings,
  type CallSettings,
  type ChatSettings,
} from "@/lib/control-plane/settings";

export async function GET() {
  const session = await auth();
  if (!session?.user?.accountId || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getSettingsPageData({
    accountId: session.user.accountId,
    tenantId: session.user.tenantId,
  });

  if (!data) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.accountId || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    workspaceName?: string;
    workspaceSlug?: string;
    webhookUrl?: string | null;
    chat?: Partial<ChatSettings>;
    calls?: Partial<CallSettings>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const tenant = await updateTenantSettings({
      accountId: session.user.accountId,
      tenantId: session.user.tenantId,
      workspaceName: body.workspaceName,
      workspaceSlug: body.workspaceSlug,
      webhookUrl: body.webhookUrl,
      chat: body.chat,
      calls: body.calls,
    });

    return NextResponse.json({
      ok: true,
      tenant,
      session: {
        tenantName: tenant.name,
        tenantSlug: tenant.slug,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save settings";
    const status = message.includes("already taken")
      ? 409
      : message.includes("not found")
        ? 404
        : message.includes("required") ||
            message.includes("must be") ||
            message.includes("Invalid")
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
