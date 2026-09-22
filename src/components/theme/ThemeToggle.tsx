"use client";

import { useEffect, useRef, useState } from "react";
import { useSiteTheme, type SiteTheme } from "@/lib/theme";

function SunIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
    </svg>
  );
}

function SystemIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}

function CheckIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const themeOptions: { value: SiteTheme; label: string; icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: SystemIcon },
];

export function ThemeToggle({
  isScrolled = false,
  className = "",
}: {
  isScrolled?: boolean;
  className?: string;
}) {
  const { theme, resolvedTheme, setTheme, mounted } = useSiteTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const buttonClasses =
    "inline-flex h-9 w-9 items-center justify-center rounded-md text-black hover:text-[#0096c8] hover:bg-black/5 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10 transition";

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
        aria-label={`Current theme: ${theme}. Click to change theme.`}
        title={`Theme: ${theme}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {!mounted ? (
          <span className="h-4 w-4" aria-hidden="true" />
        ) : resolvedTheme === "dark" ? (
          <MoonIcon />
        ) : (
          <SunIcon />
        )}
      </button>

      {isOpen ? (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-36 origin-top-right rounded-xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900/95 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = mounted && theme === opt.value;

            return (
              <button
                key={opt.value}
                type="button"
                role="menuitem"
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? "bg-[#0096c8]/10 text-[#0096c8] dark:bg-[#0096c8]/20 dark:text-[#38bdf8]"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{opt.label}</span>
                </div>
                {isSelected ? <CheckIcon className="h-3.5 w-3.5 text-[#0096c8] dark:text-[#38bdf8]" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function ThemeToggleSegmented({ className = "" }: { className?: string }) {
  const { theme, setTheme, mounted } = useSiteTheme();

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-slate-200/80 bg-slate-100/80 p-0.5 dark:border-slate-800 dark:bg-slate-900/80 ${className}`}
      role="group"
      aria-label="Theme mode switcher"
    >
      {themeOptions.map((opt) => {
        const Icon = opt.icon;
        const isSelected = mounted && theme === opt.value;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              isSelected
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
            aria-pressed={isSelected}
            title={opt.label}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
