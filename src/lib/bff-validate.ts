import "server-only";

/** Lightweight BFF body checks (no zod dependency). */

export function asTrimmedString(value: unknown, max = 200): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

export function asOptionalTrimmedString(
  value: unknown,
  max = 500,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (trimmed.length > max) return undefined;
  return trimmed;
}

export function asOptionalObject<T extends Record<string, unknown>>(
  value: unknown,
): T | undefined {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value as T;
}

const APP_CODE_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

export function asAppCode(value: unknown): string | null {
  const s = asTrimmedString(value, 64);
  if (!s || !APP_CODE_RE.test(s)) return null;
  return s;
}
