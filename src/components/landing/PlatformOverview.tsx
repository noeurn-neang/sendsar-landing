const products = [
  {
    title: "Headless messaging API",
    badge: "Core",
    description:
      "Rooms, messages, delivery, and presence — mapped to your user IDs and business objects. No parallel user directory.",
    highlights: [
      "1:1 rooms · group optional",
      "Typing & read receipts",
      "Reactions & media",
      "REST + WebSocket",
    ],
  },
  {
    title: "Real-time infrastructure",
    badge: "Platform",
    description:
      "Multi-tenant gateway with session JWTs, webhooks, and optional voice/video when your workflow needs more than text.",
    highlights: [
      "Session JWT from your server",
      "Webhooks for automations",
      "Multi-tenant isolation",
      "Optional LiveKit calls",
    ],
  },
];

export function PlatformOverview() {
  return (
    <section id="platform" className="border-b border-border py-20">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-brand">
            Core products
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            The headless stack for every conversation
          </h2>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Modular building blocks — start with two-party messaging, add calls
            when you need them. Your auth, your UI, our delivery engine.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {products.map((product) => (
            <article
              key={product.title}
              className="rounded-2xl border border-border bg-surface p-8"
            >
              <span className="inline-flex rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-strong">
                {product.badge}
              </span>
              <h3 className="mt-4 text-xl font-semibold">{product.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {product.description}
              </p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {product.highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-flash" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
