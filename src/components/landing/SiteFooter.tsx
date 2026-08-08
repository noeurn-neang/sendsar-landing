import Link from "next/link";

import { Logo } from "@/components/landing/Logo";
import { siteConfig } from "@/lib/site";

const docsBase = siteConfig.docsUrl.replace(/\/$/, "");

const footerLinks = {
  Product: [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Pricing", href: "/pricing" },
  ],
  Developers: [
    { label: "Documentation", href: siteConfig.docsUrl, external: true },
    { label: "Quick start", href: siteConfig.quickstartUrl, external: true },
    { label: "UI Kits", href: `${docsBase}/uikit/angular/`, external: true },
    { label: "SDKs", href: `${docsBase}/sdk/javascript/`, external: true },
    {
      label: "Angular sample",
      href: "https://github.com/Sendsar-Chat/sendsar-uikit-angular",
      external: true,
    },
    {
      label: "Flutter sample",
      href: "https://github.com/Sendsar-Chat/sendsar-uikit-flutter",
      external: true,
    },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Telegram", href: siteConfig.contactTelegram, external: true },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo size="md" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {siteConfig.tagline}. Your users, your login.
            </p>
            <p className="mt-3 text-sm text-neutral-500">
              <a href={siteConfig.contactMailto} className="hover:text-brand">
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

        <p className="mt-10 border-t border-border pt-6 text-xs text-neutral-500">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
