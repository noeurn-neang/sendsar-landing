import { ContactCta } from "@/components/landing/ContactCta";
import { siteConfig } from "@/lib/site";

export function ClosingCta() {
  return (
    <section id="contact" className="border-t border-border bg-hero-gradient-subtle py-16">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-lg border border-border bg-surface p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to add chat{" "}
              <span className="text-brand-gradient">without the rebuild?</span>
            </h2>
            <p className="mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
              Pick a plan above or message us on Telegram — we&apos;ll help with
              docs, sandbox access, and production setup.
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              <a href={siteConfig.contactMailto} className="hover:text-brand">
                {siteConfig.contactEmail}
              </a>
            </p>
          </div>
          <div className="shrink-0">
            <ContactCta variant="light" showPricingLink />
          </div>
        </div>
      </div>
    </section>
  );
}
