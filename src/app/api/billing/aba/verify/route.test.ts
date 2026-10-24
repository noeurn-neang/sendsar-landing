import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/billing/config", () => ({
  isAbaPaywayEnabled: vi.fn(),
}));

vi.mock("@/lib/billing/aba-payway", () => ({
  checkAbaPaymentStatus: vi.fn(),
}));

vi.mock("@/lib/control-plane/billing", () => ({
  getBillingPayment: vi.fn(),
  completeBillingPayment: vi.fn(),
}));

import { auth } from "@/auth";
import { POST } from "@/app/api/billing/aba/verify/route";
import { checkAbaPaymentStatus } from "@/lib/billing/aba-payway";
import { isAbaPaywayEnabled } from "@/lib/billing/config";
import {
  completeBillingPayment,
  getBillingPayment,
} from "@/lib/control-plane/billing";

const authMock = vi.mocked(auth);
const enabledMock = vi.mocked(isAbaPaywayEnabled);
const checkMock = vi.mocked(checkAbaPaymentStatus);
const getPaymentMock = vi.mocked(getBillingPayment);
const completeMock = vi.mocked(completeBillingPayment);

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/billing/aba/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const pendingPayment = {
  id: "pay_1",
  clientId: "client_1",
  deviceId: "dev_1",
  abaToken: "tok_1",
  status: "pending" as const,
  plan: "plus",
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
};

describe("POST /api/billing/aba/verify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enabledMock.mockReturnValue(true);
    authMock.mockResolvedValue({
      user: { accountId: "acc_1", tenantId: "ten_1" },
    } as never);
  });

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null as never);
    const res = await POST(jsonRequest({ paymentId: "pay_1", clientId: "client_1" }));
    expect(res.status).toBe(401);
  });

  it("returns 503 when ABA is disabled", async () => {
    enabledMock.mockReturnValue(false);
    const res = await POST(jsonRequest({ paymentId: "pay_1", clientId: "client_1" }));
    expect(res.status).toBe(503);
  });

  it("returns 400 when paymentId/clientId missing", async () => {
    const res = await POST(jsonRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns pending while ABA still requests QR", async () => {
    getPaymentMock.mockResolvedValue(pendingPayment as never);
    checkMock.mockResolvedValue({ state: "pending" });

    const res = await POST(
      jsonRequest({ paymentId: "pay_1", clientId: "client_1" }),
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ status: 0, pending: true });
    expect(completeMock).not.toHaveBeenCalled();
  });

  it("completes billing and returns redirect when ABA reports paid", async () => {
    getPaymentMock.mockResolvedValue(pendingPayment as never);
    checkMock.mockResolvedValue({
      state: "paid",
      transactionRef: "txn_99",
    });
    completeMock.mockResolvedValue({ plan: "plus" } as never);

    const res = await POST(
      jsonRequest({ paymentId: "pay_1", clientId: "client_1" }),
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      status: 1,
      plan: "plus",
      redirect: "/dashboard/billing?upgraded=1",
    });
    expect(completeMock).toHaveBeenCalledWith({
      accountId: "acc_1",
      tenantId: "ten_1",
      paymentId: "pay_1",
      transactionRef: "txn_99",
    });
  });

  it("short-circuits when payment already paid", async () => {
    getPaymentMock.mockResolvedValue({
      ...pendingPayment,
      status: "paid",
    } as never);

    const res = await POST(
      jsonRequest({ paymentId: "pay_1", clientId: "client_1" }),
    );
    await expect(res.json()).resolves.toMatchObject({
      status: 1,
      plan: "plus",
      redirect: "/dashboard/billing?upgraded=1",
    });
    expect(checkMock).not.toHaveBeenCalled();
    expect(completeMock).not.toHaveBeenCalled();
  });

  it("returns terminal when ABA declines", async () => {
    getPaymentMock.mockResolvedValue(pendingPayment as never);
    checkMock.mockResolvedValue({
      state: "terminal",
      message: "declined",
    });

    const res = await POST(
      jsonRequest({ paymentId: "pay_1", clientId: "client_1" }),
    );
    await expect(res.json()).resolves.toEqual({
      status: 0,
      terminal: true,
      message: "declined",
    });
    expect(completeMock).not.toHaveBeenCalled();
  });

  it("rejects clientId mismatch", async () => {
    getPaymentMock.mockResolvedValue(pendingPayment as never);
    const res = await POST(
      jsonRequest({ paymentId: "pay_1", clientId: "wrong" }),
    );
    expect(res.status).toBe(422);
  });
});
