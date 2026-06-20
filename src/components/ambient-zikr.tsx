import { useEffect, useMemo, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { AZKAR } from "@/lib/azkar-data";
import { useAppStore } from "@/lib/store";

interface Pick {
  text: string;
  reference?: string;
  category: string;
}

function buildPool(): Pick[] {
  const pool: Pick[] = [];
  for (const cat of Object.values(AZKAR)) {
    for (const z of cat.azkar) {
      // keep only short, tweet-sized azkar so the bubble stays calm
      if (z.text.length <= 110) {
        pool.push({ text: z.text, reference: z.reference, category: cat.id });
      }
    }
  }
  return pool;
}

export function AmbientZikr() {
  const enabled = useAppStore((s) => s.ambientEnabled);
  const intervalMin = useAppStore((s) => s.ambientIntervalMin);
  const [pick, setPick] = useState<Pick | null>(null);
  const [visible, setVisible] = useState(false);

  const pool = useMemo(buildPool, []);

  useEffect(() => {
    if (!enabled || pool.length === 0) {
      setVisible(false);
      setPick(null);
      return;
    }
    let showTimer: number | undefined;
    let hideTimer: number | undefined;

    const showOne = () => {
      const next = pool[Math.floor(Math.random() * pool.length)];
      setPick(next);
      setVisible(true);
      hideTimer = window.setTimeout(() => setVisible(false), 9000);
      showTimer = window.setTimeout(showOne, intervalMin * 60 * 1000);
    };

    // first appearance: small delay after mount
    showTimer = window.setTimeout(showOne, 25_000);

    return () => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [enabled, intervalMin, pool]);

  if (!enabled || !pick) return null;

  return (
    <div
      aria-live="polite"
      className={
        "pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 transition-all duration-700 ease-out " +
        (visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none")
      }
    >
      <div className="pointer-events-auto glass-card relative max-w-sm w-full rounded-3xl px-5 py-4 ring-1 ring-black/5 shadow-xl">
        <div className="absolute -top-6 -end-6 size-24 rounded-full bg-primary/15 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-body leading-loose text-ink text-[15px]">{pick.text}</p>
            {pick.reference && (
              <p className="mt-1.5 text-[11px] text-muted-foreground arabic-nums">
                {pick.reference}
              </p>
            )}
          </div>
          <button
            onClick={() => setVisible(false)}
            aria-label="إغلاق"
            className="shrink-0 -me-1 -mt-1 flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted active:scale-95 transition"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
