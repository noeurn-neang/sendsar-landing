"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type NavigationProgressValue = {
  pending: boolean;
  navigate: (href: string) => void;
};

const NavigationProgressContext = createContext<NavigationProgressValue | null>(null);

export function useNavigationProgress() {
  const ctx = useContext(NavigationProgressContext);
  if (!ctx) {
    throw new Error("useNavigationProgress must be used within NavigationProgressProvider");
  }
  return ctx;
}

export function NavigationProgressProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [trickle, setTrickle] = useState(false);

  useEffect(() => {
    // Path settled — ensure bar can finish even if transition already cleared.
    setTrickle(false);
  }, [pathname]);

  useEffect(() => {
    if (pending) setTrickle(true);
  }, [pending]);

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname) return;
      setTrickle(true);
      startTransition(() => {
        router.push(href);
      });
    },
    [pathname, router],
  );

  const value = useMemo(
    () => ({ pending: pending || trickle, navigate }),
    [pending, trickle, navigate],
  );

  return (
    <NavigationProgressContext.Provider value={value}>
      <TopLoadingBar active={value.pending} />
      {children}
    </NavigationProgressContext.Provider>
  );
}

function TopLoadingBar({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!active) {
      setWidth(100);
      const hide = window.setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 220);
      return () => window.clearTimeout(hide);
    }

    setVisible(true);
    setWidth(12);
    const t1 = window.setTimeout(() => setWidth(42), 80);
    const t2 = window.setTimeout(() => setWidth(68), 280);
    const t3 = window.setTimeout(() => setWidth(82), 700);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [active]);

  if (!visible && width === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px] overflow-hidden"
      aria-hidden={!active}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
    >
      <div
        className="h-full bg-brand shadow-[0_0_8px_var(--brand)] transition-[width] duration-300 ease-out"
        style={{ width: `${width}%`, opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}
