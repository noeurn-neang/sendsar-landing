import Link from "next/link";

import { FrameworkBadges } from "@/components/landing/FrameworkBadges";
import { HeroMotionWidget } from "@/components/landing/HeroMotionWidget";
import { siteConfig } from "@/lib/site";

export function Hero() {
  return (
    <section
      id="content"
      className="bd-masthead relative flex min-h-screen items-center overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(var(--bs-body-bg-rgb), .01), rgba(var(--bs-body-bg-rgb), 1) 85%), radial-gradient(ellipse at top left, rgba(var(--bs-primary-rgb), .5), transparent 50%), radial-gradient(ellipse at top right, rgba(var(--bd-accent-rgb), .5), transparent 50%), radial-gradient(ellipse at center right, rgba(var(--bd-violet-rgb), .5), transparent 50%), radial-gradient(ellipse at center left, rgba(var(--bd-pink-rgb), .5), transparent 50%)",
      }}
    >
      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-24 sm:pt-28 lg:pt-32 pb-10 lg:pb-14 w-full">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Text & Call to Actions */}
          <div className="marketing-fade-up lg:col-span-6 flex flex-col items-start text-left">
            {/* Masthead Display H1 Heading */}
            <h1 className="text-4xl font-semibold tracking-normal sm:tracking-[0.015em] sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] lg:leading-[1.16] text-foreground">
              Headless Chat
            </h1>

            {/* Lead Subtitle */}
            <p className="mt-4 text-lg sm:text-xl font-normal tracking-[0.01em] leading-relaxed text-slate-600 dark:text-slate-300">
              Developer-friendly. Integrate real-time messaging, voice, and video into your app with drop-in components and robust APIs.
            </p>

            {/* Action Buttons: Start Free & Read the docs */}
            <div className="mt-22 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <Link
                href="/start"
                className="btn-bd-primary text-center px-7 py-3 text-base font-semibold tracking-[0.015em] text-white shadow-lg shadow-[#0096c8]/20 transition hover:bg-[#007ba4]"
              >
                Start Free
              </Link>

              <a
                href={siteConfig.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300/80 bg-white/80 px-6 py-3 text-base font-semibold tracking-[0.015em] text-slate-700 shadow-sm backdrop-blur transition hover:border-slate-400 hover:bg-white hover:text-slate-900 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                <svg
                  className="h-4 w-4 text-slate-500 transition-colors group-hover:text-[#0096c8] dark:text-slate-400 dark:group-hover:text-[#38bdf8]"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8.5 2.687c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" />
                </svg>
                <span>Read the docs</span>
              </a>
            </div>

            {/* SDK & Framework Badges: JavaScript, Flutter, Angular */}
            <FrameworkBadges className="mt-8" align="start" />
          </div>

          {/* Right Column: Interactive Motion Chat Widget Canvas */}
          <div className="marketing-fade-up-delay relative lg:col-span-6 w-full flex items-center justify-center">
            <HeroMotionWidget />
          </div>
        </div>
      </div>
    </section>
  );
}

