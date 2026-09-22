"use client";

import Link from "next/link";
import { useState } from "react";

export function DashboardPageHeader({
  title,
  description,
  badge,
  actions,
}: {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-console-fg sm:text-[1.75rem]">
            {title}
          </h1>
          {badge}
        </div>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-console-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>
      ) : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  progress,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  progress?: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group relative rounded-2xl border border-console-border bg-console-panel p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0096c8]/40 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-console-muted">
          {label}
        </p>
        {icon ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0096c8]/10 text-[#0096c8] transition-transform duration-200 group-hover:scale-105 dark:bg-[#0096c8]/20 dark:text-[#38bdf8]">
            {icon}
          </div>
        ) : null}
      </div>

      <p className="mt-2.5 font-mono text-2xl font-bold tracking-tight text-console-fg sm:text-[1.625rem]">
        {value}
      </p>

      {hint ? (
        <p className="mt-1 text-xs text-console-muted">{hint}</p>
      ) : null}

      {typeof progress === "number" ? (
        <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-console-track">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0096c8] to-[#00e8e6] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-console-border bg-console-panel shadow-sm transition hover:shadow-md ${className}`}>
      <div className="flex flex-col gap-3 border-b border-console-border/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-console-fg">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-console-muted">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function EmptyHint({
  children,
  live = false,
}: {
  children: React.ReactNode;
  live?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-console-border bg-console-panel/70 px-4 py-3 text-xs leading-relaxed text-console-muted backdrop-blur-sm sm:text-sm">
      {live ? (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      ) : (
        <svg
          className="h-4 w-4 shrink-0 text-[#0096c8]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="12" cy="10" r="8" />
          <line x1="12" y1="14" x2="12" y2="10" />
          <line x1="12" y1="7" x2="12.01" y2="7" />
        </svg>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function DocsLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm font-medium text-brand transition hover:text-brand-strong"
    >
      <span>{children}</span>
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
      </svg>
    </Link>
  );
}

export function StatusPill({
  tone = "neutral",
  dot = true,
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "brand";
  dot?: boolean;
  children: React.ReactNode;
}) {
  let styles = "bg-console-track text-console-muted ring-console-border";
  let dotColor = "bg-console-muted";

  if (tone === "success") {
    styles = "bg-emerald-500/10 text-emerald-700 ring-emerald-600/20 dark:text-emerald-400";
    dotColor = "bg-emerald-500";
  } else if (tone === "warning") {
    styles = "bg-amber-500/10 text-amber-800 ring-amber-600/20 dark:text-amber-300";
    dotColor = "bg-amber-500";
  } else if (tone === "brand") {
    styles = "bg-[#0096c8]/10 text-[#0096c8] ring-[#0096c8]/25 dark:text-[#38bdf8]";
    dotColor = "bg-[#0096c8]";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles}`}
    >
      {dot ? <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} aria-hidden /> : null}
      {children}
    </span>
  );
}

export function CopyButton({
  value,
  label = "Copy",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied to clipboard!" : `Copy ${label}`}
      aria-label={copied ? "Copied" : `Copy ${label}`}
      className={`relative inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-console-muted transition hover:bg-console-track hover:text-console-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0096c8] ${className}`}
    >
      {copied ? (
        <>
          <svg
            className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Copied!
          </span>
        </>
      ) : (
        <>
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

/** Primary CTA — aligned with brand primary button styling */
export function ConsolePrimaryLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`btn-bd-primary inline-flex items-center justify-center gap-2 rounded-xl bg-[#0096c8] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#0096c8]/20 transition hover:bg-[#007ba4] hover:shadow-lg ${className}`}
    >
      {children}
    </Link>
  );
}

export function ConsoleSecondaryLink({
  href,
  children,
  external,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
}) {
  const baseClasses = `inline-flex items-center justify-center gap-1.5 rounded-xl border border-console-border bg-console-panel px-3.5 py-2 text-sm font-semibold text-console-fg shadow-sm transition hover:border-[#0096c8]/40 hover:bg-console-track ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={baseClasses}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={baseClasses}>
      {children}
    </Link>
  );
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4Z"
      />
    </svg>
  );
}

type LoadingButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pending?: boolean;
  pendingLabel?: string;
  variant?: "primary" | "secondary";
};

/** Mutation actions — label swap + disabled */
export function LoadingButton({
  pending = false,
  pendingLabel,
  variant = "primary",
  children,
  className = "",
  disabled,
  ...props
}: LoadingButtonProps) {
  const base =
    variant === "primary"
      ? "btn-bd-primary rounded-xl bg-[#0096c8] text-white shadow-sm hover:bg-[#007ba4]"
      : "rounded-xl border border-console-border bg-console-panel text-console-fg hover:bg-console-track";
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={`${base} inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {pending ? (
        <>
          <Spinner className="h-4 w-4" />
          <span>{pendingLabel ?? "Working…"}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
