import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Target } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useAppStore, type GoalPeriod } from "@/lib/store";
import { QUICK_AZKAR } from "@/lib/quick-azkar";

export const Route = createFileRoute("/goals")({
  component: GoalsPage,
});

function GoalsPage() {
  const goals = useAppStore((s) => s.goals);
  const addGoal = useAppStore((s) => s.addGoal);
  const removeGoal = useAppStore((s) => s.removeGoal);
  const getPeriodCount = useAppStore((s) => s.getPeriodCount);

  const [zikrId, setZikrId] = useState<string>("istighfar");
  const [target, setTarget] = useState<number>(100);
  const [period, setPeriod] = useState<GoalPeriod>("daily");

  const submit = () => {
    const zikr = QUICK_AZKAR.find((q) => q.id === zikrId);
    const label = zikrId === "tasbeeh" ? "المسبحة" : zikr?.label || "ذكر";
    addGoal({ zikrId, label, target: Math.max(1, target), period });
  };

  return (
    <AppShell>
      <PageHeader title="أهدافي" subtitle="حدد أهدافاً يومية أو أسبوعية للذكر" />
      <div className="px-6 pb-6 space-y-5">
        {/* Create */}
        <div className="glass-card rounded-3xl p-5 ring-1 ring-black/5 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Target className="size-4" />
            <span className="text-sm font-semibold">هدف جديد</span>
          </div>
          <select
            value={zikrId}
            onChange={(e) => setZikrId(e.target.value)}
            className="w-full rounded-xl bg-secondary px-4 py-3 text-sm"
          >
            <option value="tasbeeh">المسبحة (أي تسبيح)</option>
            {QUICK_AZKAR.map((q) => (
              <option key={q.id} value={q.id}>{q.label}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min={1}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="rounded-xl bg-secondary px-4 py-3 text-sm arabic-nums text-center"
            />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as GoalPeriod)}
              className="rounded-xl bg-secondary px-4 py-3 text-sm"
            >
              <option value="daily">يومي</option>
              <option value="weekly">أسبوعي</option>
            </select>
          </div>
          <button
            onClick={submit}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus className="size-4" /> إضافة الهدف
          </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          {goals.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              لا توجد أهداف بعد. ابدأ بإضافة هدف.
            </p>
          )}
          {goals.map((g) => {
            const key = g.zikrId === "tasbeeh" ? "tasbeeh" : `quick:${g.zikrId}`;
            // tasbeeh uses "tasbeeh" key; quick azkar would need explicit logging — fallback 0
            const done = g.zikrId === "tasbeeh" ? getPeriodCount("tasbeeh", g.period) : getPeriodCount(key, g.period);
            const pct = Math.min(100, Math.round((done / g.target) * 100));
            return (
              <div key={g.id} className="glass-card rounded-2xl p-4 ring-1 ring-black/5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-ink truncate">{g.label}</p>
                    <p className="text-[11px] text-muted-foreground arabic-nums">
                      {g.period === "daily" ? "يومي" : "أسبوعي"} · الهدف {g.target}
                    </p>
                  </div>
                  <button
                    onClick={() => removeGoal(g.id)}
                    className="shrink-0 text-rose-500 active:scale-95"
                    aria-label="حذف"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-sky-400" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[11px] text-muted-foreground arabic-nums text-end">
                  {done} / {g.target} · {pct}%
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
