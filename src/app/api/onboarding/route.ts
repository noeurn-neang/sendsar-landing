import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { asTrimmedString } from "@/lib/bff-validate";
import { completeOnboarding } from "@/lib/control-plane/accounts";
import { revalidateConsoleTags } from "@/lib/control-plane/revalidate";

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
  const workspaceName = asTrimmedString(record.workspaceName, 80);
  const workspaceSlug =
    asTrimmedString(record.workspaceSlug, 80) ?? workspaceName;

  if (!workspaceName) {
    return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
  }

  try {
    const result = await completeOnboarding({
      accountId: session.user.accountId,
      tenantId: session.user.tenantId,
      workspaceName,
      workspaceSlug: workspaceSlug || workspaceName,
    });

    revalidateConsoleTags(session.user.tenantId);

    return NextResponse.json({
      ok: true,
      tenantName: result.tenantName,
      tenantSlug: result.tenantSlug,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save workspace";
    const status = message.includes("already taken") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
