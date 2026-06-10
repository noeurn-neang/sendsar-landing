const steps = [
  {
    title: "Keep your user system",
    description:
      "Flash Chat maps to your existing user IDs. No parallel user directory, no auth migration, no SSO rebuild.",
  },
  {
    title: "Issue sessions from your server",
    description:
      "Your backend holds the API key and mints short-lived JWTs. Clients never see secrets — same pattern you already trust.",
  },
  {
    title: "Ship your own UI",
    description:
      "We deliver rooms, messages, and real-time events. You render the chat experience inside your product's design system.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border py-20">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-brand">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps. No platform swap.
          </h2>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Most chat SDKs expect a greenfield build. Flash Chat is built for the
            opposite — platforms that already ship.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="bg-surface p-8">
              <span className="font-mono text-sm font-semibold text-flash-strong">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
