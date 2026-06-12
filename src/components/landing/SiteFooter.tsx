import Link from "next/link";

import { Logo } from "@/components/landing/Logo";
import { siteMode } from "@/lib/nav";
import { siteConfig } from "@/lib/site";

const footerLinks = {
  Product: [
    { label: "Platform overview", href: "/#platform" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Features", href: "/#features" },
    ...(siteMode.showPricing
      ? [{ label: "Pricing", href: "/pricing" }]
      : [{ label: "Contact us", href: "/#contact" }]),
    { label: "Use cases", href: "/#use-cases" },
  ],
  ...(siteMode.showDevelopersMenu
    ? {
        Developers: [
          { label: "Documentation", href: siteConfig.docsUrl, external: true },
          { label: "Quickstart", href: siteConfig.quickstartUrl, external: true },
          { label: "Telegram", href: siteConfig.contactTelegram, external: true },
        ],
      }
    : {}),
  Contact: [
    { label: "Email", href: siteConfig.earlyAccessMailto, external: true },
    { label: "Telegram", href: siteConfig.contactTelegram, external: true },
  ],
  Resources: [{ label: "Blog", href: "/blog" }],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo size="md" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {siteConfig.tagline}. {siteConfig.description}
            </p>
            <p className="mt-3 text-sm text-neutral-500">
              Connect any two parties.{" "}
              <span className="font-semibold text-brand-gradient">Instantly.</span>
            </p>
            <p className="mt-3 text-sm text-neutral-500">
              <a href={siteConfig.earlyAccessMailto} className="hover:text-brand">
                {siteConfig.contactEmail}
              </a>
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                {title}
              </p>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-neutral-600 transition-colors hover:text-brand dark:text-neutral-400"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-neutral-600 transition-colors hover:text-brand dark:text-neutral-400"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} direxme</p>
          <p className="font-mono text-xs">flash-chat · headless · api-first</p>
        </div>
      </div>
    </footer>
  );
}
