import { ContactCta } from "@/components/landing/ContactCta";
import { siteConfig } from "@/lib/site";

const flowSteps = [
  { label: "Your app", detail: "Existing users & auth" },
  { label: "Your server", detail: "Issues session JWT" },
  { label: "Sendsar", detail: "Rooms & delivery" },
  { label: "Your UI", detail: "Headless — you design it" },
];

export function Hero() {
  return (
    <section className="border-b border-hero-border bg-hero-gradient text-white">
      <div className="container mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-hero-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-flash" />
            Headless Chat · Voice · Video API
          </p>
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Add 1-on-1 chat, voice &amp; video to your app{" "}
            <span className="text-brand-gradient">in minutes</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-hero-muted sm:text-lg">
            Pay for people who chat — not your whole user base. Mapped to your
            existing user IDs and auth, no parallel user database. Built for
            marketplaces, delivery apps, and SaaS, with SDKs for JavaScript,
            React, Flutter, and more.
          </p>

          <div className="mt-8">
            <ContactCta
              variant="hero"
              showDocsLink
              showPricingLink
              primaryLabel="Start free — no credit card"
            />
          </div>
          <p className="mx-auto mt-4 max-w-lg text-sm text-hero-muted">
            {siteConfig.contactNote}
          </p>
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
const { token } = await fetch(\`\${API_URL}/v1/auth/token\`, {
  method: "POST",
  headers: { "x-api-key": process.env.SENDSAR_API_KEY },
  body: JSON.stringify({
    userId: user.id,
    displayName: user.name,
  }),
}).then((r) => r.json());

// Client connects with short-lived JWT
await client.connect(token);`}</code>
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
