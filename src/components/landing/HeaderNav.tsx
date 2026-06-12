"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  developerLinks,
  productLinks,
  siteMode,
  visibleTopNavLinks,
  type NavItem,
} from "@/lib/nav";
import { siteConfig } from "@/lib/site";

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 opacity-60" aria-hidden>
      <path
        fill="currentColor"
        d="M4.5 6 8 9.5 11.5 6"
      />
    </svg>
  );
}

function DropdownLabel({ item }: { item: NavItem }) {
  return (
    <>
      <span className="block text-sm font-medium text-foreground">{item.label}</span>
      {item.description ? (
        <span className="mt-0.5 block text-xs text-neutral-500">{item.description}</span>
      ) : null}
    </>
  );
}

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

function DesktopDropdown({
  label,
  items,
}: {
  label: string;
  items: NavItem[];
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className="inline-flex items-center gap-1 text-sm font-medium text-neutral-600 transition-colors hover:text-brand dark:text-neutral-300"
        aria-haspopup="true"
      >
        {label}
        <Chevron />
      </button>
      <div className="invisible absolute left-0 top-full z-50 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="w-72 rounded-xl border border-border bg-surface p-2 shadow-lg">
          {items.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg px-3 py-2.5 transition hover:bg-surface-muted"
              >
                <DropdownLabel item={item} />
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-lg px-3 py-2.5 transition hover:bg-surface-muted"
              >
                <DropdownLabel item={item} />
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
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

function MobileGroup({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  onNavigate: () => void;
}) {
  return (
    <div>
      <p className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.label}>
            <NavLink
              item={item}
              onNavigate={onNavigate}
              className="block rounded-lg px-3 py-2.5 text-base font-medium text-neutral-700 transition hover:bg-surface-muted hover:text-brand dark:text-neutral-200"
            />
          </li>
        ))}
      </ul>
    </div>
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
    "text-sm font-medium text-neutral-600 transition-colors hover:text-brand dark:text-neutral-300";

  return (
    <>
      <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
        <DesktopDropdown label="Product" items={productLinks} />
        {visibleTopNavLinks.map((link) => (
          <NavLink key={link.label} item={link} className={linkClass} />
        ))}
        {siteMode.showDevelopersMenu ? (
          <DesktopDropdown label="Developers" items={developerLinks} />
        ) : null}
      </nav>

      <div className="hidden items-center gap-3 lg:flex">
        <a
          href={siteConfig.contactTelegram}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:border-brand/40 hover:text-brand dark:text-neutral-300"
        >
          Telegram
        </a>
        <a
          href={siteConfig.earlyAccessMailto}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong"
        >
          Get early access
        </a>
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
          <MobileGroup title="Product" items={productLinks} onNavigate={close} />
          {siteMode.showDevelopersMenu ? (
            <MobileGroup title="Developers" items={developerLinks} onNavigate={close} />
          ) : null}
          {visibleTopNavLinks.length > 0 ? (
            <ul className="space-y-0.5 border-t border-border pt-4">
              {visibleTopNavLinks.map((link) => (
                <li key={link.label}>
                  <NavLink
                    item={link}
                    onNavigate={close}
                    className="block rounded-lg px-3 py-2.5 text-base font-medium text-neutral-700 transition hover:bg-surface-muted hover:text-brand dark:text-neutral-200"
                  />
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <a
              href={siteConfig.earlyAccessMailto}
              className="rounded-lg bg-brand px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-strong"
              onClick={close}
            >
              Get early access
            </a>
            <a
              href={siteConfig.contactTelegram}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-3 py-2.5 text-center text-sm font-semibold transition hover:border-brand/40 hover:text-brand"
              onClick={close}
            >
              Telegram
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
