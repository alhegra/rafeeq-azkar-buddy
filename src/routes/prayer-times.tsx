import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Sunrise, Sun, Sunset, Moon, CloudSun, MoonStar } from "lucide-react";

export const Route = createFileRoute("/prayer-times")({
  component: PrayerTimesPage,
});

// Simplified prayer-time approximations for MVP; replace with a precise
// astronomical library in a later iteration.
function computeTimes(lat: number, lng: number, date = new Date()) {
  void lat;
  void lng;
  // Returns approximate static times — placeholder until real algorithm.
  const _ = date.getDate();
  void _;
  return {
    fajr: "05:12",
    sunrise: "06:38",
    dhuhr: "12:15",
    asr: "15:42",
    maghrib: "18:21",
    isha: "19:48",
  };
}

const ICONS = {
  fajr: MoonStar,
  sunrise: Sunrise,
  dhuhr: Sun,
  asr: CloudSun,
  maghrib: Sunset,
  isha: Moon,
};

function PrayerTimesPage() {
  const { t } = useTranslation();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => setCoords({ lat: 24.7136, lng: 46.6753 }),
        { timeout: 8000 },
      );
    } else {
      setCoords({ lat: 24.7136, lng: 46.6753 });
    }
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const times = useMemo(
    () => (coords ? computeTimes(coords.lat, coords.lng) : null),
    [coords],
  );

  const order = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;

  const next = useMemo(() => {
    if (!times) return null;
    const minutes = now.getHours() * 60 + now.getMinutes();
    return (
      order.find((k) => {
        const [h, m] = times[k].split(":").map(Number);
        return h * 60 + m > minutes;
      }) ?? "fajr"
    );
  }, [times, now]);

  return (
    <AppShell>
      <div className="px-6 pt-10 space-y-6 animate-fade-up">
        <header className="text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {t("prayer.title")}
          </h1>
          {coords && (
            <p className="text-xs text-muted-foreground mt-1 arabic-nums">
              {coords.lat.toFixed(2)}, {coords.lng.toFixed(2)}
            </p>
          )}
        </header>

        {!times ? (
          <p className="text-center text-sm text-muted-foreground">
            {t("prayer.locating")}
          </p>
        ) : (
          <div className="space-y-3">
            {order.map((key) => {
              const Icon = ICONS[key];
              const isNext = next === key;
              return (
                <div
                  key={key}
                  className={
                    "rounded-2xl p-4 ring-1 flex items-center gap-4 transition " +
                    (isNext
                      ? "bg-primary text-primary-foreground ring-primary shadow-lg shadow-primary/20"
                      : "glass-card ring-black/5")
                  }
                >
                  <span
                    className={
                      "flex size-10 items-center justify-center rounded-full " +
                      (isNext ? "bg-white/15" : "bg-primary/10 text-primary")
                    }
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="flex-1">
                    <p className="font-display text-base font-semibold">
                      {t(`prayer.${key}`)}
                    </p>
                    {isNext && (
                      <p className="text-[11px] opacity-80">
                        {t("home.nextPrayer")}
                      </p>
                    )}
                  </div>
                  <p className="font-display text-lg font-semibold arabic-nums">
                    {times[key]}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
