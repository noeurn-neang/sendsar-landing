import Link from "next/link";

export function DashboardPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[1.625rem] font-semibold tracking-tight text-console-fg">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-console-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  progress,
}: {
  label: string;
  value: string;
  hint?: string;
  progress?: number;
}) {
  return (
    <div className="console-card p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-console-muted">
        {label}
      </p>
      <p className="mt-2.5 font-mono text-[1.625rem] font-semibold tracking-tight text-console-fg">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-console-muted">{hint}</p> : null}
      {typeof progress === "number" ? (
        <div className="mt-3.5 h-1 overflow-hidden rounded-full bg-console-track">
          <div
            className="h-full rounded-full bg-brand transition-all"
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
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="console-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-console-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-console-fg">{title}</h2>
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

export function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-console-border bg-console-panel px-4 py-3 text-sm leading-relaxed text-console-muted">
      {children}
    </div>
  );
}

export function DocsLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-medium text-brand hover:text-brand-strong"
    >
      {children}
    </Link>
  );
}

export function StatusPill({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning";
  children: React.ReactNode;
}) {
  const styles =
    tone === "success"
      ? "bg-emerald-500/10 text-emerald-700 ring-emerald-600/20 [.console-theme[data-theme=dark]_&]:text-emerald-300"
      : tone === "warning"
        ? "bg-amber-500/10 text-amber-800 ring-amber-600/20 [.console-theme[data-theme=dark]_&]:text-amber-200"
        : "bg-console-track text-console-muted ring-console-border";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles}`}
    >
      {children}
    </span>
  );
}

/** Primary CTA — use in dashboard pages for consistency */
export function ConsolePrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="console-btn-primary">
      {children}
    </Link>
  );
}

export function ConsoleSecondaryLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="console-btn-secondary">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className="console-btn-secondary">
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

/** Mutation actions — label swap + disabled. No nav-style spinners. */
export function LoadingButton({
  pending = false,
  pendingLabel,
  variant = "primary",
  children,
  className = "",
  disabled,
  ...props
}: LoadingButtonProps) {
  const base = variant === "primary" ? "console-btn-primary" : "console-btn-secondary";
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={`${base} inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {pending ? pendingLabel ?? "Working…" : children}
    </button>
  );
}
