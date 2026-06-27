"use client";

import type { BillingPeriod } from "@/lib/pricing";
import {
  billingPeriodOrder,
  billingPeriods,
  getBillingActiveNote,
  getBillingDiscountBadge,
  getBillingMonthlyHint,
  getBillingPromoHeadline,
} from "@/lib/pricing";

export function PricingBillingToggle({
  value,
  onChange,
}: {
  value: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
}) {
  const isMonthly = value === "monthly";

  return (
    <div className="relative z-20 flex flex-col items-center gap-4">
      <p
        className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
          isMonthly
            ? "border-border bg-surface-muted text-neutral-600 dark:text-neutral-400"
            : "border-brand/25 bg-brand-light text-brand-strong dark:border-brand/40 dark:bg-brand-light/30 dark:text-flash"
        }`}
      >
        {isMonthly ? getBillingMonthlyHint() : getBillingPromoHeadline()}
      </p>

      <div
        className="relative z-20 inline-flex max-w-full flex-wrap justify-center gap-1 rounded-full border border-border bg-surface p-1 shadow-sm"
        role="tablist"
        aria-label="Billing period"
      >
        {billingPeriodOrder.map((billingPeriod) => {
          const active = value === billingPeriod;
          const label = billingPeriods[billingPeriod].label;
          const discountBadge = getBillingDiscountBadge(billingPeriod);

          return (
            <button
              key={billingPeriod}
              type="button"
              role="tab"
              aria-selected={active}
              aria-pressed={active}
              onClick={() => onChange(billingPeriod)}
              className={`relative z-20 inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-brand text-white shadow-sm ring-1 ring-brand/30"
                  : "text-neutral-600 hover:bg-surface-muted hover:text-brand dark:text-neutral-400"
              }`}
            >
              <span>{label}</span>
              {discountBadge ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-flash/15 text-brand-strong dark:text-flash"
                  }`}
                >
                  {discountBadge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <p className="min-h-[2.75rem] max-w-md text-center text-sm leading-snug">
        {isMonthly ? (
          <span className="text-neutral-500">Prices below are billed every month.</span>
        ) : (
          <span className="font-medium text-brand-strong dark:text-flash">
            {getBillingActiveNote(value)}
          </span>
        )}
      </p>
    </div>
  );
}
