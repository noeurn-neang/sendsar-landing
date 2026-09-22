"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { PricingBillingToggle } from "@/components/landing/PricingBillingToggle";
import {
  defaultBillingPeriod,
  getPricingTiers,
  type BillingPeriod,
  type PricingTier,
} from "@/lib/pricing";

/** Reserved badge row height so every card’s header block lines up. */
const BADGE_PLACEHOLDER = "Most popular";

function PriceDisplay({ tier, period }: { tier: PricingTier; period: BillingPeriod }) {
  const isAnnual = period === "annual";
  const hasDiscount = isAnnual && Boolean(tier.savingsBadge && tier.compareAt);
  const billingNote = isAnnual
    ? tier.billingSubtext
    : tier.priceSuffix
      ? "Billed monthly"
      : null;

  return (
    <div className="flex w-full flex-col items-center text-center">
      {isAnnual ? (
        <div className="flex h-7 w-full items-center justify-center">
          {tier.savingsBadge ? (
            <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-300">
              {tier.savingsBadge}
            </span>
          ) : (
            <span className="invisible inline-flex px-2.5 py-0.5 text-xs font-bold uppercase" aria-hidden>
              Save 20%
            </span>
          )}
        </div>
      ) : null}

      {isAnnual ? (
        <div className="flex h-6 w-full items-center justify-center gap-2">
          {hasDiscount ? (
            <span className="text-sm font-medium text-slate-400 line-through dark:text-slate-500">
              {tier.compareAt}
            </span>
          ) : (
            <span className="invisible text-sm font-medium" aria-hidden>
              $0/month
            </span>
          )}
        </div>
      ) : null}

      <div
        className={`flex w-full items-end justify-center gap-x-1.5 gap-y-0 ${
          isAnnual ? "h-12" : "h-14"
        }`}
      >
        <span className="text-4xl font-extrabold leading-none tracking-tight text-foreground">
          {tier.price}
        </span>
        {tier.priceSuffix ? (
          <span className="pb-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            {tier.priceSuffix}
          </span>
        ) : null}
      </div>

      <div className="flex min-h-[2.5rem] w-full items-start justify-center px-1 pt-1.5">
        {billingNote ? (
          <p
            className={`max-w-[16rem] text-xs leading-snug ${
              tier.billingSubtext
                ? "font-medium text-[#0096c8] dark:text-[#38bdf8]"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {billingNote}
          </p>
        ) : (
          <span className="invisible text-xs" aria-hidden>
            &nbsp;
          </span>
        )}
      </div>
    </div>
  );
}

function TierCta({
  tier,
  href,
  external,
}: {
  tier: PricingTier;
  href: string;
  external: boolean;
}) {
  const className = `block w-full rounded-xl py-2.5 text-center text-xs font-semibold transition ${
    tier.highlighted
      ? "btn-bd-primary text-white shadow-md shadow-[#0096c8]/20 hover:bg-[#007ba4]"
      : "border border-slate-300/80 bg-white/80 text-slate-700 hover:border-slate-400 hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
  }`;

  if (external) {
    return (
      <a
        href={href}
        target={href.startsWith("mailto") ? undefined : "_blank"}
        rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
        className={className}
      >
        {tier.cta}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {tier.cta}
    </Link>
  );
}

export function PricingCards({
  compact = false,
  showBillingToggle = false,
  defaultPeriod = defaultBillingPeriod,
}: {
  compact?: boolean;
  showBillingToggle?: boolean;
  defaultPeriod?: BillingPeriod;
}) {
  const [period, setPeriod] = useState<BillingPeriod>(defaultPeriod);
  const tiers = useMemo(() => getPricingTiers(period), [period]);

  return (
    <div>
      {showBillingToggle ? (
        <div className="relative z-20 mb-10 sm:mb-12">
          <PricingBillingToggle value={period} onChange={setPeriod} />
        </div>
      ) : null}

      <div
        className={`relative z-0 grid items-stretch gap-5 lg:gap-6 [grid-template-rows:repeat(6,auto)_minmax(0,1fr)] ${
          compact
            ? "sm:grid-cols-2 xl:grid-cols-4"
            : "sm:grid-cols-2 xl:grid-cols-4"
        }`}
      >
        {tiers.map((tier) => {
          const href = tier.ctaHref;
          const external = href.startsWith("http") || href.startsWith("mailto");

          return (
            <article
              key={`${tier.id}-${period}`}
              className={`relative grid row-span-7 grid-rows-subgrid rounded-2xl border p-6 sm:p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1 ${
                tier.highlighted
                  ? "border-[#0096c8]/50 bg-white/85 shadow-xl shadow-[#0096c8]/10 ring-1 ring-[#0096c8]/30 dark:border-[#0096c8]/40 dark:bg-slate-900/70"
                  : "border-slate-200/80 bg-white/70 shadow-sm hover:border-slate-400/50 hover:shadow-lg hover:shadow-black/5 dark:border-slate-800/80 dark:bg-slate-900/50 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex min-h-8 items-end justify-center">
                {tier.badge ? (
                  <span className="rounded-full bg-[#0096c8]/10 px-2.5 py-0.5 text-xs font-semibold text-[#0096c8] border border-[#0096c8]/20 dark:text-[#38bdf8]">
                    {tier.badge}
                  </span>
                ) : (
                  <span className="invisible text-xs font-semibold uppercase" aria-hidden>
                    {BADGE_PLACEHOLDER}
                  </span>
                )}
              </div>

              <div className="flex items-end justify-center mt-2">
                <h3 className="text-center text-xl font-bold tracking-tight text-foreground">
                  {tier.name}
                </h3>
              </div>

              <div className="flex items-start justify-center mt-3">
                <PriceDisplay tier={tier} period={period} />
              </div>

              <p className="text-center text-xs leading-relaxed text-slate-600 dark:text-slate-400 min-h-[2.5rem]">
                {tier.description}
              </p>

              <div className="mt-4">
                <TierCta tier={tier} href={href} external={external} />
              </div>

              <div className="border-t border-slate-200/70 dark:border-slate-800 my-4" role="presentation" />

              <ul className="space-y-2.5">
                {tier.features.map((feature) => (
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
                    <span className="break-words">{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}
