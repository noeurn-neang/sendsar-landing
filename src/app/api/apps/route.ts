import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createTenantApp, listTenantApps } from "@/lib/control-plane/apps";

export async function GET() {
  const session = await auth();
  if (!session?.user?.accountId || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apps = await listTenantApps({
    accountId: session.user.accountId,
    tenantId: session.user.tenantId,
  });

  return NextResponse.json({ apps });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.accountId || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    appCode?: string;
    name?: string;
    pushPayloadType?: string;
    oneSignalAppId?: string | null;
    oneSignalRestApiKey?: string | null;
    fcmJson?: string | null;
    pushyJson?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const app = await createTenantApp({
      accountId: session.user.accountId,
      tenantId: session.user.tenantId,
      appCode: body.appCode ?? "",
      name: body.name ?? "",
      pushPayloadType: body.pushPayloadType,
      oneSignalAppId: body.oneSignalAppId,
      oneSignalRestApiKey: body.oneSignalRestApiKey,
      fcmJson: body.fcmJson,
      pushyJson: body.pushyJson,
    });
    return NextResponse.json({ ok: true, app }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create app";
    const status = message.includes("already exists")
      ? 409
      : message.includes("required") || message.includes("must be") || message.includes("valid")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
