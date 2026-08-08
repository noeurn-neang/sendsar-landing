const steps = [
  {
    title: "Mint a session",
    description: "Your server issues a short-lived JWT with sk_*.",
  },
  {
    title: "Connect the client",
    description: "UI Kit or SDK — never ship the secret key.",
  },
  {
    title: "Ship chat",
    description: "Rooms, messages, optional voice & video.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border bg-surface-muted py-14">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Three steps. Your users, your login.
          </p>
        </div>

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="text-center md:text-left">
              <span className="font-mono text-xs font-semibold text-brand">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-base font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
