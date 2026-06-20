import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

function nextOccurrence(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h || 0, m || 0, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

export function useReminders() {
  const reminders = useAppStore((s) => s.reminders);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;

    const timers: number[] = [];

    const schedule = (label: string, time: string, body: string, href: string) => {
      const fire = () => {
        if (Notification.permission === "granted") {
          try {
            const n = new Notification(label, { body, icon: "/icon-192.png", tag: href });
            n.onclick = () => {
              window.focus();
              window.location.href = href;
            };
          } catch {
            /* noop */
          }
        }
        // re-schedule for next day
        timers.push(window.setTimeout(fire, nextOccurrence(time)));
      };
      timers.push(window.setTimeout(fire, nextOccurrence(time)));
    };

    if (reminders.morningEnabled) {
      schedule(
        "أذكار الصباح",
        reminders.morningTime,
        "حان وقت أذكار الصباح — لا تنسَ ذكر ربك.",
        "/azkar/morning",
      );
    }
    if (reminders.eveningEnabled) {
      schedule(
        "أذكار المساء",
        reminders.eveningTime,
        "حان وقت أذكار المساء — اجعل ختام يومك بذكر الله.",
        "/azkar/evening",
      );
    }

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [
    reminders.morningEnabled,
    reminders.morningTime,
    reminders.eveningEnabled,
    reminders.eveningTime,
  ]);
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}
