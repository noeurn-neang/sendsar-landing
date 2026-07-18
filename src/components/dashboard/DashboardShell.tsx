"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

import { Logo } from "@/components/landing/Logo";
import { LogoMark } from "@/components/landing/LogoMark";
import { DashboardNavLink } from "@/components/dashboard/DashboardNavLink";
import { NavigationProgressProvider } from "@/components/dashboard/NavigationProgress";
import { useConsoleChrome } from "@/lib/dashboard/chrome";
import { dashboardNav } from "@/lib/dashboard/nav";
import type { WorkspaceSummary } from "@/lib/dashboard/workspace";
import { siteConfig } from "@/lib/site";

function NavIcon({ name }: { name: string }) {
  const common = "h-[18px] w-[18px] shrink-0";
  switch (name) {
    case "Overview":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path
            d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Keys":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <circle cx="8" cy="14" r="3.25" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M11 14h9v3M17 14v3"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "Usage":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path
            d="M4 19V5M4 19h16"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M8 15v-3M12 15V8M16 15v-5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "Billing":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <rect
            x="3.5"
            y="6"
            width="17"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path d="M3.5 10h17" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      );
    case "Settings":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
          <path
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M12 4.5v2.2M12 17.3v2.2M4.5 12h2.2M17.3 12h2.2M6.4 6.4l1.6 1.6M16 16l1.6 1.6M17.6 6.4 16 8M8 16l-1.6 1.6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 14.5A7.5 7.5 0 0 1 9.5 4 7.5 7.5 0 1 0 20 14.5Z"
      />
    </svg>
  );
}

function PanelLeftIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M9 4.5v15" />
      {collapsed ? (
        <path strokeLinecap="round" d="M13.5 12h4" />
      ) : (
        <path strokeLinecap="round" d="M14 9.5 11.5 12 14 14.5" />
      )}
    </svg>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({
  workspace,
  children,
}: {
  workspace: WorkspaceSummary;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { theme, collapsed, toggleTheme, toggleCollapsed, setCollapsed } = useConsoleChrome();
  const initials = workspace.name.slice(0, 2).toUpperCase();
  const currentNav = dashboardNav.find((item) => isActive(pathname, item.href));
  const logoInverse = theme === "dark";

  const sidebar = (opts: { collapsed: boolean; onNavigate?: () => void }) => (
    <div className="flex h-full flex-col bg-console-sidebar">
      <div
        className={`flex h-14 shrink-0 items-center ${
          opts.collapsed ? "justify-center px-2" : "justify-between gap-2 px-4"
        }`}
      >
        {opts.collapsed ? (
          <Link
            href="/dashboard"
            className="inline-flex h-9 w-9 items-center justify-center"
            aria-label="Sendsar"
          >
            <LogoMark
              className="h-7 w-7"
              tone={logoInverse ? "dark" : "light"}
            />
          </Link>
        ) : (
          <>
            <Logo size="sm" href="/dashboard" variant={logoInverse ? "inverse" : "default"} />
            <button
              type="button"
              className="console-icon-btn hidden lg:inline-flex"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              onClick={toggleCollapsed}
            >
              <PanelLeftIcon collapsed={false} />
            </button>
          </>
        )}
      </div>

      <div className={opts.collapsed ? "px-2 pb-3" : "px-3 pb-3"}>
        {opts.collapsed ? (
          <div
            className="mx-auto flex h-9 w-9 items-center justify-center rounded-md bg-brand/10 text-[11px] font-bold tracking-wide text-brand"
            title={`${workspace.name} · ${workspace.planName}`}
          >
            {initials}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-1 py-1">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand/10 text-[11px] font-bold tracking-wide text-brand">
              {initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-console-fg">
                {workspace.name}
              </span>
              <span className="block truncate text-xs text-console-muted">
                {workspace.planName}
                {workspace.slug ? ` · ${workspace.slug}` : ""}
              </span>
            </span>
          </div>
        )}
      </div>

      <div className={opts.collapsed ? "px-2" : "px-3"}>
        {!opts.collapsed ? (
          <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-console-muted">
            Project
          </p>
        ) : null}
        <nav className="space-y-0.5" aria-label="Dashboard">
          {dashboardNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <DashboardNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                collapsed={opts.collapsed}
                active={active}
                onNavigate={opts.onNavigate}
                icon={<NavIcon name={item.label} />}
              />
            );
          })}
        </nav>
      </div>

      <div
        className={`mt-auto space-y-0.5 border-t border-console-border ${
          opts.collapsed ? "p-2" : "p-3"
        }`}
      >
        <a
          href={siteConfig.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Documentation"
          className={`flex items-center rounded-md text-[13px] text-console-muted transition hover:bg-console-sidebar-hover hover:text-console-fg ${
            opts.collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-2.5 py-2"
          }`}
        >
          {opts.collapsed ? (
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <path strokeLinecap="round" d="M7 4.5h8.5A2.5 2.5 0 0 1 18 7v13.5L12.5 17 7 20.5V4.5Z" />
            </svg>
          ) : (
            "Documentation"
          )}
        </a>
        <button
          type="button"
          title="Sign out"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            void signOut({ callbackUrl: "/" });
          }}
          className={`flex w-full items-center rounded-md text-left text-[13px] text-console-muted transition hover:bg-console-sidebar-hover hover:text-console-fg disabled:opacity-60 ${
            opts.collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-2.5 py-2"
          }`}
        >
          {opts.collapsed ? (
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                d="M10 7V5.5A1.5 1.5 0 0 1 11.5 4h7A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 10 18.5V17M4 12h10M7.5 8.5 4 12l3.5 3.5"
              />
            </svg>
          ) : (
            signingOut ? "Signing out…" : "Sign out"
          )}
        </button>
      </div>
    </div>
  );

  return (
    <NavigationProgressProvider>
    <div
      className="console-theme flex min-h-screen bg-console-canvas text-console-fg"
      data-theme={theme}
    >
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-console-border transition-[width] duration-200 ease-out lg:block ${
          collapsed ? "w-[72px]" : "w-[240px]"
        }`}
      >
        {sidebar({ collapsed })}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[280px] border-r border-console-border bg-console-sidebar shadow-xl">
            {sidebar({
              collapsed: false,
              onNavigate: () => setMobileOpen(false),
            })}
          </aside>
        </div>
      ) : null}

      <div
        className={`flex min-h-screen flex-1 flex-col transition-[padding] duration-200 ease-out ${
          collapsed ? "lg:pl-[72px]" : "lg:pl-[240px]"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-console-border bg-console-panel/90 px-4 backdrop-blur-md sm:gap-3 sm:px-6">
          <button
            type="button"
            className="console-icon-btn inline-flex lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>

          {collapsed ? (
            <button
              type="button"
              className="console-icon-btn hidden lg:inline-flex"
              aria-label="Expand sidebar"
              title="Expand sidebar"
              onClick={() => setCollapsed(false)}
            >
              <PanelLeftIcon collapsed />
            </button>
          ) : null}

          <div className="min-w-0 flex-1">
            <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
              <span className="truncate font-medium text-console-fg">{workspace.name}</span>
              <span className="text-console-border">/</span>
              <span className="truncate text-console-muted">
                {currentNav?.label ?? "Console"}
              </span>
            </nav>
          </div>

          <button
            type="button"
            className="console-icon-btn inline-flex"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            onClick={toggleTheme}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-console-border bg-console-canvas px-2.5 py-1 text-xs font-medium text-console-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            {workspace.planName}
          </span>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="mt-auto shrink-0 border-t border-console-border bg-console-panel">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-console-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>
              © {new Date().getFullYear()} {siteConfig.name}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a
                href={siteConfig.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-console-fg"
              >
                Docs
              </a>
              <a
                href={siteConfig.contactTelegram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-console-fg"
              >
                Support
              </a>
              <Link href="/privacy" className="transition hover:text-console-fg">
                Privacy
              </Link>
              <Link href="/terms" className="transition hover:text-console-fg">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
    </NavigationProgressProvider>
  );
}
