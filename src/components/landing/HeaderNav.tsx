"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  developerLinks,
  visibleTopNavLinks,
  type NavItem,
} from "@/lib/nav";

function NavLink({
  item,
  className,
  onNavigate,
}: {
  item: NavItem;
  className: string;
  onNavigate?: () => void;
}) {
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

export function HeaderNav() {
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
    "text-sm font-semibold text-neutral-600 transition-colors hover:text-brand dark:text-neutral-300";

  return (
    <>
      <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
        {visibleTopNavLinks.map((link) => (
          <NavLink key={link.label} item={link} className={linkClass} />
        ))}
      </nav>

      <div className="hidden items-center gap-3 lg:flex">
        <Link
          href="/start"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong"
        >
          Start free
        </Link>
      </div>

      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-neutral-700 transition hover:border-brand/40 hover:text-brand lg:hidden dark:text-neutral-200"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <MenuIcon open={open} />
      </button>

      {open ? (
        <div
          className="fixed inset-0 top-16 z-40 bg-black/20 lg:hidden"
          aria-hidden
          onClick={close}
        />
      ) : null}

      <div
        id="mobile-nav"
        className={`absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-surface shadow-lg transition-all duration-200 lg:hidden ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <nav className="container mx-auto max-w-6xl space-y-4 px-6 py-4" aria-label="Mobile">
          <ul className="space-y-0.5">
            {[...visibleTopNavLinks, ...developerLinks].map((link) => (
              <li key={link.label}>
                <NavLink
                  item={link}
                  onNavigate={close}
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-neutral-700 transition hover:bg-surface-muted hover:text-brand dark:text-neutral-200"
                />
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <Link
              href="/start"
              className="rounded-lg bg-brand px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-strong"
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
