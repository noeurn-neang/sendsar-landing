import Link from "next/link";
import { Fragment } from "react";

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
import { siteConfig } from "@/lib/site";

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
      <svg
        className="h-4 w-4 text-emerald-500 mx-auto sm:mx-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
          clipRule="evenodd"
        />
      </svg>
    ) : (
      <span className="text-slate-300 dark:text-slate-600 font-medium">—</span>
    );
  }
  return <span className="font-medium text-slate-800 dark:text-slate-200">{value}</span>;
}

const planColumns = [
  { key: "free" as const, label: "Free", isHighlighted: false },
  { key: "plus" as const, label: "Plus", isHighlighted: true },
  { key: "pro" as const, label: "Pro", isHighlighted: false },
  { key: "enterprise" as const, label: "Enterprise", isHighlighted: false },
];

function ComparisonTable() {
  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm backdrop-blur md:block dark:border-slate-800/80 dark:bg-slate-900/50">
      <table className="w-full min-w-[880px] text-left text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-950/60">
            <th className="px-5 py-4 font-bold text-foreground w-2/5">Feature</th>
            {planColumns.map((column) => (
              <th
                key={column.key}
                className={`px-5 py-4 font-bold text-foreground text-center sm:text-left ${
                  column.isHighlighted
                    ? "bg-[#0096c8]/5 text-[#0096c8] dark:bg-[#0096c8]/10 dark:text-[#38bdf8]"
                    : ""
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pricingComparisonSections.map((section) => (
            <Fragment key={section.title}>
              <tr className="border-b border-slate-200/80 bg-slate-100/40 dark:border-slate-800 dark:bg-slate-800/30">
                <td
                  colSpan={planColumns.length + 1}
                  className="px-5 py-3 text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  {section.title}
                </td>
              </tr>
              {section.rows.map((row) => (
                <tr
                  key={row.feature}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 dark:border-slate-800/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                    {row.feature}
                  </td>
                  {planColumns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-5 py-3.5 ${
                        column.isHighlighted
                          ? "bg-[#0096c8]/[0.03] dark:bg-[#0096c8]/[0.05]"
                          : ""
                      }`}
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
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            {section.title}
          </h3>
          <div className="space-y-3.5">
            {section.rows.map((row) => (
              <div
                key={row.feature}
                className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/50"
              >
                <p className="font-semibold text-foreground text-sm">{row.feature}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  {planColumns.map((column) => (
                    <div
                      key={column.key}
                      className={`rounded-lg p-2 ${
                        column.isHighlighted
                          ? "bg-[#0096c8]/10 border border-[#0096c8]/20"
                          : "bg-slate-100/60 dark:bg-slate-800/60"
                      }`}
                    >
                      <dt className="text-slate-500 dark:text-slate-400 font-medium">
                        {column.label}
                      </dt>
                      <dd className="mt-1">
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
    <div
      style={{
        backgroundColor: "rgb(var(--bs-body-bg-rgb))",
      }}
    >
      <FaqJsonLd items={pricingFaqs} />

      {/* Hero Header Section */}
      <section
        className="relative overflow-hidden pt-32 sm:pt-36 lg:pt-40 pb-16 lg:pb-20"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(var(--bs-body-bg-rgb), .01), rgba(var(--bs-body-bg-rgb), 1) 85%), radial-gradient(ellipse at top left, rgba(var(--bs-primary-rgb), .35), transparent 50%), radial-gradient(ellipse at top right, rgba(var(--bd-accent-rgb), .35), transparent 50%), radial-gradient(ellipse at center right, rgba(var(--bd-violet-rgb), .35), transparent 50%), radial-gradient(ellipse at center left, rgba(var(--bd-pink-rgb), .35), transparent 50%)",
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0096c8]/20 bg-[#0096c8]/10 px-3.5 py-1 text-xs font-semibold text-[#0096c8] dark:text-[#38bdf8]">
            <span>Transparent Pricing</span>
          </div>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Simple and predictable
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            {pricingPageIntro}
          </p>
        </div>
      </section>

      {/* Pricing Cards with Monthly / Annual Toggle */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <PricingCards showBillingToggle />
        </div>
      </section>

      {/* Detailed Plan Comparison Table */}
      <section className="py-16 sm:py-20 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {pricingComparisonTitle}
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Every allowance, overage rate, and technical limit laid out side-by-side.
            </p>
          </div>

          <div className="mt-8">
            <ComparisonTable />
            <ComparisonCards />
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 sm:py-20 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {pricingFaqsTitle}
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Everything you need to know about active chatters, overages, and live calls.
            </p>
          </div>

          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {pricingFaqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 sm:p-7 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/50 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {faq.q}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-16 sm:py-20 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200/80 bg-white/80 p-8 sm:p-12 shadow-xl shadow-black/5 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/60">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to ship chat?
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm text-slate-600 dark:text-slate-400">
              Start free in minutes, or message our team on Telegram for help with architecture and migration.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/start"
                className="btn-bd-primary w-full sm:w-auto px-7 py-2.5 text-center text-xs font-semibold text-white shadow-lg shadow-[#0096c8]/20 hover:bg-[#007ba4]"
              >
                Start free
              </Link>

              <a
                href={siteConfig.contactTelegram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-300/80 bg-white/80 px-6 py-2.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-slate-400 hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <svg className="h-3.5 w-3.5 fill-current text-sky-500" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
                </svg>
                <span>Telegram Support</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
