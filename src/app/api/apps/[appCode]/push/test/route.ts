import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { testTenantAppPush } from "@/lib/control-plane/apps";

type RouteContext = { params: Promise<{ appCode: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.accountId || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { appCode } = await context.params;

  let body: {
    provider?: string;
    title?: string;
    description?: string;
    tokens?: string[];
    data?: Record<string, unknown>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.tokens || !Array.isArray(body.tokens) || body.tokens.length === 0) {
    return NextResponse.json(
      { error: "At least one target device token must be provided" },
      { status: 400 },
    );
  }

  try {
    const result = await testTenantAppPush({
      accountId: session.user.accountId,
      tenantId: session.user.tenantId,
      appCode: decodeURIComponent(appCode),
      provider: body.provider,
      title: body.title,
      description: body.description,
      tokens: body.tokens,
      data: body.data,
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Push test failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
