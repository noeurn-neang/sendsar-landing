import Link from "next/link";

import { siteConfig } from "@/lib/site";

type ContactCtaProps = {
  /** light = marketing default; hero kept for any remaining dark bands */
  variant?: "hero" | "light" | "inline";
  showDocsLink?: boolean;
  showPricingLink?: boolean;
  primaryLabel?: string;
  primaryHref?: string;
};

export function ContactCta({
  variant = "light",
  showDocsLink = false,
  showPricingLink = false,
  primaryLabel,
  primaryHref = "/start",
}: ContactCtaProps) {
  const isHero = variant === "hero";

  const primaryClass = isHero
    ? "inline-flex rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
    : "inline-flex rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong";

  const secondaryClass = isHero
    ? "inline-flex rounded-lg border border-hero-border px-6 py-3 text-sm font-semibold text-stone-200 transition hover:border-brand/60 hover:text-white"
    : "inline-flex rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-brand/40 hover:text-brand";

  const docsClass = isHero
    ? "inline-flex rounded-lg px-2 py-3 text-sm font-medium text-hero-muted underline-offset-4 transition hover:text-white hover:underline"
    : "inline-flex rounded-lg px-2 py-2.5 text-sm font-semibold text-neutral-600 underline-offset-4 transition hover:text-brand hover:underline dark:text-neutral-400";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {primaryHref.startsWith("http") || primaryHref.startsWith("mailto") ? (
        <a
          href={primaryHref}
          target="_blank"
          rel="noopener noreferrer"
          className={primaryClass}
        >
          {primaryLabel ?? "Talk on Telegram"}
        </a>
      ) : (
        <Link href={primaryHref} className={primaryClass}>
          {primaryLabel ?? "Start free"}
        </Link>
      )}
      {showPricingLink ? (
        <Link href="/pricing" className={secondaryClass}>
          Pricing
        </Link>
      ) : null}
      {showDocsLink ? (
        <a
          href={siteConfig.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={docsClass}
        >
          Docs
        </a>
      ) : null}
    </div>
  );
}
