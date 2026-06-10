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
    label: "Live demo",
    href: siteConfig.demoUrl,
    external: true,
    description: "See a working integration",
  },
];

export const developerLinks: NavItem[] = [
  {
    label: "Documentation",
    href: siteConfig.docsUrl,
    external: true,
    description: "Quickstart & guides",
  },
  {
    label: "API reference",
    href: `${siteConfig.docsUrl}/api/`,
    external: true,
    description: "REST endpoints",
  },
  {
    label: "GitHub",
    href: siteConfig.githubUrl,
    external: true,
    description: "Open source gateway",
  },
];

export const topNavLinks: NavItem[] = [
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];
