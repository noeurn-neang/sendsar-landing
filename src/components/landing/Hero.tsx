import { siteConfig } from "@/lib/site";

const flowSteps = [
  { label: "Your app", detail: "Existing users & auth" },
  { label: "Your server", detail: "Issues session JWT" },
  { label: "Flash Chat", detail: "Rooms & delivery" },
  { label: "Your UI", detail: "Headless — you design it" },
];

export function Hero() {
  return (
    <section className="border-b border-hero-border bg-hero text-white">
      <div className="container mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-hero-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-flash" />
            Headless Chat API
          </p>
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            In-app chat for platforms{" "}
            <span className="text-flash">that already exist</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-hero-muted sm:text-lg">
            {siteConfig.description} APIs and SDKs for your stack — your IDs,
            your login, our real-time engine.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={siteConfig.quickstartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
            >
              Get started for free
            </a>
            <a
              href={siteConfig.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-lg border border-hero-border px-6 py-3 text-sm font-semibold text-stone-200 transition hover:border-brand/60 hover:text-white"
            >
              See live demo
            </a>
          </div>
        </div>

        <div className="mx-auto mt-14 min-w-0 max-w-4xl space-y-4">
          <div className="overflow-hidden rounded-2xl border border-hero-border bg-hero-surface font-mono shadow-xl">
            <div className="flex items-center gap-2 border-b border-hero-border px-4 py-3 text-xs text-hero-muted">
              <span className="h-2 w-2 shrink-0 rounded-full bg-flash-strong/90" />
              <span className="h-2 w-2 shrink-0 rounded-full bg-brand/90" />
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500/80" />
              <span className="truncate">server.ts</span>
            </div>
            <div className="overflow-x-auto p-4 sm:p-6">
              <pre className="text-left text-xs leading-relaxed text-stone-300 sm:text-sm">
                <code className="block w-max max-w-none">{`// Your server — API key stays here
const session = await flashchat.sessions.create({
  tenantId: "acme",
  userId: user.id,      // your user ID
  displayName: user.name
});

// Client connects with short-lived JWT
client.connect(session.token);`}</code>
              </pre>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-4">
            {flowSteps.map((step, index) => (
              <div
                key={step.label}
                className="min-w-0 rounded-xl border border-hero-border bg-hero-surface/80 p-3 text-left"
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-hero-muted">
                  0{index + 1}
                </p>
                <p className="mt-1 text-sm font-semibold">{step.label}</p>
                <p className="mt-0.5 break-words text-xs text-hero-muted">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
