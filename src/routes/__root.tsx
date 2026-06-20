import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import "../lib/i18n";
import { useAppStore } from "../lib/store";
import { useReminders } from "../hooks/use-reminders";
import { AmbientZikr } from "../components/ambient-zikr";

import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="pattern-bg flex min-h-screen items-center justify-center px-6">
      <div className="glass-card max-w-sm rounded-3xl p-8 text-center">
        <h1 className="font-display text-6xl font-bold text-ink">٤٠٤</h1>
        <h2 className="mt-3 font-display text-lg font-semibold">الصفحة غير موجودة</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          الصفحة التي تبحث عنها غير متاحة.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="pattern-bg flex min-h-screen items-center justify-center px-6">
      <div className="glass-card max-w-sm rounded-3xl p-8 text-center">
        <h1 className="font-display text-lg font-semibold text-ink">حدث خطأ</h1>
        <p className="mt-2 text-sm text-muted-foreground">حاول مرة أخرى.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0c4a6e" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "رفيق أذكار" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "format-detection", content: "telephone=no" },
      { title: "رفيق أذكار — Rafeeq Azkar" },
      {
        name: "description",
        content:
          "تطبيق إسلامي شامل للأذكار والأدعية والتسبيح ومواقيت الصلاة واتجاه القبلة — رفيقك اليومي في الذكر.",
      },
      { property: "og:title", content: "رفيق أذكار — Rafeeq Azkar" },
      {
        property: "og:description",
        content: "رفيقك اليومي في الذكر والعبادة.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a6f2dce6-fae8-4a4e-a5f1-27b5fb09ace3/id-preview-f7709d4d--5fdc9ddc-9539-477f-9cbc-dd83722f8f33.lovable.app-1781894801225.png" },
      { name: "twitter:title", content: "رفيق أذكار — Rafeeq Azkar" },
      { name: "description", content: "Daily Azkar is a comprehensive Islamic app for daily worship, featuring Azkar, Duas, prayer times, Qibla, and smart reminders." },
      { property: "og:description", content: "Daily Azkar is a comprehensive Islamic app for daily worship, featuring Azkar, Duas, prayer times, Qibla, and smart reminders." },
      { name: "twitter:description", content: "Daily Azkar is a comprehensive Islamic app for daily worship, featuring Azkar, Duas, prayer times, Qibla, and smart reminders." },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a6f2dce6-fae8-4a4e-a5f1-27b5fb09ace3/id-preview-f7709d4d--5fdc9ddc-9539-477f-9cbc-dd83722f8f33.lovable.app-1781894801225.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Reem+Kufi:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function LangSync() {
  const language = useAppStore((s) => s.language);
  const theme = useAppStore((s) => s.theme);
  useEffect(() => {
    import("../lib/i18n").then((mod) => {
      const inst = mod.default;
      if (inst && typeof inst.changeLanguage === "function" && inst.language !== language) {
        inst.changeLanguage(language);
      }
    });
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.lang = language;
      root.dir = language === "ar" ? "rtl" : "ltr";
      root.classList.toggle("dark", theme === "dark");
    }
  }, [language, theme]);
  return null;
}

function RemindersMount() {
  useReminders();
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LangSync />
      <RemindersMount />
      <Outlet />
      <AmbientZikr />
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
