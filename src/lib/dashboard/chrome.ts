"use client";

import { useEffect, useState } from "react";
import { useSiteTheme, type ResolvedTheme } from "@/lib/theme";

const SIDEBAR_KEY = "sendsar-console-sidebar-collapsed";

function readCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SIDEBAR_KEY) === "1";
}

export function useConsoleChrome() {
  const { resolvedTheme, setTheme } = useSiteTheme();
  const [collapsed, setCollapsedState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCollapsedState(readCollapsed());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
    } catch {
      // ignore
    }
  }, [collapsed, ready]);

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  function toggleCollapsed() {
    setCollapsedState((current) => !current);
  }

  return {
    theme: resolvedTheme as ResolvedTheme,
    collapsed,
    ready,
    toggleTheme,
    toggleCollapsed,
    setCollapsed: setCollapsedState,
  };
}
