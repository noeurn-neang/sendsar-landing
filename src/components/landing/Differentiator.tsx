const contrasts = [
  {
    them: "Adopt our UI kit and user model",
    us: "Keep your UI and map our rooms to your user IDs",
  },
  {
    them: "Rebuild auth around our SDK",
    us: "Mint session JWTs from the server you already run",
  },
  {
    them: "Ship a full communication suite on day one",
    us: "Start with two-party messaging, add calls when needed",
  },
];

export function Differentiator() {
  return (
    <section className="py-20">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-brand">
            Why Sendsar
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Headless means you stay in control
          </h2>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            If adding chat feels like bolting on someone else&apos;s product, you
            probably need infrastructure — not another app inside your app.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-2 border-b border-border bg-surface-muted text-sm font-semibold">
            <p className="border-r border-border px-6 py-4 text-neutral-500">
              Typical chat SDK
            </p>
            <p className="px-6 py-4 text-brand">Sendsar</p>
          </div>
          {contrasts.map((row) => (
            <div
              key={row.them}
              className="grid grid-cols-2 border-b border-border last:border-b-0"
            >
              <p className="border-r border-border bg-surface px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                {row.them}
              </p>
              <p className="bg-surface px-6 py-4 text-sm font-medium">{row.us}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
