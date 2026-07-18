/** Shared dashboard number helpers. */

export function usagePercent(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

export function formatMinutes(value: number): string {
  if (value < 10) return value.toFixed(1);
  return formatCount(value);
}

export function formatStorageGB(bytes: number): number {
  return Math.round((bytes / (1024 * 1024 * 1024)) * 100) / 100;
}

export function currentPeriodLabel(date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}
