import { useAppStore } from "@/lib/store";
import { getStageProgress, TREE_STAGES } from "@/lib/tree-stages";

export function HasanatTree({ compact = false }: { compact?: boolean }) {
  const xp = useAppStore((s) => s.treeXp);
  const { stage, pct, toNext } = getStageProgress(xp);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-3xl leading-none animate-pulse-soft">{stage.emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">شجرة الحسنات</p>
          <p className="font-display text-sm font-semibold text-ink truncate">{stage.name}</p>
        </div>
        <p className="font-display text-sm font-semibold arabic-nums text-primary">{xp}</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-6 ring-1 ring-black/5 text-center space-y-4">
      <div className="text-7xl leading-none animate-pulse-soft">{stage.emoji}</div>
      <div className="space-y-1">
        <p className="font-display text-xl font-semibold text-ink">{stage.name}</p>
        <p className="text-xs text-muted-foreground arabic-nums">
          {xp} حسنة · المرحلة {stage.level + 1} من {TREE_STAGES.length}
        </p>
      </div>
      <div className="space-y-1.5">
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-sky-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        {stage.next ? (
          <p className="text-[11px] text-muted-foreground arabic-nums">
            {toNext} حسنة للمرحلة التالية
          </p>
        ) : (
          <p className="text-[11px] text-primary">وصلت لأعلى مرحلة — تقبل الله 🌷</p>
        )}
      </div>
    </div>
  );
}
