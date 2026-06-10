const useCases = [
  {
    title: "On-demand marketplaces",
    example: "Driver ↔ passenger",
    description:
      "Trip-scoped rooms tied to order IDs. Chat opens when a match happens — no separate messaging app.",
  },
  {
    title: "B2B SaaS platforms",
    example: "Account ↔ vendor",
    description:
      "Let customers talk to suppliers or support inside your dashboard, using the accounts you already manage.",
  },
  {
    title: "Service marketplaces",
    example: "Client ↔ provider",
    description:
      "Booking-based conversations with your auth layer intact. Add chat without adopting someone else's UI kit.",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="bg-surface-muted py-20">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-brand">
            Use cases
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Two-party workflows, native to your product
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {useCases.map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-border bg-surface p-6"
            >
              <p className="font-mono text-xs text-flash-strong">{item.example}</p>
              <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
