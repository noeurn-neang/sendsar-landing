import { Fragment } from "react";

import { ContactCta } from "@/components/landing/ContactCta";
import { PricingCards } from "@/components/landing/PricingCards";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import {
  pricingComparisonSections,
  pricingComparisonTitle,
  pricingFaqs,
  pricingFaqsTitle,
  pricingPageIntro,
} from "@/lib/pricing";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Pricing",
  description:
    "Simple, transparent Sendsar pricing. Free, Plus, Pro, and Enterprise plans for consumer apps and teams — limits based on active chatters, not total registered users.",
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

const planColumns = [
  { key: "free" as const, label: "Free" },
  { key: "plus" as const, label: "Plus" },
  { key: "pro" as const, label: "Pro" },
  { key: "enterprise" as const, label: "Enterprise" },
];

function ComparisonTable() {
  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-border bg-surface md:block">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted">
            <th className="px-4 py-3 font-semibold">Feature</th>
            {planColumns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-semibold">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pricingComparisonSections.map((section) => (
            <Fragment key={section.title}>
              <tr className="border-b border-border bg-surface-muted/60">
                <td
                  colSpan={planColumns.length + 1}
                  className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500"
                >
                  {section.title}
                </td>
              </tr>
              {section.rows.map((row) => (
                <tr key={row.feature} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 font-medium">{row.feature}</td>
                  {planColumns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-neutral-600 dark:text-neutral-400"
                    >
                      <CellValue value={row[column.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComparisonCards() {
  return (
    <div className="space-y-8 md:hidden">
      {pricingComparisonSections.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            {section.title}
          </h3>
          <div className="mt-4 space-y-4">
            {section.rows.map((row) => (
              <div
                key={row.feature}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <p className="font-semibold">{row.feature}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {planColumns.map((column) => (
                    <div key={column.key}>
                      <dt className="text-neutral-500">{column.label}</dt>
                      <dd>
                        <CellValue value={row[column.key]} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="bg-background">
      <FaqJsonLd items={pricingFaqs} />

      <section className="border-b border-border bg-hero-gradient-subtle py-16">
        <div className="container mx-auto max-w-6xl px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-brand">
            Pricing
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent,{" "}
            <span className="text-brand-gradient">predictable</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
            {pricingPageIntro}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-6">
          <PricingCards showBillingToggle />
        </div>
      </section>

      <section className="border-t border-border bg-surface-muted py-16">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold tracking-tight">{pricingComparisonTitle}</h2>
          <div className="mt-8">
            <ComparisonTable />
            <ComparisonCards />
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="container mx-auto max-w-3xl px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight">
            {pricingFaqsTitle}
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

      <section className="border-t border-border bg-hero-gradient py-16 text-white">
        <div className="container mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Everything your platform needs to{" "}
            <span className="text-brand-gradient">talk</span>.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-hero-muted">
            Pick a plan above or message us on Telegram — we&apos;ll help you ship
            chat, calls, and production infrastructure.
          </p>
          <div className="mt-8 flex justify-center">
            <ContactCta variant="hero" showDocsLink showPricingLink={false} />
          </div>
        </div>
      </section>
    </div>
  );
}
