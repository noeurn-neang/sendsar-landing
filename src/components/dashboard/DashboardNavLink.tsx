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
      className={`group flex items-center rounded-md text-[13px] transition ${
        collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-2.5 py-2"
      } ${
        active
          ? "bg-console-sidebar-active font-medium text-console-sidebar-active-fg"
          : "text-console-muted hover:bg-console-sidebar-hover hover:text-console-fg"
      } ${pending && !active ? "opacity-70" : ""}`}
    >
      <span
        className={
          active
            ? "text-console-sidebar-active-fg"
            : "text-console-muted group-hover:text-console-fg"
        }
      >
        {icon}
      </span>
      {!collapsed ? <span className="truncate">{label}</span> : null}
    </Link>
  );
}
