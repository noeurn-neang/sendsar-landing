import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  asOptionalObject,
  asOptionalTrimmedString,
} from "@/lib/bff-validate";
import {
  getSettingsPageData,
  updateTenantSettings,
  type CallSettings,
  type ChatSettings,
} from "@/lib/control-plane/settings";
import { revalidateConsoleTags } from "@/lib/control-plane/revalidate";

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const workspaceName = asOptionalTrimmedString(record.workspaceName, 80);
  const workspaceSlug = asOptionalTrimmedString(record.workspaceSlug, 80);
  const webhookUrl = asOptionalTrimmedString(record.webhookUrl, 2048);
  if (record.workspaceName !== undefined && workspaceName === undefined) {
    return NextResponse.json({ error: "Invalid workspace name" }, { status: 400 });
  }
  if (record.workspaceSlug !== undefined && workspaceSlug === undefined) {
    return NextResponse.json({ error: "Invalid workspace slug" }, { status: 400 });
  }
  if (record.webhookUrl !== undefined && webhookUrl === undefined) {
    return NextResponse.json({ error: "Invalid webhook URL" }, { status: 400 });
  }

  const chat = asOptionalObject<Partial<ChatSettings>>(record.chat);
  const calls = asOptionalObject<Partial<CallSettings>>(record.calls);
  if (record.chat !== undefined && chat === undefined) {
    return NextResponse.json({ error: "Invalid chat settings" }, { status: 400 });
  }
  if (record.calls !== undefined && calls === undefined) {
    return NextResponse.json({ error: "Invalid call settings" }, { status: 400 });
  }

  try {
    const tenant = await updateTenantSettings({
      accountId: session.user.accountId,
      tenantId: session.user.tenantId,
      workspaceName: workspaceName ?? undefined,
      workspaceSlug: workspaceSlug ?? undefined,
      webhookUrl,
      chat,
      calls,
    });

    revalidateConsoleTags(session.user.tenantId);

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
            message.includes("Invalid") ||
            message.includes("Webhook")
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
