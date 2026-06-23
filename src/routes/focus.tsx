import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, RotateCcw } from "lucide-react";
import { QUICK_AZKAR } from "@/lib/quick-azkar";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/focus")({
  component: FocusPage,
});

function FocusPage() {
  const [idx, setIdx] = useState(0);
  const [count, setCount] = useState(0);
  const inc = useAppStore((s) => s.incrementTasbeeh);
  const vibration = useAppStore((s) => s.vibration);

  const zikr = QUICK_AZKAR[idx];

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      // do not auto-remove; theme controlled elsewhere
    };
  }, []);

  const tap = () => {
    setCount((c) => c + 1);
    inc();
    if (vibration && typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(10);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950 text-white overflow-hidden">
      <div className="absolute inset-0 pattern-bg opacity-10" />

      {/* Top controls */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
        <Link
          to="/"
          className="size-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center active:scale-95"
          aria-label="خروج"
        >
          <X className="size-5" />
        </Link>
        <button
          onClick={() => setCount(0)}
          className="size-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center active:scale-95"
          aria-label="تصفير"
        >
          <RotateCcw className="size-5" />
        </button>
      </div>

      {/* Center zikr */}
      <button
        onClick={tap}
        className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-8 active:bg-white/5 transition"
      >
        <p className="font-display text-4xl sm:text-5xl text-center leading-loose">
          {zikr.text}
        </p>
        <div className="size-32 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
          <span className="font-display text-6xl font-semibold arabic-nums">{count}</span>
        </div>
        <p className="text-xs opacity-60">اضغط في أي مكان لاحتساب التسبيحة</p>
      </button>

      {/* Bottom dots */}
      <div className="absolute bottom-8 inset-x-0 flex justify-center gap-2 z-10">
        {QUICK_AZKAR.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIdx(i);
              setCount(0);
            }}
            className={
              "size-2 rounded-full transition-all " +
              (i === idx ? "bg-white w-6" : "bg-white/30")
            }
            aria-label={`الذكر ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
