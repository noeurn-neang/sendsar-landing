import Link from "next/link";

import { ContactCta } from "@/components/landing/ContactCta";

export function PriceClose() {
  return (
    <section id="pricing" className="border-b border-border py-16">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Free to start
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Pay for people who chat — not your whole user base.{" "}
            <Link
              href="/pricing"
              className="font-semibold text-brand hover:text-brand-strong"
            >
              See pricing
            </Link>
          </p>
          <div className="mt-8">
            <ContactCta
              variant="light"
              showDocsLink
              primaryLabel="Start free"
              primaryHref="/start"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
