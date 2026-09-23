import Link from "next/link";

import { Logo } from "@/components/landing/Logo";
import { siteConfig } from "@/lib/site";

const docsBase = siteConfig.docsUrl.replace(/\/$/, "");

const footerLinks = {
  Product: [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Start Free", href: "/start" },
  ],
  Developers: [
    { label: "Documentation", href: siteConfig.docsUrl, external: true },
    { label: "Quickstart Guide", href: siteConfig.quickstartUrl, external: true },
    { label: "Angular UIKit", href: `${docsBase}/uikit/angular/`, external: true },
    {
      label: "Flutter UIKit",
      href: "https://github.com/Sendsar-Chat/sendsar-uikit-flutter",
      external: true,
    },
    { label: "JavaScript SDK", href: `${docsBase}/sdk/javascript/`, external: true },
  ],
  Resources: [
    { label: "Blog & Updates", href: "/blog" },
    { label: "Telegram Community", href: siteConfig.contactTelegram, external: true },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function SiteFooter() {
  return (
    <footer
      className="border-t border-slate-200/80 transition-colors dark:border-slate-800/80"
      style={{
        backgroundColor: "rgb(var(--bs-body-bg-rgb))",
      }}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-12 sm:pt-20 sm:pb-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col items-start text-left">
            <Logo size="md" />

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {siteConfig.description}
            </p>

            {/* Telegram Support Pill */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={siteConfig.contactTelegram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-sky-600 transition hover:bg-sky-500/20 dark:text-sky-400"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
                </svg>
                <span>Telegram Support</span>
              </a>

              <a
                href={siteConfig.contactMailto}
                className="text-xs text-slate-500 hover:text-foreground dark:text-slate-400 transition"
              >
                {siteConfig.contactEmail}
              </a>
            </div>
          </div>

          {/* Navigation Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="flex flex-col">
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                {title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-slate-600 transition-colors hover:text-[#0096c8] dark:text-slate-400 dark:hover:text-[#38bdf8]"
                      >
                        <span>{link.label}</span>
                        <span className="text-[10px] text-slate-400">↗</span>
                      </a>
                    ) : link.href.includes("#") ? (
                      <a
                        href={link.href}
                        className="text-sm text-slate-600 transition-colors hover:text-[#0096c8] dark:text-slate-400 dark:hover:text-[#38bdf8]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-slate-600 transition-colors hover:text-[#0096c8] dark:text-slate-400 dark:hover:text-[#38bdf8]"
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

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 pt-8 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p>Built for developers shipping real-time chat, voice, and video.</p>
        </div>
      </div>
    </footer>
  );
}
