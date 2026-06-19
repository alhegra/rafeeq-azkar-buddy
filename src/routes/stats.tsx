import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Flame, BookOpen, CircleDot, TrendingUp, Calendar, Heart } from "lucide-react";
import { useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { useAppStore, type DailyStat } from "@/lib/store";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
  head: () => ({
    meta: [
      { title: "الإحصائيات — رفيق أذكار" },
      { name: "description", content: "تابع تقدمك اليومي والأسبوعي مع رفيق أذكار" },
    ],
  }),
});

function lastNDates(n: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function computeStreak(stats: DailyStat[]) {
  const set = new Set(
    stats
      .filter((s) => (s.tasbeehCount ?? 0) + (s.azkarRead ?? 0) > 0)
      .map((s) => s.date),
  );
  let streak = 0;
  const today = new Date();
  // Allow today to be missing (still count from yesterday)
  let i = 0;
  // If today has activity, start from today, else start from yesterday
  if (!set.has(today.toISOString().slice(0, 10))) i = 1;
  while (true) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (set.has(key)) {
      streak++;
      i++;
    } else break;
  }
  return streak;
}

function StatsPage() {
  const { t } = useTranslation();
  const stats = useAppStore((s) => s.stats);
  const tasbeehTotal = useAppStore((s) => s.tasbeehTotal);
  const tasbeehCount = useAppStore((s) => s.tasbeehCount);
  const tasbeehGoal = useAppStore((s) => s.tasbeehGoal);
  const favoritesLen = useAppStore((s) => s.favorites.length);

  const week = useMemo(() => lastNDates(7), []);
  const byDate = useMemo(() => {
    const m: Record<string, DailyStat> = {};
    for (const s of stats) m[s.date] = s;
    return m;
  }, [stats]);

  const weekData = week.map((d) => ({
    date: d,
    tasbeeh: byDate[d]?.tasbeehCount ?? 0,
    azkar: byDate[d]?.azkarRead ?? 0,
  }));

  const weekTotal = weekData.reduce(
    (a, x) => ({ tasbeeh: a.tasbeeh + x.tasbeeh, azkar: a.azkar + x.azkar }),
    { tasbeeh: 0, azkar: 0 },
  );

  const max = Math.max(1, ...weekData.map((d) => d.tasbeeh + d.azkar));
  const streak = useMemo(() => computeStreak(stats), [stats]);

  const today = new Date().toISOString().slice(0, 10);
  const todayStat = byDate[today];
  const goalPct = Math.min(100, (tasbeehCount / tasbeehGoal) * 100);

  return (
    <AppShell>
      <div className="px-5 pt-10 pb-4 space-y-6 animate-fade-up">
        <header className="text-center space-y-1">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-sky-100/80 ring-1 ring-sky-200/60">
            <TrendingUp className="size-6 text-sky-600" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {t("stats.title")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("stats.subtitle")}
          </p>
        </header>

        {/* Streak card */}
        <div className="glass-card relative overflow-hidden rounded-3xl p-5 ring-1 ring-black/5">
          <div className="absolute -end-6 -top-6 size-32 rounded-full bg-orange-200/40 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-orange-600/80 font-medium">
                {t("stats.streak")}
              </p>
              <p className="font-display text-4xl font-semibold text-ink arabic-nums">
                {streak}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("stats.daysInARow")}
              </p>
            </div>
            <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-500 shadow-lg shadow-orange-200/60">
              <Flame className="size-7 text-white" />
            </div>
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-3 gap-3">
          <KpiCard
            icon={<CircleDot className="size-4" />}
            label={t("stats.tasbeehTotal")}
            value={tasbeehTotal}
            tint="bg-sky-100/70 text-sky-700"
          />
          <KpiCard
            icon={<BookOpen className="size-4" />}
            label={t("stats.azkarToday")}
            value={todayStat?.azkarRead ?? 0}
            tint="bg-emerald-100/70 text-emerald-700"
          />
          <KpiCard
            icon={<Heart className="size-4" />}
            label={t("stats.favorites")}
            value={favoritesLen}
            tint="bg-rose-100/70 text-rose-700"
          />
        </div>

        {/* Today goal */}
        <div className="glass-card rounded-2xl p-4 ring-1 ring-black/5 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">
              {t("stats.dailyGoal")}
            </p>
            <p className="text-xs text-muted-foreground arabic-nums">
              {tasbeehCount} / {tasbeehGoal}
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-sky-400 transition-all"
              style={{ width: `${goalPct}%` }}
            />
          </div>
        </div>

        {/* Weekly chart */}
        <div className="glass-card rounded-3xl p-5 ring-1 ring-black/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              <p className="text-sm font-semibold text-ink">
                {t("stats.lastSeven")}
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground arabic-nums">
              {weekTotal.tasbeeh + weekTotal.azkar} {t("stats.actions")}
            </p>
          </div>
          <div className="flex h-32 items-end justify-between gap-1.5">
            {weekData.map((d) => {
              const total = d.tasbeeh + d.azkar;
              const h = Math.max(4, (total / max) * 100);
              const dayNames = ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];
              const wd = new Date(d.date).getDay();
              const isToday = d.date === today;
              return (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex w-full flex-1 items-end overflow-hidden rounded-md bg-muted/50">
                    <div
                      className={
                        "w-full rounded-md transition-all " +
                        (isToday
                          ? "bg-gradient-to-t from-primary to-sky-300"
                          : "bg-gradient-to-t from-sky-300/70 to-sky-200/70")
                      }
                      style={{ height: `${h}%` }}
                      title={`${total}`}
                    />
                  </div>
                  <span
                    className={
                      "text-[9px] " +
                      (isToday ? "font-semibold text-primary" : "text-muted-foreground")
                    }
                  >
                    {dayNames[wd]}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-around pt-2 text-[11px]">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full bg-primary" />
              {t("stats.tasbeeh")}: <span className="arabic-nums font-medium text-ink">{weekTotal.tasbeeh}</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full bg-emerald-400" />
              {t("stats.azkar")}: <span className="arabic-nums font-medium text-ink">{weekTotal.azkar}</span>
            </span>
          </div>
        </div>

        <Link
          to="/favorites"
          className="glass-card flex items-center justify-between rounded-2xl p-4 ring-1 ring-black/5 active:scale-[0.99] transition"
        >
          <span className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-rose-100/70 text-rose-500">
              <Heart className="size-4" />
            </span>
            <span className="text-sm font-medium text-ink">{t("favorites.title")}</span>
          </span>
          <span className="text-xs text-muted-foreground arabic-nums">{favoritesLen}</span>
        </Link>
      </div>
    </AppShell>
  );
}

function KpiCard({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tint: string;
}) {
  return (
    <div className="glass-card flex flex-col items-start gap-2 rounded-2xl p-3 ring-1 ring-black/5">
      <span className={"flex size-8 items-center justify-center rounded-full " + tint}>
        {icon}
      </span>
      <p className="font-display text-xl font-semibold text-ink arabic-nums leading-none">
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}
