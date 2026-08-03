import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  deleteTenantApp,
  getTenantAppDetail,
  updateTenantApp,
} from "@/lib/control-plane/apps";
import { revalidateConsoleTags } from "@/lib/control-plane/revalidate";

type RouteContext = { params: Promise<{ appCode: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.accountId || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { appCode } = await context.params;
  const app = await getTenantAppDetail({
    accountId: session.user.accountId,
    tenantId: session.user.tenantId,
    appCode: decodeURIComponent(appCode),
  });

  if (!app) {
    return NextResponse.json({ error: "App not found" }, { status: 404 });
  }

  return NextResponse.json({ app });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.accountId || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { appCode } = await context.params;

  let body: {
    name?: string;
    pushPayloadType?: string;
    oneSignalAppId?: string | null;
    oneSignalRestApiKey?: string | null;
    clearOneSignal?: boolean;
    fcmJson?: string | null;
    clearFcm?: boolean;
    pushyJson?: string | null;
    clearPushy?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const app = await updateTenantApp({
      accountId: session.user.accountId,
      tenantId: session.user.tenantId,
      appCode: decodeURIComponent(appCode),
      name: body.name ?? "",
      pushPayloadType: body.pushPayloadType,
      oneSignalAppId: body.oneSignalAppId,
      oneSignalRestApiKey: body.oneSignalRestApiKey,
      clearOneSignal: body.clearOneSignal,
      fcmJson: body.fcmJson,
      clearFcm: body.clearFcm,
      pushyJson: body.pushyJson,
      clearPushy: body.clearPushy,
    });
    revalidateConsoleTags(session.user.tenantId);
    return NextResponse.json({ ok: true, app });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update app";
    const status = message.includes("not found")
      ? 404
      : message.includes("required") || message.includes("must be") || message.includes("valid")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.accountId || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { appCode } = await context.params;

  try {
    await deleteTenantApp({
      accountId: session.user.accountId,
      tenantId: session.user.tenantId,
      appCode: decodeURIComponent(appCode),
    });
    revalidateConsoleTags(session.user.tenantId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete app";
    const status = message.includes("not found")
      ? 404
      : message.includes("cannot be deleted")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
