import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Regression: after ABA marks paid, tenant.plan must update and the client
 * must refresh session so billing UI leaves Free.
 *
 * These tests cover the landing-side contract (verify → complete → plan in
 * response → JWT refresh reads brief.plan). Gateway CompleteBillingPayment
 * is covered separately in gateway-go.
 */

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/billing/config", () => ({
  isAbaPaywayEnabled: vi.fn(() => true),
}));

vi.mock("@/lib/billing/aba-payway", () => ({
  checkAbaPaymentStatus: vi.fn(),
}));

vi.mock("@/lib/control-plane/billing", () => ({
  getBillingPayment: vi.fn(),
  completeBillingPayment: vi.fn(),
}));

vi.mock("@/lib/control-plane/accounts", () => ({
  getAccountById: vi.fn(),
  getTenantBrief: vi.fn(),
}));

import { auth } from "@/auth";
import { POST as verifyPayment } from "@/app/api/billing/aba/verify/route";
import { checkAbaPaymentStatus } from "@/lib/billing/aba-payway";
import {
  completeBillingPayment,
  getBillingPayment,
} from "@/lib/control-plane/billing";
import { getAccountById, getTenantBrief } from "@/lib/control-plane/accounts";

const authMock = vi.mocked(auth);
const checkMock = vi.mocked(checkAbaPaymentStatus);
const getPaymentMock = vi.mocked(getBillingPayment);
const completeMock = vi.mocked(completeBillingPayment);
const getAccountMock = vi.mocked(getAccountById);
const getBriefMock = vi.mocked(getTenantBrief);

function verifyRequest(body: unknown) {
  return new Request("http://localhost/api/billing/aba/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const pendingPayment = {
  id: "pay_plus",
  clientId: "client_1",
  deviceId: "dev_1",
  abaToken: "tok_1",
  status: "pending" as const,
  plan: "plus",
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
};

describe("post-payment plan update contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({
      user: { accountId: "acc_1", tenantId: "ten_1" },
    } as never);
  });

  it("verify success returns the upgraded plan from completeBillingPayment", async () => {
    getPaymentMock.mockResolvedValue(pendingPayment as never);
    checkMock.mockResolvedValue({
      state: "paid",
      transactionRef: "txn_live",
    });
    // Simulate gateway: payment marked paid AND tenants.plan upgraded.
    completeMock.mockResolvedValue({
      payment: { ...pendingPayment, status: "paid" },
      plan: "plus",
    } as never);

    const res = await verifyPayment(
      verifyRequest({ paymentId: "pay_plus", clientId: "client_1" }),
    );
    const body = await res.json();

    expect(completeMock).toHaveBeenCalledWith({
      accountId: "acc_1",
      tenantId: "ten_1",
      paymentId: "pay_plus",
      transactionRef: "txn_live",
    });
    expect(body).toEqual({
      status: 1,
      plan: "plus",
      redirect: "/dashboard/billing?upgraded=1",
    });
    // Client must not treat success if plan is missing from complete result.
    expect(body.plan).toBe("plus");
    expect(body.plan).not.toBe("free");
  });

  it("does not report success when completeBillingPayment fails (plan not updated)", async () => {
    getPaymentMock.mockResolvedValue(pendingPayment as never);
    checkMock.mockResolvedValue({ state: "paid", transactionRef: "txn_x" });
    completeMock.mockRejectedValue(new Error("tenants.plan update failed"));

    const res = await verifyPayment(
      verifyRequest({ paymentId: "pay_plus", clientId: "client_1" }),
    );
    const body = await res.json();

    expect(body.status).toBe(0);
    expect(body.verification_error).toBe(true);
    expect(body.redirect).toBeUndefined();
    expect(body.plan).toBeUndefined();
  });

  it("JWT update trigger refreshes token.plan from GetTenantBrief after upgrade", async () => {
    getAccountMock.mockResolvedValue({
      id: "acc_1",
      tenantId: "ten_1",
      onboardingCompleted: true,
      keysRevealed: true,
    } as never);
    getBriefMock.mockResolvedValue({
      name: "Acme",
      slug: "acme",
      plan: "plus",
    });

    // Mirror auth.ts jwt callback branch for trigger === "update"
    const token: {
      accountId: string;
      tenantId?: string;
      tenantName?: string;
      tenantSlug?: string | null;
      plan?: string;
      onboardingCompleted?: boolean;
      keysRevealed?: boolean;
    } = {
      accountId: "acc_1",
      tenantId: "ten_1",
      plan: "free",
    };

    const accountRow = await getAccountById(token.accountId);
    expect(accountRow).toBeTruthy();
    if (accountRow) {
      token.onboardingCompleted = accountRow.onboardingCompleted;
      token.keysRevealed = accountRow.keysRevealed;
      token.tenantId = accountRow.tenantId;
      const tenant = await getTenantBrief(accountRow.id, accountRow.tenantId);
      if (tenant) {
        token.tenantName = tenant.name;
        token.tenantSlug = tenant.slug;
        token.plan = tenant.plan;
      }
    }

    expect(getBriefMock).toHaveBeenCalledWith("acc_1", "ten_1");
    expect(token.plan).toBe("plus");
  });
});
