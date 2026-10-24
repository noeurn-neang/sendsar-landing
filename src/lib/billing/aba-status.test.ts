import { describe, expect, it } from "vitest";

import {
  interpretAbaStatusPayload,
  normalizePaymentLinkId,
  parseKhqrMerchantName,
} from "@/lib/billing/aba-status";

describe("normalizePaymentLinkId", () => {
  it("keeps bare ABAPAY ids", () => {
    expect(normalizePaymentLinkId("ABAPAY123")).toBe("ABAPAY123");
  });

  it("strips full PayWay URLs to the id segment", () => {
    expect(
      normalizePaymentLinkId("https://link.payway.com.kh/ABAPAY123"),
    ).toBe("ABAPAY123");
  });

  it("handles trailing slash and whitespace", () => {
    expect(normalizePaymentLinkId("  https://link.payway.com.kh/ABAPAY123/  ")).toBe(
      "ABAPAY123",
    );
  });

  it("returns empty for blank input", () => {
    expect(normalizePaymentLinkId("   ")).toBe("");
  });
});

describe("parseKhqrMerchantName", () => {
  it("reads TLV tag 59", () => {
    // Minimal fake KHQR-style stream: tag 59, len 07, SENDSAR
    const qr = "0002015907SENDSAR6304ABCD";
    expect(parseKhqrMerchantName(qr)).toBe("SENDSAR");
  });

  it("returns null when tag 59 is missing", () => {
    expect(parseKhqrMerchantName("0002010102116304ABCD")).toBeNull();
  });
});

describe("interpretAbaStatusPayload", () => {
  const clientId = "client-abc";

  it("treats request_qr as pending", () => {
    const result = interpretAbaStatusPayload(
      {
        status: { code: "00", message: "Success" },
        data: { action: "request_qr" },
      },
      clientId,
    );
    expect(result).toEqual({ state: "pending" });
  });

  it("does not treat bare Success as paid while still requesting QR", () => {
    const result = interpretAbaStatusPayload(
      {
        status: { code: "00", message: "Success" },
        data: { action: "request_qr", payment_status: "pending" },
      },
      clientId,
    );
    expect(result.state).toBe("pending");
  });

  it("detects paid when action leaves request_qr", () => {
    const result = interpretAbaStatusPayload(
      {
        status: { code: "00", message: "Success" },
        data: {
          action: "payment_success",
          transaction_id: "txn-1",
        },
      },
      clientId,
    );
    expect(result).toEqual({
      state: "paid",
      transactionRef: "txn-1",
    });
  });

  it("detects paid via payment_status approved", () => {
    const result = interpretAbaStatusPayload(
      {
        data: {
          action: "confirm_payment",
          payment_status: "approved",
          tran_id: "txn-2",
        },
      },
      clientId,
    );
    expect(result.state).toBe("paid");
    expect(result.transactionRef).toBe("txn-2");
  });

  it("falls back to clientId for transactionRef", () => {
    const result = interpretAbaStatusPayload(
      { data: { action: "paid" } },
      clientId,
    );
    expect(result).toEqual({
      state: "paid",
      transactionRef: clientId,
    });
  });

  it("marks expired / declined as terminal", () => {
    expect(
      interpretAbaStatusPayload(
        { data: { action: "request_qr", message: "QR expired" } },
        clientId,
      ).state,
    ).toBe("terminal");

    expect(
      interpretAbaStatusPayload(
        { data: { action: "failed", payment_status: "declined" } },
        clientId,
      ).state,
    ).toBe("terminal");
  });

  it("treats unknown non-request action as paid (live PayWay wording)", () => {
    const result = interpretAbaStatusPayload(
      { data: { action: "settle", transaction_id: "txn-3" } },
      clientId,
    );
    expect(result).toEqual({
      state: "paid",
      transactionRef: "txn-3",
    });
  });
});
