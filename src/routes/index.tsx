import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
  Heart,
  TrendingUp,
  Target,
  HeartHandshake,
  Headphones,
  Flame,
  Maximize2,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAppStore } from "@/lib/store";
import { getHijriDate, getGregorianDate } from "@/lib/hijri";
import { getSmartSuggestions } from "@/lib/smart-suggestions";
import { getActiveOccasions } from "@/lib/occasions";
import { HasanatTree } from "@/components/hasanat-tree";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const SUGG_ICONS: Record<string, typeof Sun> = {
  morning: Sun,
  evening: Moon,
  sleep: BedDouble,
  salawat: Sparkles,
  istighfar: Sunrise,
};

function useGreetingKey() {
  const h = new Date().getHours();
  if (h < 12) return "صباح الخير";
  if (h < 17) return "نهارك مبارك";
  if (h < 20) return "مساء الخير";
  return "ليلة هانئة";
}

function HomePage() {
  const greeting = useGreetingKey();
  const lang = useAppStore((s) => s.language);
  const streak = useAppStore((s) => s.streak);
  const tasbeehToday = useAppStore((s) => s.getDailyCount("tasbeeh"));
  const goal = useAppStore((s) => s.tasbeehGoal);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const suggestions = useMemo(() => getSmartSuggestions(now), [now]);
  const occasions = useMemo(() => getActiveOccasions(now), [now]);
  const hijri = useMemo(() => getHijriDate(now), [now]);
  const greg = useMemo(() => getGregorianDate(now, lang), [now, lang]);

  const dayPct = Math.min(100, Math.round((tasbeehToday / goal) * 100));

  return (
    <AppShell>
      <div className="px-5 pt-10 space-y-6 animate-fade-up">
        {/* Greeting + dates */}
        <header className="space-y-1">
          <p className="text-xs text-muted-foreground">{greeting}</p>
          <h1 className="font-display text-2xl font-bold text-ink leading-tight">
            رفيق الذكر
          </h1>
          <div className="flex flex-wrap gap-x-2 text-[11px] text-muted-foreground arabic-nums">
            <span>{hijri}</span>
            <span>·</span>
            <span>{greg}</span>
          </div>
        </header>

        {/* Occasion banner */}
        {occasions.length > 0 && (
          <div className="space-y-2">
            {occasions.map((o) => (
              <div
                key={o.id}
                className="glass-card rounded-2xl p-4 ring-1 ring-amber-200/50 bg-gradient-to-l from-amber-100/40 to-transparent flex items-center gap-3"
              >
                <span className="text-2xl">{o.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-bold text-ink truncate">{o.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{o.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Today progress + streak */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-3xl p-4 ring-1 ring-black/5">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Target className="size-4" />
              <span className="text-[11px] font-semibold">تقدم اليوم</span>
            </div>
            <p className="font-display text-2xl font-bold arabic-nums text-ink">
              {tasbeehToday}<span className="text-sm text-muted-foreground">/{goal}</span>
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-sky-400 transition-all" style={{ width: `${dayPct}%` }} />
            </div>
          </div>
          <div className="glass-card rounded-3xl p-4 ring-1 ring-black/5">
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <Flame className="size-4" />
              <span className="text-[11px] font-semibold">سلسلة الأيام</span>
            </div>
            <p className="font-display text-2xl font-bold arabic-nums text-ink">
              {streak.current}<span className="text-sm text-muted-foreground"> يوم</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-2 arabic-nums">
              الأطول: {streak.longest}
            </p>
          </div>
        </div>

        {/* Hasanat tree */}
        <Link to="/tree" className="block glass-card rounded-3xl p-4 ring-1 ring-black/5 active:scale-[0.99] transition">
          <HasanatTree compact />
        </Link>

        {/* Smart suggestions */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="font-display text-base font-bold text-ink">مقترحات ذكية</h2>
            <span className="text-[11px] text-muted-foreground">بناء على الوقت</span>
          </div>
          <div className="space-y-2.5">
            {suggestions.map((s) => {
              const Icon = SUGG_ICONS[s.id] ?? Sparkles;
              const linkProps = s.params
                ? { to: s.to as "/azkar/$category", params: s.params }
                : { to: s.to as "/tasbeeh" };
              return (
                <Link
                  key={s.id}
                  {...linkProps}
                  className="glass-card flex items-center gap-3 rounded-2xl p-4 ring-1 ring-black/5 active:scale-[0.99] transition"
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary text-xl">
                    {s.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-bold text-ink truncate">{s.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{s.subtitle}</p>
                  </div>
                  <span className="text-[10px] rounded-full bg-secondary px-2 py-1 text-muted-foreground shrink-0">
                    {s.reason}
                  </span>
                  <Icon className="size-4 text-muted-foreground shrink-0" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Quick access grid */}
        <section className="space-y-3">
          <h2 className="font-display text-base font-bold text-ink px-1">أدواتي</h2>
          <div className="grid grid-cols-4 gap-2.5">
            <Tool to="/tasbeeh" icon={CircleDot} label="المسبحة" tint="bg-sky-100 text-sky-700" />
            <Tool to="/azkar" icon={Sparkles} label="الأذكار" tint="bg-amber-100 text-amber-700" />
            <Tool to="/mood" icon={HeartHandshake} label="شعوري" tint="bg-rose-100 text-rose-600" />
            <Tool to="/audio" icon={Headphones} label="صوتيات" tint="bg-violet-100 text-violet-700" />
            <Tool to="/goals" icon={Target} label="أهدافي" tint="bg-emerald-100 text-emerald-700" />
            <Tool to="/focus" icon={Maximize2} label="تركيز" tint="bg-indigo-100 text-indigo-700" />
            <Tool to="/qibla" icon={Compass} label="القبلة" tint="bg-teal-100 text-teal-700" />
            <Tool to="/prayer-times" icon={Clock} label="الصلاة" tint="bg-sky-100 text-sky-700" />
            <Tool to="/favorites" icon={Heart} label="المفضلة" tint="bg-pink-100 text-pink-600" />
            <Tool to="/stats" icon={TrendingUp} label="إحصائيات" tint="bg-blue-100 text-blue-700" />
            <Tool to="/search" icon={Sparkles} label="بحث" tint="bg-cyan-100 text-cyan-700" />
            <Tool to="/settings" icon={Plane} label="إعدادات" tint="bg-slate-100 text-slate-700" />
          </div>
        </section>

        {/* Categories shortcut */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="font-display text-base font-bold text-ink">فئات الأذكار</h2>
            <Link to="/azkar" className="text-xs font-medium text-primary">عرض الكل</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Cat to="morning" label="أذكار الصباح" icon={<Sun className="size-5" />} tint="bg-amber-100/70 text-amber-700 ring-amber-200/60" />
            <Cat to="evening" label="أذكار المساء" icon={<Moon className="size-5" />} tint="bg-indigo-100/70 text-indigo-700 ring-indigo-200/60" />
            <Cat to="sleep" label="أذكار النوم" icon={<BedDouble className="size-5" />} tint="bg-violet-100/70 text-violet-700 ring-violet-200/60" />
            <Cat to="food" label="أذكار الطعام" icon={<Utensils className="size-5" />} tint="bg-teal-100/70 text-teal-700 ring-teal-200/60" />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Tool({
  to,
  icon: Icon,
  label,
  tint,
}: {
  to: string;
  icon: typeof Sun;
  label: string;
  tint: string;
}) {
  return (
    <Link
      to={to as "/tasbeeh"}
      className="glass-card flex flex-col items-center gap-2 rounded-2xl py-3.5 ring-1 ring-black/5 active:scale-95 transition"
    >
      <span className={"flex size-10 items-center justify-center rounded-full " + tint}>
        <Icon className="size-4" />
      </span>
      <span className="text-[10px] font-semibold leading-tight">{label}</span>
    </Link>
  );
}

function Cat({
  to,
  label,
  icon,
  tint,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  tint: string;
}) {
  return (
    <Link
      to="/azkar/$category"
      params={{ category: to }}
      className="glass-card flex items-center gap-3 rounded-2xl p-4 ring-1 ring-black/5 active:scale-[0.98] transition"
    >
      <span className={"flex size-10 items-center justify-center rounded-full ring-1 " + tint}>
        {icon}
      </span>
      <p className="font-display text-sm font-bold text-ink">{label}</p>
    </Link>
  );
}
