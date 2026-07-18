"use client";

import { useEffect, useState } from "react";

export type ConsoleTheme = "light" | "dark";

const THEME_KEY = "sendsar-console-theme";
const SIDEBAR_KEY = "sendsar-console-sidebar-collapsed";

function readTheme(): ConsoleTheme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SIDEBAR_KEY) === "1";
}

export function useConsoleChrome() {
  const [theme, setThemeState] = useState<ConsoleTheme>("light");
  const [collapsed, setCollapsedState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setThemeState(readTheme());
    setCollapsedState(readCollapsed());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme, ready]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
  }, [collapsed, ready]);

  function toggleTheme() {
    setThemeState((current) => (current === "dark" ? "light" : "dark"));
  }

  function toggleCollapsed() {
    setCollapsedState((current) => !current);
  }

  return {
    theme,
    collapsed,
    ready,
    toggleTheme,
    toggleCollapsed,
    setCollapsed: setCollapsedState,
  };
}
