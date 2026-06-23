import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { pushSchedule, type ReminderItem } from "@/lib/reminders-bridge";
import { AZKAR } from "@/lib/azkar-data";
import { QUICK_AZKAR } from "@/lib/quick-azkar";
import { speakArabic } from "@/lib/speech";

function nextOccurrence(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h || 0, m || 0, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

function buildAmbientPicks() {
  const out: { text: string; reference?: string }[] = [];
  for (const cat of Object.values(AZKAR)) {
    for (const z of cat.azkar) {
      if (z.text.length <= 90) out.push({ text: z.text, reference: z.reference });
    }
  }
  return out;
}

export function useReminders() {
  const reminders = useAppStore((s) => s.reminders);
  const ambientEnabled = useAppStore((s) => s.ambientEnabled);
  const ambientIntervalMin = useAppStore((s) => s.ambientIntervalMin);
  const quickAzkar = useAppStore((s) => s.quickAzkar);

  // In-page fallback: when the app IS open and SW isn't available (preview/dev),
  // we still fire local Notification instances for the daily ones.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    const timers: number[] = [];

    const schedule = (label: string, time: string, body: string, href: string) => {
      const fire = () => {
        if (Notification.permission === "granted" && document.visibilityState !== "visible") {
          try {
            const n = new Notification(label, { body, icon: "/icon-192.png", tag: href });
            n.onclick = () => {
              window.focus();
              window.location.href = href;
            };
          } catch { /* noop */ }
        }
        timers.push(window.setTimeout(fire, nextOccurrence(time)));
      };
      timers.push(window.setTimeout(fire, nextOccurrence(time)));
    };

    if (reminders.morningEnabled) {
      schedule("أذكار الصباح", reminders.morningTime, "حان وقت أذكار الصباح — لا تنسَ ذكر ربك.", "/azkar/morning");
    }
    if (reminders.eveningEnabled) {
      schedule("أذكار المساء", reminders.eveningTime, "حان وقت أذكار المساء — اجعل ختام يومك بذكر الله.", "/azkar/evening");
    }

    return () => { timers.forEach((t) => clearTimeout(t)); };
  }, [reminders.morningEnabled, reminders.morningTime, reminders.eveningEnabled, reminders.eveningTime]);

  // In-page voice playback for quick azkar (fires while app is open, regardless of SW)
  useEffect(() => {
    if (!quickAzkar.enabled || !quickAzkar.voice) return;
    if (typeof window === "undefined") return;
    const pool = QUICK_AZKAR.filter((q) => quickAzkar.ids.includes(q.id));
    if (!pool.length) return;
    const intervalMs = Math.max(1, quickAzkar.intervalMin) * 60 * 1000;
    const tick = () => {
      const h = new Date().getHours();
      const inWindow =
        quickAzkar.fromHour === quickAzkar.toHour ||
        (quickAzkar.fromHour < quickAzkar.toHour
          ? h >= quickAzkar.fromHour && h < quickAzkar.toHour
          : h >= quickAzkar.fromHour || h < quickAzkar.toHour);
      if (inWindow && document.visibilityState === "visible") {
        const p = pool[Math.floor(Math.random() * pool.length)];
        speakArabic(p.speak);
      }
    };
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [quickAzkar.enabled, quickAzkar.voice, quickAzkar.intervalMin, quickAzkar.ids, quickAzkar.fromHour, quickAzkar.toHour]);

  // SW path: works while app is closed (after PWA install).
  useEffect(() => {
    const items: ReminderItem[] = [];
    if (reminders.morningEnabled) {
      items.push({
        id: "morning",
        kind: "daily",
        title: "أذكار الصباح",
        body: "حان وقت أذكار الصباح — لا تنسَ ذكر ربك.",
        time: reminders.morningTime,
        href: "/azkar/morning",
      });
    }
    if (reminders.eveningEnabled) {
      items.push({
        id: "evening",
        kind: "daily",
        title: "أذكار المساء",
        body: "حان وقت أذكار المساء — اجعل ختام يومك بذكر الله.",
        time: reminders.eveningTime,
        href: "/azkar/evening",
      });
    }
    if (ambientEnabled) {
      items.push({
        id: "ambient",
        kind: "ambient",
        intervalMin: Math.max(1, ambientIntervalMin),
        picks: buildAmbientPicks(),
      });
    }
    if (quickAzkar.enabled) {
      const picks = QUICK_AZKAR
        .filter((q) => quickAzkar.ids.includes(q.id))
        .map((q) => ({ text: q.text, speak: q.speak, emoji: q.emoji }));
      if (picks.length) {
        items.push({
          id: "quick",
          kind: "quick",
          intervalMin: Math.max(1, quickAzkar.intervalMin),
          voice: quickAzkar.voice,
          fromHour: quickAzkar.fromHour,
          toHour: quickAzkar.toHour,
          picks,
        });
      }
    }
    void pushSchedule(items);
  }, [
    reminders.morningEnabled,
    reminders.morningTime,
    reminders.eveningEnabled,
    reminders.eveningTime,
    ambientEnabled,
    ambientIntervalMin,
    quickAzkar.enabled,
    quickAzkar.intervalMin,
    quickAzkar.voice,
    quickAzkar.ids,
    quickAzkar.fromHour,
    quickAzkar.toHour,
  ]);
}

export async function requestNotificationPermission(): Promise<boolean> {
  // Capacitor (Android/iOS) → use LocalNotifications which triggers the
  // native POST_NOTIFICATIONS system dialog (Android 13+).
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const cur = await LocalNotifications.checkPermissions();
      if (cur.display === "granted") return true;
      const res = await LocalNotifications.requestPermissions();
      return res.display === "granted";
    }
  } catch {
    /* fall through to web */
  }
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}
