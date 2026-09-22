"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/landing/Logo";
import {
  developerLinks,
  visibleTopNavLinks,
  type NavItem,
} from "@/lib/nav";
import { siteConfig } from "@/lib/site";
import { ThemeToggle, ThemeToggleSegmented } from "@/components/theme/ThemeToggle";

function NavLink({
  item,
  className,
  onNavigate,
}: {
  item: NavItem;
  className: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isHashLink = item.href.includes("#");

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onNavigate}
      >
        {item.label}
      </a>
    );
  }

  // Cross-page anchor navigation: Next.js App Router has a known issue where <Link href="/#pricing">
  // appends the hash twice (/#pricing#pricing). Using native <a> for anchor links avoids this completely.
  if (isHashLink) {
    const isHome = pathname === "/";
    const hash = item.href.split("#")[1];

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onNavigate?.();
      if (isHome) {
        e.preventDefault();
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", `#${hash}`);
        }
      }
    };

    return (
      <a href={item.href} className={className} onClick={handleClick}>
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden
    >
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

export function HeaderNav({ isScrolled = false }: { isScrolled?: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const linkClass =
    "text-[15px] font-semibold text-black hover:text-black/75 hover:bg-black/5 dark:text-white/90 dark:hover:text-white dark:hover:bg-white/10 rounded-md px-3 py-1.5 transition-colors";

  const telegramClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-md text-black hover:text-[#229ED9] hover:bg-black/5 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10 transition";

  const toggleClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/20 text-black hover:bg-black/5 dark:border-white/25 dark:text-white dark:hover:bg-white/10 md:hidden";

  return (
    <>
      {/* Left side: Bigger Logo (original in light, white in dark) + Nav items */}
      <div className="flex items-center gap-5 sm:gap-7">
        <Logo size="xl" showText={false} tone="auto" />
        <nav className="hidden items-center gap-1 sm:gap-1.5 md:flex" aria-label="Main">
          {visibleTopNavLinks.map((link) => (
            <NavLink key={link.label} item={link} className={linkClass} />
          ))}
        </nav>
      </div>

      {/* Right side: Telegram link + Theme switcher + Primary CTA Button + Mobile Hamburger */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Telegram Support link */}
        <a
          href={siteConfig.contactTelegram}
          target="_blank"
          rel="noopener noreferrer"
          className={telegramClass}
          aria-label="Telegram Support"
          title="Telegram Support"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.196 1.006.128.832.918z" />
          </svg>
        </a>

        {/* Theme mode switcher */}
        <ThemeToggle isScrolled={isScrolled} />

        {/* Primary CTA Button */}
        <Link
          href="/start"
          className="btn-bd-primary text-center px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#007ba4] rounded-lg"
        >
          Start free
        </Link>

        {/* Mobile menu toggle button */}
        <button
          type="button"
          className={toggleClass}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {open ? (
        <div
          className="fixed inset-0 top-16 z-40 bg-black/40 pointer-events-auto md:hidden"
          aria-hidden
          onClick={close}
        />
      ) : null}

      {/* Mobile Drawer Content */}
      <div
        id="mobile-nav"
        className={`absolute inset-x-0 top-full mt-2 z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl text-slate-900 dark:text-slate-100 shadow-2xl transition-all duration-200 md:hidden ${
          open
            ? "visible translate-y-0 opacity-100 pointer-events-auto"
            : "invisible -translate-y-1 opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <nav className="container mx-auto max-w-6xl space-y-4 px-6 py-4" aria-label="Mobile">
          <ul className="space-y-1">
            {[...visibleTopNavLinks, ...developerLinks].map((link) => (
              <li key={link.label}>
                <NavLink
                  item={link}
                  onNavigate={close}
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/10 transition"
                />
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme</span>
              <ThemeToggleSegmented />
            </div>

            <a
              href={siteConfig.contactTelegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition"
              onClick={close}
            >
              <svg className="h-4 w-4 fill-current text-[#229ED9]" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.196 1.006.128.832.918z" />
              </svg>
              <span>Telegram Support</span>
            </a>
            <Link
              href="/start"
              className="btn-bd-primary text-center px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#007ba4] rounded-lg"
              onClick={close}
            >
              Start free
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
