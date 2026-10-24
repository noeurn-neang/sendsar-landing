import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createAbaCheckout } from "@/lib/billing/aba-payway";
import { isAbaPaywayEnabled, getAbaPaywayConfig } from "@/lib/billing/config";
import { ConsoleApiError } from "@/lib/console-api";
import { createBillingPayment } from "@/lib/control-plane/billing";
import { getCheckoutAmountUsd, type BillingPeriod } from "@/lib/pricing";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.accountId || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAbaPaywayEnabled()) {
    return NextResponse.json(
      { error: "ABA PayWay is not available. Please contact us on Telegram." },
      { status: 503 },
    );
  }

  let body: { planId?: string; period?: string };
  try {
    body = (await request.json()) as { planId?: string; period?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const planId = (body.planId ?? "").trim().toLowerCase();
  const period = (body.period ?? "").trim().toLowerCase() as BillingPeriod;
  if (planId !== "plus" && planId !== "pro") {
    return NextResponse.json({ error: "Plan must be plus or pro" }, { status: 400 });
  }
  if (period !== "monthly" && period !== "annual") {
    return NextResponse.json({ error: "Period must be monthly or annual" }, { status: 400 });
  }

  const amountUsd = getCheckoutAmountUsd(planId, period);
  if (amountUsd == null || amountUsd <= 0) {
    return NextResponse.json({ error: "Could not resolve plan price" }, { status: 400 });
  }

  const config = getAbaPaywayConfig();

  try {
    const checkout = await createAbaCheckout(amountUsd);
    const payment = await createBillingPayment({
      accountId: session.user.accountId,
      tenantId: session.user.tenantId,
      plan: planId,
      period,
      amountUsd,
      currency: "USD",
      clientId: checkout.clientId,
      deviceId: checkout.deviceId,
      abaToken: checkout.token,
      expiresIn: checkout.expiresIn,
    });

    return NextResponse.json({
      paymentId: payment.id,
      qrString: checkout.qrString,
      clientId: checkout.clientId,
      amount: checkout.amount,
      currency: checkout.currency,
      expiresIn: checkout.expiresIn,
      merchantName: checkout.merchantName,
      pollInterval: config.pollIntervalSec,
      planId,
      period,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const consoleStatus = err instanceof ConsoleApiError ? err.status : undefined;
    console.error("[billing/aba/create] FAILED", {
      message,
      consoleStatus,
      planId,
      period,
      amountUsd,
      paymentLinkId: config.paymentLinkId,
    });

    let detail = message;
    if (consoleStatus === 404) {
      detail =
        "Console API 404 — deploy gateway with billing routes + migration 000010_billing_payments.";
    }

    return NextResponse.json(
      {
        error: "Failed to create ABA QR. Please try again or contact us.",
        detail,
      },
      { status: 502 },
    );
  }
}
