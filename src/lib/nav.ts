import { siteConfig } from "@/lib/site";

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
  description?: string;
};

const docsBase = siteConfig.docsUrl.replace(/\/$/, "");

/** Slim product anchors that still exist after the home cut. */
export const productLinks: NavItem[] = [
  {
    label: "How it works",
    href: "/#how-it-works",
    description: "Mint, connect, ship",
  },
  {
    label: "Pricing",
    href: "/pricing",
    description: "Free to start",
  },
];

export const developerLinks: NavItem[] = [
  {
    label: "Documentation",
    href: siteConfig.docsUrl,
    external: true,
    description: "UI Kits, SDKs, server",
  },
  {
    label: "Quick start",
    href: siteConfig.quickstartUrl,
    external: true,
    description: "Ship in minutes",
  },
  {
    label: "UI Kits",
    href: `${docsBase}/uikit/angular/`,
    external: true,
    description: "Angular & Flutter",
  },
  {
    label: "SDKs",
    href: `${docsBase}/sdk/javascript/`,
    external: true,
    description: "JavaScript & Flutter",
  },
];

/** Top-level nav — Pricing + Docs; Start is the CTA button. */
export const visibleTopNavLinks: NavItem[] = [
  { label: "Pricing", href: "/pricing" },
  {
    label: "Docs",
    href: siteConfig.docsUrl,
    external: true,
  },
];
