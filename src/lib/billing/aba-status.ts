/**
 * Pure ABA check-payment-status interpretation (no network / server-only).
 * Keep in sync with live PayWay wording via ops logs for non-request_qr actions.
 */

export type AbaStatusState = "pending" | "paid" | "terminal" | "error";

export type AbaStatusResult = {
  state: AbaStatusState;
  message?: string;
  transactionRef?: string;
};

const pendingActions = new Set([
  "request_qr",
  "requestqr",
  "pending",
  "waiting",
  "wait_payment",
]);

function collectStatusText(payload: Record<string, unknown>): string {
  const parts: string[] = [];
  const walk = (obj: unknown) => {
    if (!obj || typeof obj !== "object") return;
    const record = obj as Record<string, unknown>;
    for (const key of ["status", "action", "message", "payment_status", "description"]) {
      const v = record[key];
      if (typeof v === "string") parts.push(v);
      else if (v && typeof v === "object" && key === "status") {
        const code = (v as Record<string, unknown>).code;
        const message = (v as Record<string, unknown>).message;
        if (code != null) parts.push(String(code));
        if (typeof message === "string" && message.toLowerCase() !== "success") {
          parts.push(message);
        }
      } else if (v && typeof v === "object") {
        walk(v);
      }
    }
    if (record.data && typeof record.data === "object") walk(record.data);
  };
  walk(payload);
  return parts.join(" ").toLowerCase();
}

function matchWholeWord(haystack: string, word: string): boolean {
  return new RegExp(`\\b${word}\\b`, "i").test(haystack);
}

function extractAction(payload: Record<string, unknown>): string {
  const data = payload.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const action = (data as Record<string, unknown>).action;
    if (typeof action === "string") return action.toLowerCase();
  }
  if (typeof payload.action === "string") return payload.action.toLowerCase();
  return "";
}

function extractPaymentStatus(payload: Record<string, unknown>): string {
  const data = payload.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const ps = (data as Record<string, unknown>).payment_status;
    if (typeof ps === "string") return ps.toLowerCase();
  }
  if (typeof payload.payment_status === "string") return payload.payment_status.toLowerCase();
  return "";
}

function transactionRefFrom(payload: Record<string, unknown>, fallback: string): string {
  for (const key of ["transaction_id", "tran_id", "transactionId", "tranId"]) {
    const v = payload[key];
    if (typeof v === "string" && v) return v;
  }
  const data = payload.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    for (const key of ["transaction_id", "tran_id", "transactionId", "tranId"]) {
      const v = (data as Record<string, unknown>)[key];
      if (typeof v === "string" && v) return v;
    }
  }
  return fallback;
}

/**
 * Map ABA check-payment-status JSON into pending | paid | terminal.
 * Unpaid polls typically keep `data.action === "request_qr"`.
 */
export function interpretAbaStatusPayload(
  data: Record<string, unknown>,
  fallbackClientId: string,
): AbaStatusResult {
  const action = extractAction(data);
  const paymentStatus = extractPaymentStatus(data);
  const text = collectStatusText(data);

  const terminal =
    matchWholeWord(text, "expired") ||
    matchWholeWord(text, "failed") ||
    matchWholeWord(text, "declined") ||
    text.includes("validation required") ||
    paymentStatus === "declined" ||
    paymentStatus === "cancelled" ||
    paymentStatus === "canceled" ||
    action.includes("expire") ||
    action.includes("fail") ||
    action.includes("decline");

  if (terminal) {
    return { state: "terminal", message: text || action || "Payment failed or expired" };
  }

  // Unpaid polls keep requesting the QR.
  if (!action || pendingActions.has(action)) {
    if (
      matchWholeWord(text, "paid") ||
      matchWholeWord(text, "approved") ||
      matchWholeWord(text, "completed") ||
      paymentStatus === "approved"
    ) {
      return {
        state: "paid",
        transactionRef: transactionRefFrom(data, fallbackClientId),
      };
    }
    return { state: "pending" };
  }

  const paidByAction =
    action.includes("paid") ||
    action.includes("success") ||
    action.includes("complete") ||
    action.includes("approve") ||
    action.includes("confirm");

  const paidByWords =
    matchWholeWord(text, "paid") ||
    matchWholeWord(text, "approved") ||
    matchWholeWord(text, "completed") ||
    paymentStatus === "approved";

  if (paidByAction || paidByWords) {
    return {
      state: "paid",
      transactionRef: transactionRefFrom(data, fallbackClientId),
    };
  }

  // Left unpaid QR-request state but wording unknown — treat as paid carefully only
  // when action is clearly not pending.
  if (action && !pendingActions.has(action) && !action.includes("request")) {
    return {
      state: "paid",
      transactionRef: transactionRefFrom(data, fallbackClientId),
    };
  }

  return { state: "pending" };
}

/** Parse KHQR TLV merchant name (tag 59). */
export function parseKhqrMerchantName(qr: string): string | null {
  let i = 0;
  while (i + 4 <= qr.length) {
    const tag = qr.slice(i, i + 2);
    const len = Number.parseInt(qr.slice(i + 2, i + 4), 10);
    if (!Number.isFinite(len) || len < 0) break;
    const value = qr.slice(i + 4, i + 4 + len);
    if (tag === "59") return value || null;
    i += 4 + len;
  }
  return null;
}

/** Accept either `ABAPAYxxx` or a full `https://link.payway.com.kh/ABAPAYxxx` URL. */
export function normalizePaymentLinkId(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  try {
    if (value.includes("://") || value.includes("/")) {
      const path = value.includes("://") ? new URL(value).pathname : value;
      const segment = path.split("/").filter(Boolean).pop() ?? "";
      return segment.trim();
    }
  } catch {
    // fall through
  }
  return value;
}
