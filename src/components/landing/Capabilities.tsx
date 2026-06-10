const capabilities = [
  ["Rooms & messages", "Create scoped conversations mapped to your business objects."],
  ["Real-time delivery", "WebSocket transport with REST fallbacks for server workflows."],
  ["Presence & typing", "Online status and typing signals without extra infrastructure."],
  ["Session JWTs", "Short-lived client tokens minted by your backend — keys never exposed."],
  ["Multi-tenant", "Isolate customers, brands, or environments on one backend."],
  ["Webhooks", "React to message events in your own services and automations."],
  ["Reactions & receipts", "Modern chat primitives without bolting on a full UI framework."],
  ["Voice & video", "Optional calls via LiveKit when your workflow needs more than text."],
];

export function Capabilities() {
  return (
    <section id="features" className="border-b border-border py-20">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-brand">
              Platform features
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Powerful by default
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Infrastructure for delivery and state — not a design system you have to
              adopt wholesale.
            </p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            {capabilities.map(([title, description]) => (
              <div
                key={title}
                className="rounded-md border border-border bg-surface p-4"
              >
                <dt className="text-sm font-semibold">{title}</dt>
                <dd className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
