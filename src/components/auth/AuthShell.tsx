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

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-8">
        <Logo size="sm" href="/" variant="inverse" />
        <Link
          href={siteConfig.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#a1a1a1] transition hover:text-white"
        >
          Documentation
        </Link>
      </header>

      <main
        id="auth-main"
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-4"
      >
        <div className="w-full max-w-[384px]">{children}</div>
      </main>
    </div>
  );
}
