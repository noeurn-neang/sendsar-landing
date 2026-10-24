import { describe, expect, it } from "vitest";

import { buildUpgradeMailto, buildUpgradeTelegramUrl } from "@/lib/billing/contact";
import { siteConfig } from "@/lib/site";

describe("buildUpgradeTelegramUrl", () => {
  it("embeds tenant and plan details in the prefilled message", () => {
    const url = buildUpgradeTelegramUrl({
      tenantId: "ten_1",
      slug: "acme",
      currentPlan: "Free",
      desiredPlan: "Plus",
      period: "monthly",
    });

    expect(url.startsWith(siteConfig.contactTelegram)).toBe(true);
    const text = decodeURIComponent(new URL(url).searchParams.get("text") ?? "");
    expect(text).toContain("Tenant ID: ten_1");
    expect(text).toContain("Slug: acme");
    expect(text).toContain("Current plan: Free");
    expect(text).toContain("Desired plan: Plus");
    expect(text).toContain("Period: monthly");
  });
});

describe("buildUpgradeMailto", () => {
  it("builds a mailto with subject and body", () => {
    const href = buildUpgradeMailto({
      tenantId: "ten_1",
      slug: "acme",
      currentPlan: "Free",
      desiredPlan: "Pro",
      period: "annual",
    });

    expect(href.startsWith(`mailto:${siteConfig.contactEmail}?`)).toBe(true);
    expect(href).toContain("subject=");
    expect(href).toContain("body=");
    expect(decodeURIComponent(href)).toContain("Desired plan: Pro (annual)");
    expect(decodeURIComponent(href)).toContain("Tenant ID: ten_1");
  });
});
