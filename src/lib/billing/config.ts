import "server-only";

import { normalizePaymentLinkId } from "@/lib/billing/aba-status";

export type AbaPaywayConfig = {
  enabled: boolean;
  apiBaseUrl: string;
  paymentLinkId: string;
  deviceId: string;
  merchantName: string;
  pollIntervalSec: number;
  defaultExpiresInSec: number;
};

function envBool(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value.trim() === "") return fallback;
  const v = value.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function getAbaPaywayConfig(): AbaPaywayConfig {
  const paymentLinkId = normalizePaymentLinkId(
    process.env.ABA_PAYWAY_PAYMENT_LINK_ID ?? "",
  );
  const enabled =
    envBool(process.env.ABA_PAYWAY_ENABLED, false) && paymentLinkId.length > 0;

  return {
    enabled,
    apiBaseUrl: (
      process.env.ABA_PAYWAY_API_BASE_URL?.trim() || "https://link.payway.com.kh/api"
    ).replace(/\/$/, ""),
    paymentLinkId,
    deviceId: process.env.ABA_PAYWAY_DEVICE_ID?.trim() ?? "",
    merchantName: process.env.ABA_PAYWAY_MERCHANT_NAME?.trim() ?? "",
    pollIntervalSec: Math.max(
      2,
      Number.parseInt(process.env.ABA_PAYWAY_POLL_INTERVAL ?? "3", 10) || 3,
    ),
    defaultExpiresInSec: Math.max(
      60,
      Number.parseInt(process.env.ABA_PAYWAY_QR_EXPIRES_IN ?? "180", 10) || 180,
    ),
  };
}

/** Safe for server components that only need a boolean (no secrets). */
export function isAbaPaywayEnabled(): boolean {
  return getAbaPaywayConfig().enabled;
}
