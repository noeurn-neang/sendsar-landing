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
        className={`rounded-full border px-4 py-1.5 text-xs sm:text-sm font-semibold transition ${
          isMonthly
            ? "border-slate-200/80 bg-slate-100/80 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400"
            : "border-[#0096c8]/25 bg-[#0096c8]/10 text-[#0096c8] dark:border-[#0096c8]/30 dark:text-[#38bdf8]"
        }`}
      >
        {isMonthly ? getBillingMonthlyHint() : getBillingPromoHeadline()}
      </p>

      <div
        className="relative z-20 inline-flex max-w-full flex-wrap justify-center gap-1 rounded-full border border-slate-200/80 bg-slate-100/80 p-1 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
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
              className={`relative z-20 inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                active
                  ? "bg-[#0096c8] text-white shadow-md shadow-[#0096c8]/25"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <span>{label}</span>
              {discountBadge ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  {discountBadge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <p className="min-h-[2rem] max-w-md text-center text-xs sm:text-sm leading-snug">
        {isMonthly ? (
          <span className="text-slate-500 dark:text-slate-400">Prices below are billed monthly.</span>
        ) : (
          <span className="font-medium text-[#0096c8] dark:text-[#38bdf8]">
            {getBillingActiveNote(value)}
          </span>
        )}
      </p>
    </div>
  );
}
