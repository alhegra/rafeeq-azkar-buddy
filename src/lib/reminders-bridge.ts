import { getActiveSW, isSWSupported } from "./sw-register";

export type ReminderItem =
  | {
      id: string;
      kind: "daily";
      title: string;
      body: string;
      time: string; // HH:mm (24h)
      href: string;
    }
  | {
      id: string;
      kind: "ambient";
      intervalMin: number;
      picks: { text: string; reference?: string }[];
    };

async function postToSW(msg: unknown): Promise<boolean> {
  if (!isSWSupported()) return false;
  const sw = await getActiveSW();
  if (!sw) return false;
  sw.postMessage(msg);
  return true;
}

export async function pushSchedule(items: ReminderItem[]): Promise<boolean> {
  return postToSW({ type: "SCHEDULE_SET", items });
}

export async function clearSchedule(): Promise<boolean> {
  return postToSW({ type: "SCHEDULE_CLEAR" });
}

export async function sendTestNotification(
  title = "تذكير تجريبي",
  body = "إن شاء الله ستصلك التذكيرات بهذا الشكل.",
): Promise<boolean> {
  // Prefer SW (works when app is closed). Fallback to in-page Notification.
  const viaSW = await postToSW({ type: "TEST_NOTIFY", title, body });
  if (viaSW) return true;
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, { body, icon: "/icon-192.png" });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
