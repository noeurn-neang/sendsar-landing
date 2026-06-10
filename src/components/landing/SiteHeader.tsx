import { HeaderNav } from "@/components/landing/HeaderNav";
import { Logo } from "@/components/landing/Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="container relative mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo size="sm" />
        <HeaderNav />
      </div>
    </header>
  );
}
