import "server-only";

import { createHash, randomBytes } from "crypto";

import { getAbaPaywayConfig } from "@/lib/billing/config";

export type AbaCheckout = {
  qrString: string;
  token: string;
  clientId: string;
  deviceId: string;
  merchantName: string;
  expiresIn: number;
  amount: string;
  currency: "USD";
};

export type AbaStatusState = "pending" | "paid" | "terminal" | "error";

export type AbaStatusResult = {
  state: AbaStatusState;
  message?: string;
  transactionRef?: string;
};

function sha512Hex(input: string): string {
  return createHash("sha512").update(input, "utf8").digest("hex");
}

function requestTime(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
}

export function generateDeviceId(configured?: string): string {
  if (configured && configured.trim()) return configured.trim();
  return randomBytes(5).toString("hex");
}

function formatAmountUsd(amount: number): string {
  return amount.toFixed(2);
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

function pickQrString(data: Record<string, unknown>): string | null {
  for (const key of ["qr_string", "khqr", "qr", "qr_code", "qrCode"]) {
    const v = data[key];
    if (typeof v === "string" && v.startsWith("000201")) return v;
  }
  return null;
}

function truncateBody(text: string, max = 500): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max)}…`;
}

function redactForLog(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    const lower = key.toLowerCase();
    if (lower.includes("token") || lower.includes("hash") || lower.includes("aba_data")) {
      out[key] = typeof value === "string" ? `[redacted len=${value.length}]` : "[redacted]";
      continue;
    }
    out[key] = value;
  }
  return out;
}

function statusSummary(data: Record<string, unknown>): string {
  const status = data.status;
  if (status && typeof status === "object" && !Array.isArray(status)) {
    const s = status as Record<string, unknown>;
    const code = s.code != null ? String(s.code) : "?";
    const message =
      typeof s.message === "string"
        ? s.message
        : typeof data.message === "string"
          ? data.message
          : "";
    return message ? `status.code=${code} message=${message}` : `status.code=${code}`;
  }
  if (typeof data.message === "string") return data.message;
  return "no status object";
}

async function abaPost(
  path: string,
  payload: Record<string, unknown>,
  options: { headers?: Record<string, string>; quiet?: boolean } = {},
): Promise<Record<string, unknown>> {
  const config = getAbaPaywayConfig();
  const url = `${config.apiBaseUrl}/${path.replace(/^\//, "")}`;
  const quiet = Boolean(options.quiet);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, 400));
    }
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          language: "en",
          "User-Agent":
            "Mozilla/5.0 (compatible; SendsarBilling/1.0; +https://sendsar.com)",
          ...options.headers,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20_000),
        cache: "no-store",
      });

      const rawText = await response.text();
      if (!response.ok) {
        const detail = truncateBody(rawText);
        console.error("[aba] HTTP error", {
          path,
          status: response.status,
          attempt: attempt + 1,
          body: detail,
        });
        lastError = new Error(
          `ABA ${path} failed HTTP ${response.status}: ${detail || "(empty body)"}`,
        );
        if (response.status === 403) continue;
        throw lastError;
      }

      let data: unknown;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        console.error("[aba] Non-JSON response", {
          path,
          body: truncateBody(rawText),
        });
        throw new Error(`ABA ${path} returned non-JSON body: ${truncateBody(rawText)}`);
      }

      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error(`ABA ${path} returned malformed response data.`);
      }

      if (!quiet) {
        console.info("[aba]", path, statusSummary(data as Record<string, unknown>));
      }
      return data as Record<string, unknown>;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === 2) throw lastError;
      if (
        lastError.message.includes("HTTP 403") ||
        lastError.name === "TimeoutError" ||
        lastError.message.includes("fetch failed")
      ) {
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error("ABA request failed.");
}

function statusCodeOk(data: Record<string, unknown>): boolean {
  const status = data.status;
  if (status && typeof status === "object" && !Array.isArray(status)) {
    const code = (status as Record<string, unknown>).code;
    return code === "00" || code === 0;
  }
  return true;
}

