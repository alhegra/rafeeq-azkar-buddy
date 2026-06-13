import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookOpen, CircleDot, Compass, Settings as SettingsIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", icon: Home, key: "home" as const },
  { to: "/azkar", icon: BookOpen, key: "azkar" as const },
  { to: "/tasbeeh", icon: CircleDot, key: "tasbeeh" as const },
  { to: "/qibla", icon: Compass, key: "qibla" as const },
  { to: "/settings", icon: SettingsIcon, key: "settings" as const },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="pattern-bg min-h-screen text-foreground">
      <div className="mx-auto w-full max-w-[480px] pb-28">{children}</div>

      <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 px-4 w-[min(100%-1rem,420px)]">
        <div className="glass-strong rounded-full ring-1 ring-black/5 dark:ring-white/10 shadow-[0_12px_40px_-12px_rgba(12,74,110,0.35)] h-16 flex items-center justify-around px-3">
          {tabs.map(({ to, icon: Icon, key }) => {
            const active =
              to === "/"
                ? pathname === "/"
                : pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className="group flex flex-1 flex-col items-center justify-center gap-1 py-2"
              >
                <span
                  className={
                    "flex h-9 w-12 items-center justify-center rounded-full transition-all " +
                    (active
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground group-active:scale-95")
                  }
                >
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span
                  className={
                    "text-[10px] font-medium leading-none " +
                    (active ? "text-primary" : "text-muted-foreground")
                  }
                >
                  {t(`tabs.${key}`)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
