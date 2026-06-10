import { siteConfig } from "@/lib/site";

export function ClosingCta() {
  return (
    <section className="border-t border-border bg-surface-muted py-16">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-lg border border-border bg-surface p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to add chat without the rebuild?
            </h2>
            <p className="mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
              Start with the quickstart, explore the demo shop, or read the API
              reference — all headless, all yours.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <a
              href={siteConfig.quickstartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              Start building
            </a>
            <a
              href={siteConfig.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold hover:border-brand/40 hover:text-brand"
            >
              Open demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