export async function createAbaCheckout(amountUsd: number): Promise<AbaCheckout> {
  const config = getAbaPaywayConfig();
  if (!config.enabled) {
    throw new Error("ABA PayWay is not enabled");
  }

  const amount = formatAmountUsd(amountUsd);
  if (!(Number.parseFloat(amount) > 0)) {
    throw new Error("Amount must be greater than zero");
  }

  const deviceId = generateDeviceId(config.deviceId);
  const rt1 = requestTime();
  const validate = await abaPost("/pw-app/v1/payment/gateway/validate-payment-link-v2", {
    instore_transaction_id: config.paymentLinkId,
    request_time: rt1,
    hash: sha512Hex(rt1 + config.paymentLinkId),
  });

  if (!statusCodeOk(validate)) {
    console.error("[aba] validate rejected", redactForLog(validate));
    throw new Error(`ABA validate-payment-link rejected: ${statusSummary(validate)}`);
  }
  const abaData = validate.aba_data;
  if (typeof abaData !== "string" || !abaData) {
    console.error("[aba] validate missing aba_data", {
      keys: Object.keys(validate),
      summary: statusSummary(validate),
    });
    throw new Error("ABA payment link validation missing aba_data");
  }

  const additionalFields = JSON.stringify({ amount });
  const rt2 = requestTime();
  const options = await abaPost("/pw-app/v1/payment/gateway/list-payment-options", {
    additional_fields: additionalFields,
    request_time: rt2,
    aba_data: abaData,
    hash: sha512Hex(rt2 + abaData + additionalFields),
  });

  if (!statusCodeOk(options)) {
    console.error("[aba] list-payment-options rejected", redactForLog(options));
    throw new Error(`ABA list-payment-options rejected: ${statusSummary(options)}`);
  }

  const qrString = pickQrString(options);
  const token = typeof options.token === "string" ? options.token : null;
  const clientId = typeof options.client_id === "string" ? options.client_id : null;
  if (!qrString || !token || !clientId) {
    console.error("[aba] QR response incomplete", {
      hasQr: Boolean(qrString),
      hasToken: Boolean(token),
      hasClientId: Boolean(clientId),
      keys: Object.keys(options),
    });
    throw new Error("ABA QR response missing qr, token, or client_id");
  }

  const expiresIn =
    typeof options.expire_in_sec === "number" && options.expire_in_sec > 0
      ? options.expire_in_sec
      : config.defaultExpiresInSec;

  const fromQr = parseKhqrMerchantName(qrString);
  const merchantName = config.merchantName || fromQr || "Sendsar";

  return {
    qrString,
    token,
    clientId,
    deviceId,
    merchantName,
    expiresIn,
    amount,
    currency: "USD",
  };
}

function collectStatusText(payload: Record<string, unknown>): string {
  const parts: string[] = [];
  const walk = (obj: unknown) => {
    if (!obj || typeof obj !== "object") return;
    const record = obj as Record<string, unknown>;
    for (const key of ["status", "action", "message", "payment_status", "description"]) {
      const v = record[key];
      if (typeof v === "string") parts.push(v);
      else if (v && typeof v === "object") walk(v);
    }
    if (record.data && typeof record.data === "object") walk(record.data);
  };
  walk(payload);
  return parts.join(" ").toLowerCase();
}

function matchWholeWord(haystack: string, word: string): boolean {
  return new RegExp(`\\b${word}\\b`, "i").test(haystack);
}

export async function checkAbaPaymentStatus(input: {
  token: string;
  clientId: string;
  deviceId: string;
}): Promise<AbaStatusResult> {
  try {
    const rt = requestTime();
    const data = await abaPost(
      "/pw-app/v1/payment-link/check-payment-status",
      {
        device_id: input.deviceId,
        request_time: rt,
        client_id: input.clientId,
        hash: sha512Hex(input.clientId + input.deviceId + rt),
      },
      { headers: { token: input.token }, quiet: true },
    );

    const text = collectStatusText(data);
    if (
      matchWholeWord(text, "paid") ||
      matchWholeWord(text, "approved") ||
      matchWholeWord(text, "completed")
    ) {
      const ref =
        (typeof data.transaction_id === "string" && data.transaction_id) ||
        (typeof data.tran_id === "string" && data.tran_id) ||
        input.clientId;
      return { state: "paid", transactionRef: ref };
    }
    if (
      matchWholeWord(text, "expired") ||
      matchWholeWord(text, "failed") ||
      matchWholeWord(text, "declined") ||
      text.includes("validation required")
    ) {
      return { state: "terminal", message: text || "Payment failed or expired" };
    }
    return { state: "pending" };
  } catch (err) {
    console.error("[aba] checkStatus error", err instanceof Error ? err.message : err);
    return {
      state: "error",
      message: err instanceof Error ? err.message : "Unable to verify payment",
    };
  }
}
