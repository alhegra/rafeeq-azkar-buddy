import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Navigation } from "lucide-react";

export const Route = createFileRoute("/qibla")({
  component: QiblaPage,
});

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function qiblaBearing(lat: number, lng: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA_LAT);
  const Δλ = toRad(KAABA_LNG - lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function QiblaPage() {
  const { t } = useTranslation();
  const [heading, setHeading] = useState<number | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permGranted, setPermGranted] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError(t("qibla.unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords({ lat: 24.7136, lng: 46.6753 }), // fallback: Riyadh
      { timeout: 8000 },
    );
  }, [t]);

  const bearing = coords ? qiblaBearing(coords.lat, coords.lng) : 0;
  const rotation = heading != null ? bearing - heading : bearing;

  const enableCompass = async () => {
    try {
      const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } })
        .DeviceOrientationEvent;
      if (DOE?.requestPermission) {
        const res = await DOE.requestPermission();
        if (res !== "granted") {
          setError(t("qibla.unsupported"));
          return;
        }
      }
      window.addEventListener(
        "deviceorientationabsolute" as unknown as "deviceorientation",
        ((e: DeviceOrientationEvent) => {
          const alpha = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading ?? (e.alpha != null ? 360 - e.alpha : null);
          if (alpha != null) setHeading(alpha);
        }) as EventListener,
        true,
      );
      window.addEventListener(
        "deviceorientation",
        ((e: DeviceOrientationEvent) => {
          const alpha = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading ?? (e.alpha != null ? 360 - e.alpha : null);
          if (alpha != null) setHeading(alpha);
        }) as EventListener,
        true,
      );
      setPermGranted(true);
    } catch {
      setError(t("qibla.unsupported"));
    }
  };

  return (
    <AppShell>
      <div className="px-6 pt-10 space-y-6 animate-fade-up">
        <header className="text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">{t("qibla.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("qibla.toMakkah")}</p>
        </header>

        <div className="glass-card rounded-[36px] p-8 ring-1 ring-black/5 flex flex-col items-center gap-6">
          <div className="relative size-64">
            {/* Compass dial */}
            <div
              className="absolute inset-0 rounded-full border-2 border-primary/20 bg-gradient-to-br from-sky-50 to-white dark:from-sky-950/40 dark:to-slate-900 transition-transform duration-300"
              style={{ transform: `rotate(${-((heading ?? 0))}deg)` }}
            >
              {["N", "E", "S", "W"].map((d, i) => (
                <span
                  key={d}
                  className="absolute left-1/2 top-3 -translate-x-1/2 text-xs font-bold text-muted-foreground"
                  style={{ transform: `rotate(${i * 90}deg) translateY(0)`, transformOrigin: "50% 124px" }}
                >
                  {d}
                </span>
              ))}
            </div>
            {/* Qibla arrow */}
            <div
              className="absolute inset-0 flex items-start justify-center transition-transform duration-500 ease-out"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="flex flex-col items-center mt-2">
                <Navigation className="size-10 fill-primary text-primary drop-shadow-md" />
              </div>
            </div>
            {/* Center kaaba */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-lg">
                <span className="text-[10px] font-bold text-amber-300">الكعبة</span>
              </div>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="font-display text-3xl font-semibold text-primary arabic-nums">
              {Math.round(bearing)}°
            </p>
            {!permGranted ? (
              <button
                onClick={enableCompass}
                className="mt-3 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium active:scale-95"
              >
                {t("qibla.permission")}
              </button>
            ) : (
              <p className="text-xs text-muted-foreground">{t("qibla.calibrate")}</p>
            )}
          </div>
        </div>

        {coords && (
          <div className="glass-card rounded-2xl p-4 ring-1 ring-black/5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {t("qibla.location")}
            </p>
            <p className="text-sm font-medium text-ink arabic-nums mt-1">
              {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
            </p>
          </div>
        )}

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}
      </div>
    </AppShell>
  );
}
