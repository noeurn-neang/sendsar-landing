"use client";

import Link from "next/link";

import { useNavigationProgress } from "@/components/dashboard/NavigationProgress";

export function DashboardNavLink({
  href,
  label,
  collapsed,
  active,
  icon,
  onNavigate,
}: {
  href: string;
  label: string;
  collapsed: boolean;
  active: boolean;
  icon: React.ReactNode;
  onNavigate?: () => void;
}) {
  const { navigate, pending } = useNavigationProgress();

  return (
    <Link
      href={href}
      title={label}
      prefetch={false}
      onClick={(event) => {
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        event.preventDefault();
        onNavigate?.();
        navigate(href);
      }}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center rounded-xl text-[13px] font-medium transition ${
        collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2"
      } ${
        active
          ? "bg-white text-[#0096c8] font-semibold shadow-xs ring-1 ring-slate-200/80 dark:bg-white/10 dark:text-[#38bdf8] dark:ring-white/10"
          : "text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
      } ${pending && !active ? "opacity-70" : ""}`}
    >
      <span
        className={
          active
            ? "text-[#0096c8] dark:text-[#38bdf8]"
            : "text-slate-400 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-white"
        }
      >
        {icon}
      </span>
      {!collapsed ? <span className="truncate">{label}</span> : null}
    </Link>
  );
}
