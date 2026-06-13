import { useRouter } from "@tanstack/react-router";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/lib/store";

export function PageHeader({
  title,
  subtitle,
  back = true,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
}) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = useAppStore((s) => s.language);
  const isRtl = lang === "ar";
  const Back = isRtl ? ChevronRight : ChevronLeft;
  void i18n;
  return (
    <header className="flex items-center gap-3 px-6 pt-8 pb-4">
      {back && (
        <button
          onClick={() => router.history.back()}
          className="glass-card flex size-10 items-center justify-center rounded-full ring-1 ring-black/5 active:scale-95 transition"
          aria-label="back"
        >
          <Back className="size-5 text-ink" />
        </button>
      )}
      <div className="flex-1">
        <h1 className="font-display text-xl font-semibold leading-tight text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
