"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export type SiteTheme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "sendsar-site-theme";
const THEME_CHANGE_EVENT = "sendsar-theme-change";

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getStoredTheme(): SiteTheme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // ignore localStorage exceptions
  }
  return "system";
}

export function resolveTheme(theme: SiteTheme): ResolvedTheme {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
}

export function applyTheme(theme: SiteTheme): void {
  if (typeof window === "undefined") return;

  const resolved = resolveTheme(theme);
  const root = document.documentElement;

  if (resolved === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
  }

  try {
    if (theme === "system") {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  } catch {
    // ignore localStorage errors
  }

  window.dispatchEvent(
    new CustomEvent(THEME_CHANGE_EVENT, {
      detail: { theme, resolvedTheme: resolved },
    })
  );
}

// In-memory store subscription for reactive synchronization
let currentTheme: SiteTheme = "system";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleCustom = () => callback();
  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      callback();
    }
  };
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleMedia = () => {
    if (getStoredTheme() === "system") {
      applyTheme("system");
      callback();
    }
  };

  window.addEventListener(THEME_CHANGE_EVENT, handleCustom);
  window.addEventListener("storage", handleStorage);
  mediaQuery.addEventListener("change", handleMedia);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handleCustom);
    window.removeEventListener("storage", handleStorage);
    mediaQuery.removeEventListener("change", handleMedia);
  };
}

function getSnapshot(): SiteTheme {
  return getStoredTheme();
}

function getServerSnapshot(): SiteTheme {
  return "system";
}

export function useSiteTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [mounted, setMounted] = useState(false);
  const resolvedTheme: ResolvedTheme = mounted ? resolveTheme(theme) : "light";

  useEffect(() => {
    setMounted(true);
    // Ensure the theme is properly applied on mount
    applyTheme(getStoredTheme());
  }, []);

  const setTheme = (newTheme: SiteTheme) => {
    applyTheme(newTheme);
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
    mounted,
  };
}
