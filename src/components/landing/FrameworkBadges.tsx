import { siteConfig } from "@/lib/site";

interface FrameworkBadgesProps {
  className?: string;
  align?: "start" | "center";
}

const frameworks = [
  {
    name: "JavaScript",
    title: "JavaScript SDK",
    href: `${siteConfig.docsUrl.replace(/\/$/, "")}/sdk/javascript/`,
    icon: (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#F7DF1E] text-black font-mono text-[10px] font-bold shadow-xs">
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" />
        </svg>
      </span>
    ),
  },
  {
    name: "Flutter",
    title: "Flutter UIKit & Sample",
    href: "https://github.com/Sendsar-Chat/sendsar-uikit-flutter",
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M14.314 0L2.3 12 6 15.7 21.684.013h-7.357z" fill="#02569B" />
        <path d="M14.328 11.072L7.857 17.53l6.47 6.47H21.7l-6.46-6.468 6.46-6.46h-7.37z" fill="#0175C2" />
        <path d="M15.24 17.532l-3.235-3.235 3.235-3.235 3.235 3.235-3.235 3.235z" fill="#29B6F6" />
      </svg>
    ),
  },
  {
    name: "Angular",
    title: "Angular UIKit & Sample",
    href: `${siteConfig.docsUrl.replace(/\/$/, "")}/uikit/angular/`,
    icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 5.5l1.6 13L12 22l8.4-3.5 1.6-13L12 2z" fill="#DD0031" />
        <path d="M12 2v20l8.4-3.5 1.6-13L12 2z" fill="#C3002F" />
        <path d="M12 4.6l-6.1 13.8h2.3l1.2-3.1h5.2l1.2 3.1h2.3L12 4.6zm-1.8 8.8l1.8-4.4 1.8 4.4h-3.6z" fill="#FFFFFF" />
      </svg>
    ),
  },
];

export function FrameworkBadges({ className = "", align = "start" }: FrameworkBadgesProps) {
  const justifyClass = align === "center" ? "justify-center" : "justify-start";

  return (
    <div className={`flex flex-wrap items-center gap-2.5 sm:gap-3 ${justifyClass} ${className}`}>
      {frameworks.map((fw) => (
        <a
          key={fw.name}
          href={fw.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-slate-400 hover:bg-white hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
          title={fw.title}
        >
          {fw.icon}
          <span>{fw.name}</span>
        </a>
      ))}
    </div>
  );
}
