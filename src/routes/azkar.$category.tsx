import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Heart,
  Copy,
  Share2,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Minus,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AZKAR } from "@/lib/azkar-data";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/azkar/$category")({
  component: AzkarReader,
});

function AzkarReader() {
  const { category } = Route.useParams();
  const cat = AZKAR[category];
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useAppStore((s) => s.language);
  const fontSize = useAppStore((s) => s.fontSize);
  const setFontSize = useAppStore((s) => s.setFontSize);
  const isFavorite = useAppStore((s) => s.isFavorite);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const incrementZikr = useAppStore((s) => s.incrementZikr);
  const getZikrCount = useAppStore((s) => s.getZikrCount);
  const resetCategory = useAppStore((s) => s.resetCategory);

  const [idx, setIdx] = useState(0);

  if (!cat) {
    return (
      <AppShell>
        <div className="px-6 pt-16 text-center">
          <p>القسم غير موجود</p>
          <Link to="/azkar" className="text-primary mt-4 inline-block">
            عودة للأذكار
          </Link>
        </div>
      </AppShell>
    );
  }

  const zikr = cat.azkar[idx];
  const favId = `${cat.id}:${zikr.id}`;
  const count = getZikrCount(cat.id, zikr.id);
  const isDone = count >= zikr.count;
  const progress = Math.min(100, (count / zikr.count) * 100);
  const isFav = isFavorite(favId);

  const handleTap = () => {
    if (isDone) return;
    incrementZikr(cat.id, zikr.id);
    if (useAppStore.getState().vibration && typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(15);
    }
    if (count + 1 >= zikr.count) {
      setTimeout(() => {
        if (idx < cat.azkar.length - 1) setIdx(idx + 1);
        else toast.success(t("reading.completed"));
      }, 300);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(zikr.text);
      toast.success(t("reading.copied"));
    } catch {
      /* ignore */
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ text: zikr.text, title: t("appName") });
      } catch {
        /* ignore */
      }
    } else handleCopy();
  };

  const Prev = lang === "ar" ? ChevronRight : ChevronLeft;
  const Next = lang === "ar" ? ChevronLeft : ChevronRight;

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4 space-y-5 animate-fade-up">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.history.back()}
            className="glass-card flex size-10 items-center justify-center rounded-full ring-1 ring-black/5 active:scale-95"
          >
            <Prev className="size-5 text-ink" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="font-display text-lg font-semibold text-ink leading-tight">
              {t(`categories.${cat.id}`)}
            </h1>
            <p className="text-[11px] text-muted-foreground arabic-nums mt-0.5">
              {idx + 1} {t("reading.of")} {cat.azkar.length}
            </p>
          </div>
          <button
            onClick={() => {
              resetCategory(cat.id);
              setIdx(0);
              toast(t("reading.reset"));
            }}
            className="glass-card flex size-10 items-center justify-center rounded-full ring-1 ring-black/5 active:scale-95"
            aria-label="reset"
          >
            <RotateCcw className="size-4 text-ink" />
          </button>
        </div>

        {/* Progress bar (overall) */}
        <div className="px-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((idx + (isDone ? 1 : 0)) / cat.azkar.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div
          onClick={handleTap}
          className="glass-card rounded-[28px] p-7 ring-1 ring-black/5 select-none cursor-pointer transition active:scale-[0.99]"
        >
          <p
            className="font-body leading-loose text-ink text-center"
            style={{ fontSize: `${fontSize}px` }}
          >
            {zikr.text}
          </p>
          {lang === "en" && zikr.translation?.en && (
            <p className="mt-4 text-sm text-muted-foreground text-center leading-relaxed">
              {zikr.translation.en}
            </p>
          )}
          {zikr.reference && (
            <p className="mt-4 text-[11px] text-muted-foreground/80 text-center">
              {zikr.reference}
            </p>
          )}

          {/* Counter */}
          <div className="mt-7 flex flex-col items-center gap-3">
            <div className="relative">
              <div className={"absolute inset-0 rounded-full bg-primary/15 " + (!isDone ? "animate-pulse-soft" : "")} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTap();
                }}
                disabled={isDone}
                className="relative flex size-28 flex-col items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-[6px] ring-white/70 dark:ring-white/10 active:scale-90 transition disabled:bg-emerald-500"
              >
                <span className="font-display text-3xl font-semibold arabic-nums">
                  {count}
                </span>
                <span className="text-[10px] opacity-75 mt-0.5 arabic-nums">
                  / {zikr.count}
                </span>
              </button>
            </div>
            <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary/70 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-4 gap-2.5 px-1">
          <ActionBtn
            active={isFav}
            onClick={() => toggleFavorite(favId)}
            icon={<Heart className={"size-4 " + (isFav ? "fill-current" : "")} />}
            label={t("reading.favorite")}
          />
          <ActionBtn onClick={handleCopy} icon={<Copy className="size-4" />} label={t("reading.copy")} />
          <ActionBtn onClick={handleShare} icon={<Share2 className="size-4" />} label={t("reading.share")} />
          <ActionBtn
            onClick={() => setFontSize(fontSize >= 30 ? 18 : fontSize + 2)}
            icon={
              <span className="flex items-center gap-0.5">
                <Minus className="size-3" />
                <Plus className="size-3" />
              </span>
            }
            label={t("reading.fontSize")}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            disabled={idx === 0}
            onClick={() => setIdx(Math.max(0, idx - 1))}
            className="glass-card flex flex-1 items-center justify-center gap-2 rounded-full py-3 ring-1 ring-black/5 active:scale-95 disabled:opacity-40"
          >
            <Prev className="size-4" />
            <span className="text-sm font-medium">{t("common.prev")}</span>
          </button>
          <button
            disabled={idx === cat.azkar.length - 1}
            onClick={() => setIdx(Math.min(cat.azkar.length - 1, idx + 1))}
            className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 bg-primary text-primary-foreground shadow-md active:scale-95 disabled:opacity-50"
          >
            <span className="text-sm font-medium">{t("common.next")}</span>
            <Next className="size-4" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "glass-card flex flex-col items-center gap-1 rounded-2xl py-3 ring-1 ring-black/5 active:scale-95 transition " +
        (active ? "text-rose-500" : "text-ink")
      }
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
