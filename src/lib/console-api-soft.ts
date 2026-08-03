import "server-only";

import { ConsoleApiError, consoleFetch } from "@/lib/console-api";

/**
 * Like consoleFetch, but network/timeout errors return null instead of throwing.
 * Use for non-critical dashboard widgets so one slow Contabo round-trip
 * does not crash the whole RSC page when the user navigates quickly.
 */
export async function consoleFetchSoft<T>(
  path: string,
  options: Parameters<typeof consoleFetch<T>>[1] = {},
): Promise<T | null> {
  try {
    return await consoleFetch<T>(path, {
      ...options,
      allowEmpty: true,
      // Fail fast under remote-DB load so the page can soft-degrade.
      timeoutMs: options?.timeoutMs ?? 12_000,
    });
  } catch (err) {
    if (err instanceof ConsoleApiError) {
      console.error(`[console] soft-fail ${path}:`, err.message);
      return null;
    }
    console.error(`[console] soft-fail ${path}:`, err);
    return null;
  }
}
