import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { RotateCcw, Target } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAppStore } from "@/lib/store";
import { useMemo } from "react";

export const Route = createFileRoute("/tasbeeh")({
  component: TasbeehPage,
});

function TasbeehPage() {
  const { t } = useTranslation();
  const count = useAppStore((s) => s.tasbeehCount);
  const total = useAppStore((s) => s.tasbeehTotal);
  const goal = useAppStore((s) => s.tasbeehGoal);
  const inc = useAppStore((s) => s.incrementTasbeeh);
  const reset = useAppStore((s) => s.resetTasbeeh);
  const setGoal = useAppStore((s) => s.setTasbeehGoal);

  const today = useMemo(() => {
    const d = new Date().toISOString().slice(0, 10);
    return useAppStore.getState().stats.find((s) => s.date === d)?.tasbeehCount ?? 0;
  }, [count]);

  const progress = Math.min(100, (count / goal) * 100);

  const handleTap = () => {
    inc();
    if (useAppStore.getState().vibration && typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(12);
    }
  };

  return (
    <AppShell>
      <div className="px-6 pt-10 space-y-6 animate-fade-up">
        <header className="text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {t("tasbeeh.title")}
          </h1>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label={t("tasbeeh.today")} value={today} />
          <Stat label={t("tasbeeh.lifetime")} value={total} />
          <Stat label={t("tasbeeh.goal")} value={goal} />
        </div>

        {/* Counter ring */}
        <div className="glass-card rounded-[36px] p-8 ring-1 ring-black/5 flex flex-col items-center gap-6">
          <div className="relative size-64">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" className="fill-none stroke-muted" strokeWidth="4" />
              <circle
                cx="50"
                cy="50"
                r="46"
                className="fill-none stroke-primary transition-all duration-500"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(progress / 100) * 289} 289`}
              />
            </svg>
            <button
              onClick={handleTap}
              className="absolute inset-4 rounded-full bg-gradient-to-br from-primary to-sky-500 text-primary-foreground shadow-[0_20px_60px_-15px_rgba(14,165,233,0.6)] active:scale-95 transition flex flex-col items-center justify-center gap-1"
            >
              <span className="font-display text-6xl font-semibold arabic-nums leading-none">
                {count}
              </span>
              <span className="text-xs opacity-80">{t("tasbeeh.tap")}</span>
            </button>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={reset}
              className="glass-card flex-1 flex items-center justify-center gap-2 rounded-full py-3 ring-1 ring-black/5 active:scale-95"
            >
              <RotateCcw className="size-4" />
              <span className="text-sm font-medium">{t("tasbeeh.reset")}</span>
            </button>
            <button
              onClick={() => {
                const next = goal === 33 ? 99 : goal === 99 ? 100 : goal === 100 ? 1000 : 33;
                setGoal(next);
              }}
              className="glass-card flex-1 flex items-center justify-center gap-2 rounded-full py-3 ring-1 ring-black/5 active:scale-95"
            >
              <Target className="size-4" />
              <span className="text-sm font-medium arabic-nums">{goal}</span>
            </button>
          </div>
        </div>

        {/* Phrases helper */}
        <div className="glass-card rounded-2xl p-4 ring-1 ring-black/5 text-center space-y-1">
          <p className="font-body text-lg text-ink leading-relaxed">
            سُبْحَانَ اللَّهِ · الْحَمْدُ لِلَّهِ · اللَّهُ أَكْبَرُ
          </p>
          <p className="text-[11px] text-muted-foreground">
            لا إله إلا الله · لا حول ولا قوة إلا بالله
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card rounded-2xl px-3 py-3 text-center ring-1 ring-black/5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="font-display text-lg font-semibold text-ink arabic-nums mt-0.5">
        {value}
      </p>
    </div>
  );
}
