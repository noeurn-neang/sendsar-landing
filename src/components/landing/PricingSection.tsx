import Link from "next/link";

import { PricingCards } from "@/components/landing/PricingCards";

export function PricingSection() {
  return (
    <section id="pricing" className="border-b border-border bg-surface-muted py-20">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-brand">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent, predictable
          </h2>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Flat monthly tiers — know exactly what you&apos;ll pay as your platform
            grows. No per-MAU surprise bills.
          </p>
        </div>

        <div className="mt-12">
          <PricingCards compact />
        </div>

        <p className="mt-8 text-center text-sm text-neutral-500">
          Need a detailed comparison?{" "}
          <Link href="/pricing" className="font-semibold text-brand hover:text-brand-strong">
            View full pricing →
          </Link>
        </p>
      </div>
    </section>
  );
}
