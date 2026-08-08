import { siteConfig } from "@/lib/site";

const docsBase = siteConfig.docsUrl.replace(/\/$/, "");

const paths = [
  {
    label: "UI Kits",
    detail: "Drop-in chat UI",
    href: `${docsBase}/uikit/angular/`,
  },
  {
    label: "SDKs",
    detail: "Build your own UI",
    href: `${docsBase}/sdk/javascript/`,
  },
  {
    label: "Server",
    detail: "Session tokens",
    href: `${docsBase}/setup/authentication`,
  },
];

const samples = [
  {
    label: "Angular sample",
    href: "https://github.com/Sendsar-Chat/sendsar-uikit-angular",
  },
  {
    label: "Flutter sample",
    href: "https://github.com/Sendsar-Chat/sendsar-uikit-flutter",
  },
];

export function IntegratePaths() {
  return (
    <section id="paths" className="border-b border-border py-14">
      <div className="container mx-auto max-w-6xl px-6">
        <p className="text-center text-sm font-medium text-neutral-500">
          Start where you need
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {paths.map((path) => (
            <a
              key={path.label}
              href={path.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border bg-surface px-5 py-4 transition hover:border-brand/40 hover:bg-brand-light/40"
            >
              <p className="text-sm font-semibold text-foreground">{path.label}</p>
              <p className="mt-0.5 text-sm text-neutral-500">{path.detail}</p>
            </a>
          ))}
        </div>
        <p className="mt-5 text-center text-sm text-neutral-500">
          Samples:{" "}
          {samples.map((sample, index) => (
            <span key={sample.label}>
              {index > 0 ? " · " : null}
              <a
                href={sample.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand hover:text-brand-strong"
              >
                {sample.label}
              </a>
            </span>
          ))}
          {" · "}
          <a
            href={siteConfig.quickstartUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand hover:text-brand-strong"
          >
            Quick start
          </a>
        </p>
      </div>
    </section>
  );
}
