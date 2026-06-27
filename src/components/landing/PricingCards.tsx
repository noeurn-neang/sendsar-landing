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
            <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-300">
              {tier.savingsBadge}
            </span>
          ) : (
            <span className="invisible inline-flex px-2.5 py-1 text-xs font-bold uppercase" aria-hidden>
              Save 20%
            </span>
          )}
        </div>
      ) : null}

      {isAnnual ? (
        <div className="flex h-6 w-full items-center justify-center gap-2">
          {hasDiscount ? (
            <span className="text-base font-medium text-neutral-400 line-through dark:text-neutral-500">
              {tier.compareAt}
            </span>
          ) : (
            <span className="invisible text-base font-medium" aria-hidden>
              $0/month
            </span>
          )}
        </div>
      ) : null}

      <div
        className={`flex w-full items-end justify-center gap-x-1.5 gap-y-0 ${
          isAnnual ? "h-12" : "h-16"
        }`}
      >
        <span className="font-brand text-4xl font-extrabold leading-none tracking-tight text-foreground">
          {tier.price}
        </span>
        {tier.priceSuffix ? (
          <span className="pb-0.5 text-sm font-medium text-neutral-500">{tier.priceSuffix}</span>
        ) : null}
      </div>

      <div className="flex min-h-[2.75rem] w-full items-start justify-center px-1 pt-1">
        {billingNote ? (
          <p
            className={`max-w-[16rem] text-sm leading-snug ${
              tier.billingSubtext
                ? "font-medium text-brand dark:text-flash"
                : "text-neutral-500"
            }`}
          >
            {billingNote}
          </p>
        ) : (
          <span className="invisible text-sm" aria-hidden>
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
  const className = `block w-full rounded-full px-4 py-2.5 text-center text-sm font-semibold transition ${
    tier.highlighted
      ? "bg-brand text-white hover:bg-brand-strong"
      : "border border-border bg-surface hover:border-brand/40 hover:text-brand"
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
        <div className="relative z-20 mb-8 sm:mb-10">
          <PricingBillingToggle value={period} onChange={setPeriod} />
        </div>
      ) : null}

      <div
        className={`relative z-0 grid items-stretch gap-4 sm:gap-5 lg:gap-6 [grid-template-rows:repeat(6,auto)_minmax(0,1fr)] ${
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
              className={`relative grid row-span-7 grid-rows-subgrid rounded-2xl border ${
                tier.highlighted
                  ? "border-brand bg-surface shadow-md ring-1 ring-brand/20"
                  : "border-border bg-surface"
              }`}
            >
              <div className="flex min-h-8 items-end justify-center px-5 pt-5 sm:px-6 sm:pt-6">
                {tier.badge ? (
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand">
                    {tier.badge}
                  </span>
                ) : (
                  <span className="invisible text-xs font-semibold uppercase" aria-hidden>
                    {BADGE_PLACEHOLDER}
                  </span>
                )}
              </div>

              <div className="flex items-end justify-center px-5 sm:px-6">
                <h3 className="text-center text-xl font-semibold tracking-tight">{tier.name}</h3>
              </div>

              <div className="flex items-start justify-center px-5 sm:px-6">
                <PriceDisplay tier={tier} period={period} />
              </div>

              <p className="px-5 text-center text-sm leading-snug text-neutral-600 sm:px-6 dark:text-neutral-400">
                {tier.description}
              </p>

              <div className="px-5 sm:px-6">
                <TierCta tier={tier} href={href} external={external} />
              </div>

              <div className="mx-5 border-t border-border sm:mx-6" role="presentation" />

              <ul className="space-y-2.5 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-2.5 text-sm leading-snug text-neutral-700 dark:text-neutral-300"
                  >
                    <span className="pt-0.5 text-center text-brand" aria-hidden>
                      ✓
                    </span>
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
