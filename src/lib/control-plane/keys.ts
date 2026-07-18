import "server-only";

import { randomBytes } from "node:crypto";

export function generateApiKey(): string {
  return `sk_live_${randomBytes(24).toString("hex")}`;
}

export function generateWebhookSecret(): string {
  return `whsec_${randomBytes(24).toString("hex")}`;
}

export function maskSecret(value: string): string {
  if (value.length <= 12) {
    return "••••••••••••";
  }
  return `${value.slice(0, 12)}••••••••••••••••${value.slice(-4)}`;
}
