import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/billing/config", () => ({
  isAbaPaywayEnabled: vi.fn(),
  getAbaPaywayConfig: vi.fn(),
}));

vi.mock("@/lib/billing/aba-payway", () => ({
  createAbaCheckout: vi.fn(),
}));

vi.mock("@/lib/control-plane/billing", () => ({
  createBillingPayment: vi.fn(),
}));

import { auth } from "@/auth";
import { POST } from "@/app/api/billing/aba/create/route";
import { createAbaCheckout } from "@/lib/billing/aba-payway";
import { getAbaPaywayConfig, isAbaPaywayEnabled } from "@/lib/billing/config";
import { createBillingPayment } from "@/lib/control-plane/billing";

const authMock = vi.mocked(auth);
const enabledMock = vi.mocked(isAbaPaywayEnabled);
const configMock = vi.mocked(getAbaPaywayConfig);
const checkoutMock = vi.mocked(createAbaCheckout);
const createPaymentMock = vi.mocked(createBillingPayment);

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/billing/aba/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/billing/aba/create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enabledMock.mockReturnValue(true);
    configMock.mockReturnValue({
      enabled: true,
      apiBaseUrl: "https://link.payway.com.kh/api",
      paymentLinkId: "ABAPAY1",
      deviceId: "",
      merchantName: "Sendsar",
      pollIntervalSec: 3,
      defaultExpiresInSec: 180,
    });
    authMock.mockResolvedValue({
      user: { accountId: "acc_1", tenantId: "ten_1" },
    } as never);
  });

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null as never);
    const res = await POST(jsonRequest({ planId: "plus", period: "monthly" }));
    expect(res.status).toBe(401);
  });

  it("returns 503 when ABA disabled", async () => {
    enabledMock.mockReturnValue(false);
    const res = await POST(jsonRequest({ planId: "plus", period: "monthly" }));
    expect(res.status).toBe(503);
  });

  it("rejects invalid plan / period", async () => {
    expect((await POST(jsonRequest({ planId: "free", period: "monthly" }))).status).toBe(
      400,
    );
    expect((await POST(jsonRequest({ planId: "plus", period: "weekly" }))).status).toBe(
      400,
    );
  });

  it("creates checkout + billing payment and returns QR payload", async () => {
    checkoutMock.mockResolvedValue({
      qrString: "0002015907SENDSAR6304ABCD",
      token: "tok",
      clientId: "client_1",
      deviceId: "dev_1",
      merchantName: "Sendsar",
      expiresIn: 180,
      amount: "29.00",
      currency: "USD",
    });
    createPaymentMock.mockResolvedValue({ id: "pay_1" } as never);

    const res = await POST(jsonRequest({ planId: "plus", period: "monthly" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      paymentId: "pay_1",
      qrString: "0002015907SENDSAR6304ABCD",
      clientId: "client_1",
      amount: "29.00",
      currency: "USD",
      merchantName: "Sendsar",
      pollInterval: 3,
      planId: "plus",
      period: "monthly",
    });
    expect(createPaymentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: "acc_1",
        tenantId: "ten_1",
        plan: "plus",
        period: "monthly",
        clientId: "client_1",
        abaToken: "tok",
      }),
    );
  });

  it("returns 502 when ABA checkout fails", async () => {
    checkoutMock.mockRejectedValue(new Error("ABA validate failed"));
    const res = await POST(jsonRequest({ planId: "pro", period: "annual" }));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toMatch(/Failed to create ABA QR/i);
    expect(body.detail).toContain("ABA validate failed");
  });
});
