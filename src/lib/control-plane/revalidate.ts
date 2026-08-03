import "server-only";

import { revalidateTag } from "next/cache";

/** Invalidate short-lived console caches after mutations. */
export function revalidateConsoleTags(tenantId: string, ...extra: string[]) {
  const tags = new Set([
    `credentials:${tenantId}`,
    `settings:${tenantId}`,
    `webhook-test:${tenantId}`,
    `usage:${tenantId}`,
    ...extra,
  ]);
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
}
