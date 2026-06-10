import Link from "next/link";

import { PricingCards } from "@/components/landing/PricingCards";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import {
  pricingComparisonRows,
  pricingFaqs,
} from "@/lib/pricing";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Pricing",
  description:
    "Simple, transparent Flash Chat pricing. Flat monthly tiers for headless messaging — no per-MAU surprise bills.",
  path: "/pricing",
  keywords: [
    "chat API pricing",
    "headless chat pricing",
    "flat rate messaging API",
    "B2B chat pricing",
  ],
});

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="text-brand">✓</span>
    ) : (
      <span className="text-neutral-400">—</span>
    );
  }
  return <span>{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="bg-background">
      <FaqJsonLd items={pricingFaqs} />

      <section className="border-b border-border bg-surface-muted py-16">
        <div className="container mx-auto max-w-6xl px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-brand">
            Pricing
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent, predictable
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
            Know exactly what you&apos;ll pay — and why. Flat monthly tiers built
            for B2B platforms, not per-MAU sticker shock.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-6">
          <PricingCards />
        </div>
      </section>

      <section className="border-t border-border bg-surface-muted py-16">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold tracking-tight">Detailed plan comparison</h2>
          <div className="mt-8 hidden overflow-x-auto rounded-2xl border border-border bg-surface md:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted">
                  <th className="px-4 py-3 font-semibold">Feature</th>
                  <th className="px-4 py-3 font-semibold">Build</th>
                  <th className="px-4 py-3 font-semibold">Platform</th>
                  <th className="px-4 py-3 font-semibold">Scale</th>
                  <th className="px-4 py-3 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {pricingComparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-medium">{row.feature}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                      <CellValue value={row.build} />
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                      <CellValue value={row.platform} />
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                      <CellValue value={row.scale} />
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                      <CellValue value={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 space-y-4 md:hidden">
            {pricingComparisonRows.map((row) => (
              <div
                key={row.feature}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <p className="font-semibold">{row.feature}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-neutral-500">Build</dt>
                    <dd><CellValue value={row.build} /></dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Platform</dt>
                    <dd><CellValue value={row.platform} /></dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Scale</dt>
                    <dd><CellValue value={row.scale} /></dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Enterprise</dt>
                    <dd><CellValue value={row.enterprise} /></dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="container mx-auto max-w-3xl px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight">
            Got questions? We&apos;ve got answers.
          </h2>
          <dl className="mt-10 space-y-6">
            {pricingFaqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-border bg-surface p-6">
                <dt className="font-semibold">{faq.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-border bg-hero py-16 text-white">
        <div className="container mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Everything your platform needs to talk.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-hero-muted">
            Headless messaging infrastructure — handled — so you can just build.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={siteConfig.quickstartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              Get started for free
            </a>
            <Link
              href="/blog"
              className="rounded-lg border border-hero-border px-6 py-3 text-sm font-semibold text-stone-200 hover:border-brand/60"
            >
              Read comparisons
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
