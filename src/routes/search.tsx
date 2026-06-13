import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Search, X, ArrowRight } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { searchAzkar } from "@/lib/azkar-data";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

function highlight(text: string, q: string) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/15 text-primary rounded px-1">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function SearchPage() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const deferred = useDeferredValue(q);
  const hits = useMemo(() => searchAzkar(deferred), [deferred]);

  return (
    <AppShell>
      <div className="px-6 pt-12 space-y-5 animate-fade-up">
        <header>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {t("search.title")}
          </h1>
        </header>

        <div className="glass-card flex items-center gap-3 rounded-full px-4 py-3 ring-1 ring-black/5">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search.placeholder")}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-muted-foreground hover:text-foreground"
              aria-label="clear"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {q.trim().length < 2 ? (
          <p className="text-center text-sm text-muted-foreground pt-12">
            {t("search.hint")}
          </p>
        ) : hits.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground pt-12">
            {t("search.empty")}
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground px-1 arabic-nums">
              {t("search.results")} · {hits.length}
            </p>
            {hits.slice(0, 50).map((h, i) => (
              <Link
                key={`${h.categoryId}-${h.zikr.id}-${i}`}
                to="/azkar/$category"
                params={{ category: h.categoryId }}
                className="glass-card block rounded-2xl p-4 ring-1 ring-black/5 active:scale-[0.99] transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-primary">
                    {t(`categories.${h.categoryId}`)}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground rtl:rotate-180" />
                </div>
                <p
                  className="font-body leading-loose text-ink line-clamp-3"
                  style={{ fontSize: "0.95rem" }}
                >
                  {highlight(h.zikr.text, deferred)}
                </p>
                {h.zikr.reference && (
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {h.zikr.reference}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
