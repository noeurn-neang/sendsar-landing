import Link from "next/link";

import { siteConfig } from "@/lib/site";

export function LegalPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="border-b border-border bg-surface">
      <div className="container mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-neutral-500">
          Legal
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          Last updated {siteConfig.legal.lastUpdated} · Operated by{" "}
          {siteConfig.legal.operatorName}
        </p>

        <div className="prose-legal mt-12 space-y-10 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
          {children}
        </div>

        <p className="mt-14 border-t border-border pt-8 text-sm text-neutral-500">
          Questions?{" "}
          <a href={siteConfig.contactMailto} className="font-medium text-brand hover:text-brand-strong">
            {siteConfig.contactEmail}
          </a>
          {" · "}
          <Link href="/privacy" className="font-medium text-brand hover:text-brand-strong">
            Privacy
          </Link>
          {" · "}
          <Link href="/terms" className="font-medium text-brand hover:text-brand-strong">
            Terms
          </Link>
        </p>
      </div>
    </main>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
