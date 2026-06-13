import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Sun,
  Moon,
  BedDouble,
  Sunrise,
  Sparkles,
  Plane,
  Utensils,
  Compass,
  Clock,
  CircleDot,
  ChevronLeft,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AZKAR, CATEGORY_ORDER } from "@/lib/azkar-data";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const ICONS = { Sun, Moon, BedDouble, Sunrise, Sparkles, Plane, Utensils };

const TINTS: Record<string, string> = {
  morning: "bg-amber-100/70 ring-amber-200/60 text-amber-700",
  evening: "bg-indigo-100/70 ring-indigo-200/60 text-indigo-700",
  sleep: "bg-violet-100/70 ring-violet-200/60 text-violet-700",
  wakeup: "bg-rose-100/70 ring-rose-200/60 text-rose-700",
  prayer: "bg-sky-100/80 ring-sky-200/60 text-sky-700",
  travel: "bg-emerald-100/70 ring-emerald-200/60 text-emerald-700",
  food: "bg-teal-100/70 ring-teal-200/60 text-teal-700",
};

function useGreetingKey() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 20) return "evening";
  return "night";
}

function useNextPrayer() {
  // Static demo schedule; replaced by real calculation later.
  const schedule = useMemo(
    () => [
      { key: "fajr", time: "05:12" },
      { key: "sunrise", time: "06:38" },
      { key: "dhuhr", time: "12:15" },
      { key: "asr", time: "15:42" },
      { key: "maghrib", time: "18:21" },
      { key: "isha", time: "19:48" },
    ],
    [],
  );
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  const minutes = now.getHours() * 60 + now.getMinutes();
  const next =
    schedule.find((p) => {
      const [h, m] = p.time.split(":").map(Number);
      return h * 60 + m > minutes;
    }) || schedule[0];
  const [h, m] = next.time.split(":").map(Number);
  let diff = h * 60 + m - minutes;
  if (diff < 0) diff += 24 * 60;
  const hh = Math.floor(diff / 60);
  const mm = diff % 60;
  return { ...next, remaining: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}` };
}

function HomePage() {
  const { t } = useTranslation();
  const greeting = useGreetingKey();
  const prayer = useNextPrayer();
  const lang = useAppStore((s) => s.language);

  const featuredZikr = AZKAR.morning.azkar[0];
  const ChevronEnd = lang === "ar" ? ChevronLeft : ChevronLeft;
  void ChevronEnd;

  return (
    <AppShell>
      <div className="px-6 pt-12 space-y-7 animate-fade-up">
        {/* Greeting */}
        <header className="space-y-1.5">
          <p className="text-sm text-muted-foreground">{t(`greeting.${greeting}`)}</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            {t("appName")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("tagline")}</p>
        </header>

        {/* Next prayer card */}
        <Link to="/prayer-times" className="block">
          <div className="glass-card relative overflow-hidden rounded-3xl p-5 ring-1 ring-black/5 active:scale-[0.99] transition">
            <div className="absolute -top-10 end-[-30px] size-32 rounded-full bg-primary/15 blur-3xl" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-primary/80">
                  {t("home.nextPrayer")}
                </span>
                <p className="font-display text-2xl font-semibold text-ink arabic-nums">
                  {t(`prayer.${prayer.key}`)} · {prayer.time}
                </p>
              </div>
              <div className="text-end">
                <span className="text-[11px] text-muted-foreground">
                  {t("home.remaining")}
                </span>
                <p className="font-display text-lg font-semibold arabic-nums text-ink">
                  {prayer.remaining}
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* Categories */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="font-display text-base font-semibold text-ink">
              {t("home.sectionAzkar")}
            </h2>
            <Link to="/azkar" className="text-xs font-medium text-primary">
              {t("home.viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {CATEGORY_ORDER.slice(0, 4).map((cid) => {
              const cat = AZKAR[cid];
              const Icon = ICONS[cat.icon as keyof typeof ICONS] ?? Sparkles;
              return (
                <Link
                  key={cid}
                  to="/azkar/$category"
                  params={{ category: cid }}
                  className="glass-card flex flex-col gap-3 rounded-3xl p-4 ring-1 ring-black/5 active:scale-[0.98] transition"
                >
                  <span
                    className={
                      "flex size-11 items-center justify-center rounded-full ring-1 " +
                      (TINTS[cid] ?? "bg-sky-100 ring-sky-200 text-sky-700")
                    }
                  >
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-ink">
                      {t(`categories.${cid}`)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 arabic-nums">
                      {cat.azkar.length} ذكراً
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Tools */}
        <section className="space-y-3">
          <h2 className="font-display text-base font-semibold text-ink px-1">
            {t("home.sectionTools")}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <Link
              to="/tasbeeh"
              className="glass-card flex flex-col items-center gap-2 rounded-3xl py-4 ring-1 ring-black/5 active:scale-[0.98] transition"
            >
              <CircleDot className="size-5 text-primary" />
              <span className="text-[11px] font-medium">{t("tabs.tasbeeh")}</span>
            </Link>
            <Link
              to="/qibla"
              className="glass-card flex flex-col items-center gap-2 rounded-3xl py-4 ring-1 ring-black/5 active:scale-[0.98] transition"
            >
              <Compass className="size-5 text-primary" />
              <span className="text-[11px] font-medium">{t("tabs.qibla")}</span>
            </Link>
            <Link
              to="/prayer-times"
              className="glass-card flex flex-col items-center gap-2 rounded-3xl py-4 ring-1 ring-black/5 active:scale-[0.98] transition"
            >
              <Clock className="size-5 text-primary" />
              <span className="text-[11px] font-medium">{t("prayer.title")}</span>
            </Link>
          </div>
        </section>

        {/* Current reading */}
        <section className="space-y-3">
          <h2 className="font-display text-base font-semibold text-ink px-1">
            {t("home.currentReading")}
          </h2>
          <Link to="/azkar/$category" params={{ category: "morning" }}>
            <div className="glass-card rounded-3xl p-6 ring-1 ring-black/5 text-center space-y-4 active:scale-[0.99] transition">
              <p
                className="font-body leading-loose text-ink"
                style={{ fontSize: "1.15rem" }}
              >
                {featuredZikr.text}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t("categories.morning")}
              </p>
            </div>
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
