import Link from "next/link";

import { pricingTiers } from "@/lib/pricing";

export function PricingCards({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`grid gap-6 ${
        compact
          ? "md:grid-cols-2 xl:grid-cols-4"
          : "lg:grid-cols-2 xl:grid-cols-4"
      }`}
    >
      {pricingTiers.map((tier) => {
        const href = tier.ctaHref;
        const external = href.startsWith("http") || href.startsWith("mailto");

        return (
          <article
            key={tier.id}
            className={`relative flex flex-col rounded-2xl border p-6 ${
              tier.highlighted
                ? "border-brand bg-surface shadow-md ring-1 ring-brand/20"
                : "border-border bg-surface"
            }`}
          >
            {tier.highlighted ? (
              <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-0.5 text-xs font-semibold text-white">
                Most popular
              </span>
            ) : null}

            <h3 className="text-lg font-semibold">{tier.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-brand text-4xl font-extrabold tracking-tight">
                {tier.price}
              </span>
              {tier.price !== "Custom" ? (
                <span className="text-sm text-neutral-500">/mo</span>
              ) : null}
            </div>
            {tier.priceNote ? (
              <p className="mt-1 text-xs text-neutral-500">{tier.priceNote}</p>
            ) : null}
            <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {tier.description}
            </p>

            <ul className="mt-5 space-y-2 border-t border-border pt-5">
              {tier.features.map((feature) => (
                <li
                  key={feature}
                  className="flex gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                >
                  <span className="mt-0.5 text-brand" aria-hidden>
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            {external ? (
              <a
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                className={`mt-6 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition ${
                  tier.highlighted
                    ? "bg-brand text-white hover:bg-brand-strong"
                    : "border border-border hover:border-brand/40 hover:text-brand"
                }`}
              >
                {tier.cta}
              </a>
            ) : (
              <Link
                href={href}
                className={`mt-6 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition ${
                  tier.highlighted
                    ? "bg-brand text-white hover:bg-brand-strong"
                    : "border border-border hover:border-brand/40 hover:text-brand"
                }`}
              >
                {tier.cta}
              </Link>
            )}
          </article>
        );
      })}
    </div>
  );
}
