import { siteConfig } from "@/lib/site";

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
  description?: string;
};

/**
 * Early access — flip flags when hosted pricing & full tiers are ready.
 */
export const siteMode = {
  /** Pricing tiers, /pricing page, and "Pricing" nav */
  showPricing: false,
  /** Developers dropdown in header */
  showDevelopersMenu: true,
} as const;

export const contactNavLink: NavItem = {
  label: "Contact us",
  href: "/#contact",
};

const productLinksAll: NavItem[] = [
  {
    label: "Platform overview",
    href: "/#platform",
    description: "Headless messaging stack",
  },
  {
    label: "How it works",
    href: "/#how-it-works",
    description: "Integrate in three steps",
  },
  {
    label: "Use cases",
    href: "/#use-cases",
    description: "Marketplaces & B2B SaaS",
  },
  {
    label: "Features",
    href: "/#features",
    description: "Rooms, webhooks, presence",
  },
  {
    label: "Documentation",
    href: siteConfig.docsUrl,
    external: true,
    description: "Integration guides",
  },
  {
    label: "Contact",
    href: siteConfig.earlyAccessMailto,
    external: true,
    description: "Email for early access",
  },
];

/** Hide docs from Product menu when Developers dropdown is shown. */
export const productLinks = siteMode.showDevelopersMenu
  ? productLinksAll.filter((item) => item.label !== "Documentation")
  : productLinksAll;

export const developerLinks: NavItem[] = [
  {
    label: "Documentation",
    href: siteConfig.docsUrl,
    external: true,
    description: "Integration guides",
  },
  {
    label: "Telegram",
    href: siteConfig.contactTelegram,
    external: true,
    description: "Chat with us directly",
  },
];

export const visibleTopNavLinks: NavItem[] = [
  ...(siteMode.showPricing
    ? [{ label: "Pricing", href: "/pricing" }]
    : [contactNavLink]),
  { label: "Blog", href: "/blog" },
];

/** @deprecated use siteMode */
export const navVisibility = {
  pricing: siteMode.showPricing,
  developers: siteMode.showDevelopersMenu,
} as const;
