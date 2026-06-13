import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Sun, Moon, BedDouble, Sunrise, Sparkles, Plane, Utensils,
  Heart, Shield, Building2, Search, ChevronLeft,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AZKAR, CATEGORY_ORDER } from "@/lib/azkar-data";

export const Route = createFileRoute("/azkar/")({
  component: AzkarIndex,
});

const ICONS = { Sun, Moon, BedDouble, Sunrise, Sparkles, Plane, Utensils, Heart, Shield, Building2 };
const TINTS: Record<string, string> = {
  morning: "bg-amber-100/70 text-amber-700",
  evening: "bg-indigo-100/70 text-indigo-700",
  sleep: "bg-violet-100/70 text-violet-700",
  wakeup: "bg-rose-100/70 text-rose-700",
  prayer: "bg-sky-100/80 text-sky-700",
  istighfar: "bg-pink-100/70 text-pink-700",
  ruqyah: "bg-emerald-100/70 text-emerald-700",
  mosque: "bg-blue-100/70 text-blue-700",
  travel: "bg-teal-100/70 text-teal-700",
  food: "bg-orange-100/70 text-orange-700",
};

function AzkarIndex() {
  const { t } = useTranslation();
  return (
    <AppShell>
      <div className="px-6 pt-12 space-y-6 animate-fade-up">
        <header>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {t("home.sectionAzkar")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("tagline")}</p>
        </header>

        <Link
          to="/search"
          className="glass-card flex items-center gap-3 rounded-full px-5 py-3.5 ring-1 ring-black/5 text-muted-foreground active:scale-[0.99] transition"
        >
          <Search className="size-4" />
          <span className="text-sm">{t("search.placeholder")}</span>
        </Link>

        <div className="space-y-3">
          {CATEGORY_ORDER.map((cid) => {
            const cat = AZKAR[cid];
            const Icon = ICONS[cat.icon as keyof typeof ICONS] ?? Sparkles;
            return (
              <Link
                key={cid}
                to="/azkar/$category"
                params={{ category: cid }}
                className="glass-card flex items-center gap-4 rounded-2xl p-4 ring-1 ring-black/5 active:scale-[0.99] transition"
              >
                <span
                  className={
                    "flex size-12 shrink-0 items-center justify-center rounded-full " +
                    (TINTS[cid] ?? "bg-sky-100 text-sky-700")
                  }
                >
                  <Icon className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="font-display text-base font-semibold text-ink">
                    {t(`categories.${cid}`)}
                  </p>
                  <p className="text-xs text-muted-foreground arabic-nums">
                    {cat.azkar.length} ذكراً
                  </p>
                </div>
                <ChevronLeft className="size-5 text-muted-foreground rtl:rotate-0 ltr:rotate-180" />
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
