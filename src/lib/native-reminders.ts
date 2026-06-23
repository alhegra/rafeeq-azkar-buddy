// Native reminder scheduler for Capacitor (Android).
// Mirrors the web service-worker scheduler but uses @capacitor/local-notifications
// so notifications fire even when the app process is fully closed.
//
// Note: Android cannot play arbitrary TTS audio while the app is closed without
// a foreground service. We use the notification channel's default sound +
// vibration so the user gets an audible alert; voice playback resumes when the
// user opens the app via the notification.

import { Capacitor } from "@capacitor/core";
import type { ReminderItem } from "./reminders-bridge";

const CHANNEL_ID = "rafeeq-azkar";

function hashId(seed: string, idx: number): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  // keep within positive 31-bit range; mix in idx
  return ((h ^ idx) & 0x7fffffff) || idx + 1;
}

function nextDailyDate(hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d;
}

function withinHours(h: number, from: number, to: number): boolean {
  if (from === to) return true;
  if (from < to) return h >= from && h < to;
  return h >= from || h < to;
}

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export async function pushNativeSchedule(items: ReminderItem[]): Promise<void> {
  if (!isNative()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");

  // Make sure we have permission + a channel with sound/vibration.
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") {
      const req = await LocalNotifications.requestPermissions();
      if (req.display !== "granted") return;
    }
  } catch { /* noop */ }

  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: "تذكيرات الأذكار",
      description: "تذكيرات الأذكار والأوراد اليومية",
      importance: 5, // IMPORTANCE_HIGH — heads-up + sound
      visibility: 1,
      vibration: true,
      lights: true,
      sound: undefined, // default system sound
    });
  } catch { /* channel APIs only exist on Android */ }

  // Wipe previous schedule
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    }
  } catch { /* noop */ }

  type ScheduleEntry = {
    id: number;
    title: string;
    body: string;
    schedule: { at: Date; repeats?: boolean; every?: "day" };
    smallIcon?: string;
    channelId?: string;
    extra?: Record<string, unknown>;
  };

  const notifications: ScheduleEntry[] = [];

  for (const item of items) {
    if (item.kind === "daily") {
      notifications.push({
        id: hashId(item.id, 0),
        title: item.title,
        body: item.body,
        schedule: { at: nextDailyDate(item.time), repeats: true, every: "day" },
        channelId: CHANNEL_ID,
        extra: { href: item.href },
      });
      continue;
    }

    // ambient / quick — pre-schedule N future occurrences spaced by intervalMin.
    // Android caps pending alarms (~500); 96 covers ~24h at 15min cadence.
    const intervalMs = Math.max(1, item.intervalMin) * 60 * 1000;
    const MAX = 96;
    const fromH = "fromHour" in item ? item.fromHour : 0;
    const toH = "toHour" in item ? item.toHour : 0;
    const useWindow = "fromHour" in item;

    let scheduled = 0;
    let t = Date.now() + intervalMs;
    let step = 0;
    while (scheduled < MAX && step < MAX * 3) {
      step++;
      const when = new Date(t);
      if (!useWindow || withinHours(when.getHours(), fromH, toH)) {
        const pick = item.picks[Math.floor(Math.random() * item.picks.length)];
        if (pick) {
          const title =
            item.kind === "quick"
              ? ((pick as { emoji?: string }).emoji
                  ? `${(pick as { emoji?: string }).emoji} تذكير بذكر الله`
                  : "تذكير بذكر الله")
              : "ذكر لله";
          const speak = (pick as { speak?: string }).speak || pick.text;
          const href =
            "/?say=" +
            encodeURIComponent(speak) +
            (item.kind === "quick" && item.voice ? "&voice=1" : "");
          notifications.push({
            id: hashId(item.id, scheduled + 1),
            title,
            body: pick.text,
            schedule: { at: when },
            channelId: CHANNEL_ID,
            extra: { href, speak, voice: item.kind === "quick" ? item.voice : false },
          });
          scheduled++;
        }
      }
      t += intervalMs;
    }
  }

  if (notifications.length) {
    try {
      await LocalNotifications.schedule({ notifications });
    } catch (err) {
      console.warn("[native-reminders] schedule failed", err);
    }
  }
}

export async function clearNativeSchedule(): Promise<void> {
  if (!isNative()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    }
  } catch { /* noop */ }
}

export async function sendNativeTest(
  title = "تذكير تجريبي",
  body = "إن شاء الله ستصلك التذكيرات بهذا الشكل.",
): Promise<boolean> {
  if (!isNative()) return false;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.floor(Math.random() * 1_000_000) + 1,
          title,
          body,
          schedule: { at: new Date(Date.now() + 1500) },
          channelId: CHANNEL_ID,
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

// When the user taps a notification while the app is closed, Android launches
// the app; we read the `href` extra and navigate there.
export async function wireNativeNotificationTaps(): Promise<void> {
  if (!isNative()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.addListener("localNotificationActionPerformed", (event) => {
    const data = (event.notification.extra || {}) as { href?: string; speak?: string; voice?: boolean };
    if (data.href && typeof window !== "undefined") {
      try {
        const url = new URL(data.href, window.location.origin);
        window.location.href = url.pathname + url.search;
      } catch { /* noop */ }
    }
  });
}
