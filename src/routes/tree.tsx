import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { HasanatTree } from "@/components/hasanat-tree";
import { useAppStore } from "@/lib/store";
import { TREE_STAGES, getTreeStage } from "@/lib/tree-stages";
import { CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/tree")({
  component: TreePage,
});

function TreePage() {
  const xp = useAppStore((s) => s.treeXp);
  const cur = getTreeStage(xp);

  return (
    <AppShell>
      <PageHeader title="شجرة الحسنات" subtitle="تنمو شجرتك بكل ذكر" />
      <div className="px-6 pb-6 space-y-5">
        <HasanatTree />

        <div className="glass-card rounded-3xl p-5 ring-1 ring-black/5 space-y-3">
          <p className="font-display text-sm font-bold text-ink">المراحل</p>
          <div className="space-y-2">
            {TREE_STAGES.map((s) => {
              const done = xp >= s.min;
              const active = s.level === cur.level;
              return (
                <div
                  key={s.level}
                  className={
                    "flex items-center gap-3 rounded-2xl p-3 ring-1 " +
                    (active ? "bg-primary/5 ring-primary/30" : "ring-black/5")
                  }
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <div className="flex-1">
                    <p className="font-display text-sm font-semibold text-ink">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground arabic-nums">
                      من {s.min} حسنة
                    </p>
                  </div>
                  {done ? (
                    <CheckCircle2 className="size-5 text-primary" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Link
          to="/tasbeeh"
          className="block rounded-full bg-primary py-3.5 text-center text-sm font-semibold text-primary-foreground active:scale-95"
        >
          ابدأ التسبيح لتنمو شجرتك
        </Link>
      </div>
    </AppShell>
  );
}
