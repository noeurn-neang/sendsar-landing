const stats = [
  { value: "7ms", label: "Typical API response" },
  { value: "Headless", label: "Your UI, our engine" },
  { value: "2-party", label: "Native room model" },
  { value: "Flat", label: "Monthly pricing" },
];

export function TrustedStats() {
  return (
    <section className="border-b border-border bg-surface py-10">
      <div className="container mx-auto max-w-6xl px-6">
        <p className="text-center font-mono text-xs uppercase tracking-widest text-neutral-500">
          Built for platform teams
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="font-brand text-2xl font-extrabold tracking-tight text-brand sm:text-3xl">
                {stat.value}
              </dt>
              <dd className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
