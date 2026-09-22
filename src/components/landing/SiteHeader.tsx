"use client";

import { useEffect, useState } from "react";

import { HeaderNav } from "@/components/landing/HeaderNav";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 w-full pointer-events-none transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-2 sm:pt-3">
        <div
          className={`pointer-events-auto relative w-full flex items-center justify-between rounded-2xl transition-all duration-300 ease-out origin-center ${
            isScrolled
              ? "bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-black/5 py-2.5 px-4 sm:px-6"
              : "bg-transparent border border-transparent shadow-none py-3 sm:py-4 px-0"
          }`}
        >
          <HeaderNav isScrolled={isScrolled} />
        </div>
      </div>
    </header>
  );
}
