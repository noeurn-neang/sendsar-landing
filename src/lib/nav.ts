import { siteConfig } from "@/lib/site";

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
  description?: string;
};

export const productLinks: NavItem[] = [
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

export const topNavLinks: NavItem[] = [
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

/** Flip to re-show header/footer items without deleting link config. */
export const navVisibility = {
  pricing: false,
  developers: false,
} as const;

export const visibleTopNavLinks = topNavLinks.filter(
  (link) => navVisibility.pricing || link.href !== "/pricing",
);
