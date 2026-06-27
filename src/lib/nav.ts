import { siteConfig } from "@/lib/site";

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
  description?: string;
};

/** Homepage sections and key pages — docs live under Developers. */
export const productLinks: NavItem[] = [
  {
    label: "Platform overview",
    href: "/#platform",
    description: "Messaging, voice, and video",
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
    description: "Rooms, webhooks, calls",
  },
  {
    label: "Pricing",
    href: "/pricing",
    description: "Free, Plus, Pro, Enterprise",
  },
  {
    label: "Contact",
    href: "/#contact",
    description: "Email or Telegram",
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
    label: "Quickstart",
    href: siteConfig.quickstartUrl,
    external: true,
    description: "Ship your first room",
  },
  {
    label: "Telegram",
    href: siteConfig.contactTelegram,
    external: true,
    description: "Chat with us directly",
  },
];

export const visibleTopNavLinks: NavItem[] = [
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];
