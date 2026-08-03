import Link from "next/link";

import { Logo } from "@/components/landing/Logo";
import { siteConfig } from "@/lib/site";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#171717] text-[#ededed]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(0,150,200,0.12), transparent 42%), radial-gradient(circle at 100% 100%, rgba(0,232,230,0.06), transparent 35%)",
        }}
      />

      <a
        href="#auth-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[#262626] focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to main content
      </a>

      <main
        id="auth-main"
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12"
      >
        <div className="flex w-full max-w-[384px] flex-col items-center text-center">
          <Logo size="md" href="/" variant="inverse" />
          <div className="mt-10 w-full text-left">{children}</div>
        </div>
      </main>

      <footer className="relative z-10 px-6 pb-8 pt-2">
        <div className="mx-auto flex w-full max-w-[384px] flex-col items-center gap-3 text-center">
          <nav
            aria-label="Legal and support"
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-[#8a8a8a]"
          >
            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <span aria-hidden className="text-[#404040]">
              ·
            </span>
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <span aria-hidden className="text-[#404040]">
              ·
            </span>
            <Link
              href={siteConfig.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white"
            >
              Docs
            </Link>
            <span aria-hidden className="text-[#404040]">
              ·
            </span>
            <a href={siteConfig.contactMailto} className="transition hover:text-white">
              Support
            </a>
          </nav>
          <p className="text-[11px] text-[#525252]">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </footer>
    </div>
  );
}
