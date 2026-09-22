import { FrameworkBadges } from "@/components/landing/FrameworkBadges";
import { siteConfig } from "@/lib/site";

const docsBase = siteConfig.docsUrl.replace(/\/$/, "");

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 py-20 lg:py-28"
      style={{
        backgroundColor: "rgb(var(--bs-body-bg-rgb))",
      }}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-100/80 px-3.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
            <span>Architecture & Integration</span>
          </div>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            How Sendsar Works
          </h2>

          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            Ship real-time chat in 3 simple steps. From backend authentication to a complete client UI.
          </p>
        </div>

        {/* 3 Step Connected Cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {/* Card 1: Server */}
          <div className="group relative overflow-hidden flex flex-col justify-between items-center text-center rounded-2xl border border-slate-200/80 bg-white/70 p-7 sm:p-8 shadow-sm backdrop-blur transition-all duration-300 hover:border-slate-400/50 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 dark:border-slate-800/80 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:shadow-black/20">
            {/* Background Icon Shadow Texture */}
            <div className="pointer-events-none absolute -right-6 -bottom-6 text-slate-400/[0.07] dark:text-white/[0.04] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3" aria-hidden="true">
              <svg className="h-44 w-44" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 12h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zm2-9a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm12 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM6 17a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm12 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center w-full">
              {/* Tag Pill */}
              <span className="mb-3 rounded-full border border-slate-200/80 bg-slate-100/80 px-3 py-1 font-mono text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                Your Server
              </span>

              {/* Centered Headline */}
              <h3 className="text-xl font-bold tracking-tight text-foreground text-center sm:text-2xl">
                Mint Session Token
              </h3>

              {/* Centered Description */}
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400 text-center max-w-xs">
                Your backend creates a short-lived JWT using your private secret key. Secret keys never touch client code.
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 w-full flex justify-center">
              <a
                href={`${docsBase}/setup/authentication`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-foreground dark:text-slate-300 dark:hover:text-white transition"
              >
                <span>Server Auth Docs</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Card 2: Client */}
          <div className="group relative overflow-hidden flex flex-col justify-between items-center text-center rounded-2xl border border-slate-200/80 bg-white/70 p-7 sm:p-8 shadow-sm backdrop-blur transition-all duration-300 hover:border-slate-400/50 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 dark:border-slate-800/80 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:shadow-black/20">
            {/* Background Icon Shadow Texture */}
            <div className="pointer-events-none absolute -right-6 -bottom-6 text-slate-400/[0.07] dark:text-white/[0.04] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" aria-hidden="true">
              <svg className="h-44 w-44" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center w-full">
              {/* Tag Pill */}
              <span className="mb-3 rounded-full border border-slate-200/80 bg-slate-100/80 px-3 py-1 font-mono text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                Your Client
              </span>

              {/* Centered Headline */}
              <h3 className="text-xl font-bold tracking-tight text-foreground text-center sm:text-2xl">
                UI Kit or Custom SDK
              </h3>

              {/* Centered Description */}
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400 text-center max-w-xs">
                Pick your speed: Drop in pre-built UI Kits for fast delivery, or use headless SDKs for custom design.
              </p>
            </div>

            <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80 w-full">
              <a
                href={`${docsBase}/uikit/angular/`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-slate-200/60 bg-slate-100/80 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 transition"
              >
                Angular UIKit
              </a>
              <a
                href="https://github.com/Sendsar-Chat/sendsar-uikit-flutter"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-slate-200/60 bg-slate-100/80 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 transition"
              >
                Flutter UIKit
              </a>
              <a
                href={`${docsBase}/sdk/javascript/`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-slate-200/60 bg-slate-100/80 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 transition"
              >
                JavaScript SDK
              </a>
            </div>
          </div>

          {/* Card 3: Ship Chat */}
          <div className="group relative overflow-hidden flex flex-col justify-between items-center text-center rounded-2xl border border-slate-200/80 bg-white/70 p-7 sm:p-8 shadow-sm backdrop-blur transition-all duration-300 hover:border-slate-400/50 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 dark:border-slate-800/80 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:shadow-black/20">
            {/* Background Icon Shadow Texture */}
            <div className="pointer-events-none absolute -right-6 -bottom-6 text-slate-400/[0.07] dark:text-white/[0.04] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3" aria-hidden="true">
              <svg className="h-44 w-44" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center w-full">
              {/* Tag Pill */}
              <span className="mb-3 rounded-full border border-slate-200/80 bg-slate-100/80 px-3 py-1 font-mono text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                Live Chat
              </span>

              {/* Centered Headline */}
              <h3 className="text-xl font-bold tracking-tight text-foreground text-center sm:text-2xl">
                Ship Real-time
              </h3>

              {/* Centered Description */}
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400 text-center max-w-xs">
                1-on-1 and group rooms, read receipts, offline push, media attachments, and WebRTC voice & video calls.
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 w-full flex justify-center">
              <a
                href={siteConfig.quickstartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-foreground dark:text-slate-300 dark:hover:text-white transition"
              >
                <span>Quickstart Guide</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Reusable SDK & Framework Badges: JavaScript, Flutter, Angular */}
        <div className="mt-14 flex justify-center">
          <FrameworkBadges align="center" />
        </div>
      </div>
    </section>
  );
}
