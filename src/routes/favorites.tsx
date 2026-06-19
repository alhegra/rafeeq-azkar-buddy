import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Heart, Trash2, BookOpen } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AZKAR } from "@/lib/azkar-data";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
  head: () => ({
    meta: [
      { title: "المفضلة — رفيق أذكار" },
      { name: "description", content: "أذكارك المفضلة المحفوظة محلياً" },
    ],
  }),
});

function FavoritesPage() {
  const { t } = useTranslation();
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);

  const items = favorites
    .map((favId) => {
      const [catId, zId] = favId.split(":");
      const cat = AZKAR[catId];
      const z = cat?.azkar.find((a) => a.id === zId);
      if (!cat || !z) return null;
      return { favId, cat, z };
    })
    .filter(Boolean) as { favId: string; cat: (typeof AZKAR)[string]; z: (typeof AZKAR)[string]["azkar"][number] }[];

  return (
    <AppShell>
      <div className="px-5 pt-10 pb-4 space-y-5 animate-fade-up">
        <header className="text-center space-y-1">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-100/80 ring-1 ring-rose-200/60">
            <Heart className="size-6 text-rose-500 fill-rose-500" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {t("favorites.title")}
          </h1>
          <p className="text-xs text-muted-foreground arabic-nums">
            {items.length} {t("favorites.saved")}
          </p>
        </header>

        {items.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 ring-1 ring-black/5 text-center space-y-3">
            <BookOpen className="mx-auto size-8 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">
              {t("favorites.empty")}
            </p>
            <Link
              to="/azkar"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground active:scale-95"
            >
              {t("favorites.browse")}
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map(({ favId, cat, z }) => (
              <li
                key={favId}
                className="glass-card rounded-2xl p-4 ring-1 ring-black/5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
                    {t(`categories.${cat.id}`)}
                  </span>
                  <button
                    onClick={() => toggleFavorite(favId)}
                    className="text-rose-500 active:scale-90 transition"
                    aria-label="remove"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <Link
                  to="/azkar/$category"
                  params={{ category: cat.id }}
                  className="block"
                >
                  <p className="font-body text-ink leading-loose text-[15px]">
                    {z.text.length > 220 ? z.text.slice(0, 220) + "…" : z.text}
                  </p>
                  {z.reference && (
                    <p className="mt-2 text-[10px] text-muted-foreground/80">
                      {z.reference}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
