import { useEffect, useMemo, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { AZKAR } from "@/lib/azkar-data";
import { useAppStore } from "@/lib/store";

interface Pick {
  text: string;
  reference?: string;
}

function buildPool(): Pick[] {
  const pool: Pick[] = [];
  for (const cat of Object.values(AZKAR)) {
    for (const z of cat.azkar) {
      if (z.text.length <= 90) {
        pool.push({ text: z.text, reference: z.reference });
      }
    }
  }
  return pool;
}

function fireOsNotification(text: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (typeof document !== "undefined" && document.visibilityState === "visible") return;
  try {
    new Notification("ذكر لله", {
      body: text,
      icon: "/icon-192.png",
      tag: "ambient-zikr",
      silent: true,
    });
  } catch {
    /* noop */
  }
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
      fireOsNotification(next.text);
      hideTimer = window.setTimeout(() => setVisible(false), 8000);
      showTimer = window.setTimeout(showOne, intervalMin * 60 * 1000);
    };

    showTimer = window.setTimeout(showOne, 20_000);

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
        "fixed z-40 end-3 bottom-24 max-w-[78%] sm:max-w-xs transition-all duration-500 ease-out " +
        (visible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-4 pointer-events-none")
      }
    >
      <div className="glass-card relative rounded-2xl ps-3 pe-2 py-2.5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl bg-background/80">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-3.5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-body leading-snug text-ink text-[13.5px] line-clamp-3">
              {pick.text}
            </p>
            {pick.reference && (
              <p className="mt-1 text-[10px] text-muted-foreground arabic-nums truncate">
                {pick.reference}
              </p>
            )}
          </div>
          <button
            onClick={() => setVisible(false)}
            aria-label="إغلاق"
            className="shrink-0 flex size-6 items-center justify-center rounded-full text-muted-foreground/70 hover:bg-muted active:scale-95 transition"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
