import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { asAppCode, asOptionalTrimmedString, asTrimmedString } from "@/lib/bff-validate";
import { createTenantApp, listTenantApps } from "@/lib/control-plane/apps";
import { revalidateConsoleTags } from "@/lib/control-plane/revalidate";

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
  const appCode = asAppCode(record.appCode);
  const name = asTrimmedString(record.name, 80);
  if (!appCode) {
    return NextResponse.json(
      { error: "appCode is required (letters, numbers, _ or -)" },
      { status: 400 },
    );
  }
  if (!name) {
    return NextResponse.json({ error: "App name is required" }, { status: 400 });
  }

  try {
    const app = await createTenantApp({
      accountId: session.user.accountId,
      tenantId: session.user.tenantId,
      appCode,
      name,
      pushPayloadType: asOptionalTrimmedString(record.pushPayloadType, 40) ?? undefined,
      oneSignalAppId: asOptionalTrimmedString(record.oneSignalAppId, 120),
      oneSignalRestApiKey: asOptionalTrimmedString(record.oneSignalRestApiKey, 256),
      fcmJson: asOptionalTrimmedString(record.fcmJson, 100_000),
      pushyJson: asOptionalTrimmedString(record.pushyJson, 100_000),
    });
    revalidateConsoleTags(session.user.tenantId);
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
