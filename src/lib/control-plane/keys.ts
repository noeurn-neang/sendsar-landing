import "server-only";

/** Local masking for UI — key generation happens on gateway. */
export function maskSecret(value: string): string {
  if (value.length <= 12) {
    return "••••••••••••";
  }
  return `${value.slice(0, 12)}••••••••••••••••${value.slice(-4)}`;
}
