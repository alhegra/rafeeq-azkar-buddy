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
    void pushSchedule(items);
  }, [
    reminders.morningEnabled,
    reminders.morningTime,
    reminders.eveningEnabled,
    reminders.eveningTime,
    ambientEnabled,
    ambientIntervalMin,
  ]);
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}
