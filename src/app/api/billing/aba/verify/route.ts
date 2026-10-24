import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { checkAbaPaymentStatus } from "@/lib/billing/aba-payway";
import { isAbaPaywayEnabled } from "@/lib/billing/config";
import {
  completeBillingPayment,
  getBillingPayment,
} from "@/lib/control-plane/billing";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.accountId || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAbaPaywayEnabled()) {
    return NextResponse.json(
      { error: "ABA PayWay is not available" },
      { status: 503 },
    );
  }

  let body: { paymentId?: string; clientId?: string };
  try {
    body = (await request.json()) as { paymentId?: string; clientId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const paymentId = (body.paymentId ?? "").trim();
  const clientId = (body.clientId ?? "").trim();
  if (!paymentId || !clientId) {
    return NextResponse.json(
      { error: "paymentId and clientId are required" },
      { status: 400 },
    );
  }

  const payment = await getBillingPayment(
    session.user.accountId,
    session.user.tenantId,
    paymentId,
  );
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }
  if (payment.clientId !== clientId) {
    return NextResponse.json({ error: "clientId mismatch" }, { status: 422 });
  }

  if (payment.status === "paid") {
    return NextResponse.json({
      status: 1,
      plan: payment.plan,
      redirect: "/dashboard/billing?upgraded=1",
    });
  }

  if (payment.status === "expired" || payment.status === "failed") {
    return NextResponse.json({
      status: 0,
      terminal: true,
      message: "This checkout is no longer active.",
    });
  }

  const expiresAt = Date.parse(payment.expiresAt);
  if (Number.isFinite(expiresAt) && expiresAt < Date.now()) {
    return NextResponse.json({
      status: 0,
      expired: true,
      redirect: "/dashboard/billing",
    });
  }

  if (!payment.abaToken) {
    return NextResponse.json({
      status: 0,
      verification_error: true,
      message: "Missing payment token — start a new checkout.",
    });
  }

  const aba = await checkAbaPaymentStatus({
    token: payment.abaToken,
    clientId: payment.clientId,
    deviceId: payment.deviceId,
  });

  if (aba.state === "pending") {
    return NextResponse.json({ status: 0, pending: true });
  }
  if (aba.state === "terminal") {
    return NextResponse.json({
      status: 0,
      terminal: true,
      message: aba.message ?? "Payment failed or expired",
    });
  }
  if (aba.state === "error") {
    return NextResponse.json({
      status: 0,
      verification_error: true,
      message: aba.message ?? "Unable to verify — keep this page open.",
    });
  }

  try {
    const completed = await completeBillingPayment({
      accountId: session.user.accountId,
      tenantId: session.user.tenantId,
      paymentId,
      transactionRef: aba.transactionRef,
    });
    return NextResponse.json({
      status: 1,
      plan: completed.plan,
      redirect: "/dashboard/billing?upgraded=1",
    });
  } catch (err) {
    console.error("[billing/aba/verify]", err instanceof Error ? err.message : err);
    return NextResponse.json({
      status: 0,
      verification_error: true,
      message: "Paid but plan update failed — contact support with your tenant ID.",
    });
  }
}
