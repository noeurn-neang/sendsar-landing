const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "console",
  "dashboard",
  "demo",
  "docs",
  "help",
  "login",
  "onboarding",
  "register",
  "start",
  "www",
]);

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || "workspace";
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export function normalizeSlugInput(value: string): string {
  const slug = slugify(value);
  if (isReservedSlug(slug)) {
    return `${slug}-workspace`;
  }
  return slug;
}
