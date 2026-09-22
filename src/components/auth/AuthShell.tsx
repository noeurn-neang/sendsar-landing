import Link from "next/link";

import { Logo } from "@/components/landing/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { siteConfig } from "@/lib/site";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground transition-colors duration-200">
      {/* Background Gradient matching Hero and Pricing */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bd-masthead"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(var(--bs-body-bg-rgb), .01), rgba(var(--bs-body-bg-rgb), 1) 85%), radial-gradient(ellipse at top left, rgba(var(--bs-primary-rgb), .5), transparent 50%), radial-gradient(ellipse at top right, rgba(var(--bd-accent-rgb), .5), transparent 50%), radial-gradient(ellipse at center right, rgba(var(--bd-violet-rgb), .5), transparent 50%), radial-gradient(ellipse at center left, rgba(var(--bd-pink-rgb), .5), transparent 50%)",
        }}
      />

      <a
        href="#auth-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-slate-900 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-[#0096c8] dark:text-slate-400 dark:hover:text-[#38bdf8]"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
            <span>Back to home</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main
        id="auth-main"
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12"
      >
        <div className="w-full max-w-[420px] rounded-3xl border border-slate-200/80 bg-white/80 p-8 sm:p-10 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80">
          <div className="flex justify-center">
            <Logo size="md" href="/" variant="default" />
          </div>
          <div className="mt-8 w-full">{children}</div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="relative z-10 px-6 pb-8 pt-2">
        <div className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-3 text-center">
          <nav
            aria-label="Legal and support"
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400"
          >
            <Link
              href="/terms"
              className="transition hover:text-[#0096c8] dark:hover:text-[#38bdf8]"
            >
              Terms
            </Link>
            <span aria-hidden className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <Link
              href="/privacy"
              className="transition hover:text-[#0096c8] dark:hover:text-[#38bdf8]"
            >
              Privacy
            </Link>
            <span aria-hidden className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <Link
              href={siteConfig.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-[#0096c8] dark:hover:text-[#38bdf8]"
            >
              Docs
            </Link>
            <span aria-hidden className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <a
              href={siteConfig.contactMailto}
              className="transition hover:text-[#0096c8] dark:hover:text-[#38bdf8]"
            >
              Support
            </a>
          </nav>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </footer>
    </div>
  );
}
