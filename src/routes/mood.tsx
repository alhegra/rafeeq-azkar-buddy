import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { MOODS, MOOD_RECOMMENDATIONS, type Mood } from "@/lib/mood-engine";
import { speak } from "@/lib/speech";

export const Route = createFileRoute("/mood")({
  component: MoodPage,
});

function MoodPage() {
  const [mood, setMood] = useState<Mood | null>(null);

  return (
    <AppShell>
      <PageHeader title="ماذا أقول الآن؟" subtitle="اختر شعورك لاقتراح الأذكار المناسبة" />
      <div className="px-6 pb-6 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              className={
                "glass-card rounded-3xl py-4 flex flex-col items-center gap-2 ring-1 transition active:scale-95 " +
                (mood === m.id ? "ring-primary bg-primary/10" : "ring-black/5")
              }
            >
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-xs font-semibold">{m.label}</span>
            </button>
          ))}
        </div>

        {mood && (
          <div className="space-y-3 animate-fade-up">
            <h2 className="font-display text-base font-semibold text-ink px-1">
              مقترحات مناسبة
            </h2>
            {MOOD_RECOMMENDATIONS[mood].map((r, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 ring-1 ring-black/5 space-y-3">
                <p className="font-body text-ink leading-loose text-center" style={{ fontSize: "1.05rem" }}>
                  {r.arabic}
                </p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">
                    {r.kind === "ayah" ? "آية" : r.kind === "dua" ? "دعاء" : "ذكر"}
                  </span>
                  {r.ref && <span className="text-muted-foreground">{r.ref}</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(r.arabic);
                      toast.success("تم النسخ");
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-secondary py-2 text-xs font-medium active:scale-95"
                  >
                    <Copy className="size-3.5" /> نسخ
                  </button>
                  <button
                    onClick={() => speak(r.arabic)}
                    className="flex-1 rounded-full bg-primary py-2 text-xs font-medium text-primary-foreground active:scale-95"
                  >
                    استمع
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
