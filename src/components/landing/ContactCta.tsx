import { siteConfig } from "@/lib/site";

type ContactCtaProps = {
  /** hero = dark section; light = on white/muted; inline = compact row */
  variant?: "hero" | "light" | "inline";
  showDocsLink?: boolean;
  emailLabel?: string;
  telegramLabel?: string;
};

export function ContactCta({
  variant = "hero",
  showDocsLink = false,
  emailLabel = "Get early access",
  telegramLabel = "Telegram",
}: ContactCtaProps) {
  const isHero = variant === "hero";
  const isLight = variant === "light";

  const emailClass = isHero
    ? "inline-flex rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
    : isLight
      ? "rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
      : "inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong";

  const telegramClass = isHero
    ? "inline-flex rounded-lg border border-hero-border px-6 py-3 text-sm font-semibold text-stone-200 transition hover:border-brand/60 hover:text-white"
    : isLight
      ? "rounded-md border border-border px-5 py-2.5 text-sm font-semibold hover:border-brand/40 hover:text-brand"
      : "inline-flex rounded-lg border border-border px-4 py-2 text-sm font-semibold transition hover:border-brand/40 hover:text-brand";

  const docsClass = isHero
    ? "inline-flex rounded-lg px-2 py-3 text-sm font-medium text-hero-muted underline-offset-4 transition hover:text-white hover:underline"
    : "inline-flex text-sm font-medium text-neutral-600 underline-offset-4 transition hover:text-brand hover:underline dark:text-neutral-400";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <a href={siteConfig.earlyAccessMailto} className={emailClass}>
        {emailLabel}
      </a>
      <a
        href={siteConfig.contactTelegram}
        target="_blank"
        rel="noopener noreferrer"
        className={telegramClass}
      >
        {telegramLabel}
      </a>
      {showDocsLink ? (
        <a
          href={siteConfig.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={docsClass}
        >
          Read the docs
        </a>
      ) : null}
    </div>
  );
}
