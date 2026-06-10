import { siteConfig } from "@/lib/site";

const stacks = ["JavaScript", "React", "Flutter", "REST", "WebSocket", "Node.js"];

export function DevExperience() {
  return (
    <section className="bg-hero py-20 text-white">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-widest text-hero-muted">
              Developer experience
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Built for backend teams first
            </h2>
            <p className="mt-4 leading-relaxed text-hero-muted">
              Start with the API, add SDKs where they help. Docs, webhooks, and
              session flows are designed around how platform engineers actually
              integrate — not how a UI kit demo looks on day one.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {stacks.map((stack) => (
                <span
                  key={stack}
                  className="rounded border border-hero-border bg-hero-surface px-3 py-1 font-mono text-xs text-stone-300"
                >
                  {stack}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={siteConfig.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
              >
                Open documentation
              </a>
              <a
                href={siteConfig.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-hero-border px-4 py-2 text-sm font-semibold text-stone-200 hover:border-brand/60"
              >
                View on GitHub
              </a>
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-lg border border-hero-border bg-hero-surface font-mono">
            <p className="border-b border-hero-border px-4 py-3 text-xs text-hero-muted">
              webhook payload
            </p>
            <div className="overflow-x-auto p-4 sm:p-5">
              <pre className="text-xs leading-relaxed text-stone-300 sm:text-sm">
                <code className="block w-max max-w-none">{`{
  "type": "message.created",
  "tenantId": "acme",
  "roomId": "order_8f2a",
  "senderId": "user_42",   // your ID
  "body": "Driver is 2 min away"
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
