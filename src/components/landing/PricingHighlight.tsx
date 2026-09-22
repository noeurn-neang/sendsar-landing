import Link from "next/link";

import { siteConfig } from "@/lib/site";

const highlightPlans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For hackathons, prototypes, and MVPs.",
    features: [
      "Up to 200 monthly active chatters",
      "2,500 messages / mo (3-day history)",
      "30 min voice & 15 min video calls",
      "Angular & Flutter drop-in UI Kits",
    ],
    ctaLabel: "Start free",
    ctaHref: "/start",
    isExternal: false,
    highlighted: false,
  },
  {
    name: "Plus",
    badge: "Most popular",
    price: "$19",
    period: "/month",
    description: "For startups and growing products ready to ship.",
    features: [
      "Up to 2,500 monthly active chatters",
      "50,000 messages / mo (1-year history)",
      "240 min voice & 120 min video calls",
      "Call recording & custom webhook events",
    ],
    ctaLabel: "Start with Plus",
    ctaHref: siteConfig.contactTelegram,
    isExternal: true,
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For high-traffic platforms, marketplaces, and scale.",
    features: [
      "Up to 15,000 monthly active chatters",
      "500,000 messages / mo (3-year history)",
      "480 min voice & 240 min video calls",
      "Priority routing & Enterprise volume tiers",
    ],
    ctaLabel: "Start with Pro",
    ctaHref: siteConfig.contactTelegram,
    isExternal: true,
    highlighted: false,
  },
];

export function PricingHighlight() {
  return (
    <section
      id="pricing"
      className="scroll-mt-24 py-20 lg:py-28"
      style={{
        backgroundColor: "rgb(var(--bs-body-bg-rgb))",
      }}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-100/80 px-3.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
            <span>Transparent Pricing</span>
          </div>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Simple, predictable pricing
          </h2>

          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            Pay for active chatters — not your total registered users. Voice and video included in every plan.
          </p>
        </div>

        {/* 3 Highlight Cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 items-stretch">
          {highlightPlans.map((plan) => {
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col justify-between rounded-2xl border p-7 sm:p-8 backdrop-blur transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlighted
                    ? "border-[#0096c8]/50 bg-white/85 shadow-xl shadow-[#0096c8]/10 dark:border-[#0096c8]/40 dark:bg-slate-900/70"
                    : "border-slate-200/80 bg-white/70 shadow-sm hover:border-slate-400/50 hover:shadow-lg hover:shadow-black/5 dark:border-slate-800/80 dark:bg-slate-900/50 dark:hover:border-slate-700"
                }`}
              >
                {/* Header & Pricing */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-foreground">
                      {plan.name}
                    </h3>
                    {plan.badge ? (
                      <span className="rounded-full bg-[#0096c8]/10 px-2.5 py-0.5 text-xs font-semibold text-[#0096c8] dark:text-[#38bdf8] border border-[#0096c8]/20">
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 min-h-[2rem]">
                    {plan.description}
                  </p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {plan.period}
                    </span>
                  </div>

                  {/* Feature Bullets */}
                  <ul className="mt-6 space-y-3 border-t border-slate-200/70 pt-6 dark:border-slate-800">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300"
                      >
                        <svg
                          className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
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
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card CTA */}
                <div className="mt-8 pt-4">
                  {plan.isExternal ? (
                    <a
                      href={plan.ctaHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block w-full rounded-xl py-2.5 text-center text-xs font-semibold transition ${
                        plan.highlighted
                          ? "btn-bd-primary text-white shadow-md shadow-[#0096c8]/20 hover:bg-[#007ba4]"
                          : "border border-slate-300/80 bg-white/80 text-slate-700 hover:border-slate-400 hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
                      }`}
                    >
                      {plan.ctaLabel}
                    </a>
                  ) : (
                    <Link
                      href={plan.ctaHref}
                      className={`block w-full rounded-xl py-2.5 text-center text-xs font-semibold transition ${
                        plan.highlighted
                          ? "btn-bd-primary text-white shadow-md shadow-[#0096c8]/20 hover:bg-[#007ba4]"
                          : "border border-slate-300/80 bg-white/80 text-slate-700 hover:border-slate-400 hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
                      }`}
                    >
                      {plan.ctaLabel}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Full Comparison Link Bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/70 p-6 sm:p-7 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/50">
          <div className="text-center sm:text-left">
            <h4 className="text-base font-semibold text-foreground">
              Looking for all limits, overages, and technical specs?
            </h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Compare all 20+ features, retention policies, and enterprise options side-by-side.
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-slate-300/90 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-700"
          >
            <span>Full Pricing Comparison</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
