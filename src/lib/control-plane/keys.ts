import "server-only";

/** Local masking for UI — never expose long prefixes of live secrets in SSR HTML. */
export function maskSecret(value: string): string {
  if (!value || value.length < 8) {
    return "••••••••••••";
  }
  return `••••••••••••••••${value.slice(-4)}`;
}
