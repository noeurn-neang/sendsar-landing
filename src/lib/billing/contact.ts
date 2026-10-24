import { siteConfig } from "@/lib/site";

export function buildUpgradeTelegramUrl(input: {
  tenantId: string;
  slug: string | null;
  currentPlan: string;
  desiredPlan?: string;
  period?: string;
}): string {
  const lines = [
    "Hi Sendsar — I'd like to upgrade my workspace.",
    "",
    `Tenant ID: ${input.tenantId}`,
    `Slug: ${input.slug ?? "n/a"}`,
    `Current plan: ${input.currentPlan}`,
  ];
  if (input.desiredPlan) {
    lines.push(`Desired plan: ${input.desiredPlan}`);
  }
  if (input.period) {
    lines.push(`Period: ${input.period}`);
  }
  lines.push("", "Thanks!");

  const base = siteConfig.contactTelegram.replace(/\/$/, "");
  return `${base}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function buildUpgradeMailto(input: {
  tenantId: string;
  slug: string | null;
  currentPlan: string;
  desiredPlan?: string;
  period?: string;
}): string {
  const subject = encodeURIComponent(
    `Sendsar upgrade request — ${input.slug ?? input.tenantId}`,
  );
  const desired = input.desiredPlan
    ? `${input.desiredPlan}${input.period ? ` (${input.period})` : ""}`
    : "Plus / Pro";
  const body = encodeURIComponent(
    `Hi Sendsar team,\n\nI'd like to upgrade my workspace.\n\nTenant ID: ${input.tenantId}\nSlug: ${input.slug ?? "n/a"}\nCurrent plan: ${input.currentPlan}\nDesired plan: ${desired}\n\nThanks!`,
  );
  return `mailto:${siteConfig.contactEmail}?subject=${subject}&body=${body}`;
}
