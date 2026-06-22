/**
 * Service worker registration with strict preview/dev guards.
 * The SW is a notification-scheduling worker (not an app-shell cache),
 * so it follows the messaging-worker exception in the PWA skill rules.
 *
 * Registration is refused in:
 *  - dev mode
 *  - iframes (Lovable preview)
 *  - lovable preview hostnames
 *  - when ?sw=off is present
 * In refused contexts, any existing registration for /sw.js is removed.
 */

const SW_PATH = "/sw.js";

function isRefusedContext(): boolean {
  if (typeof window === "undefined") return true;
  try {
    if (!import.meta.env.PROD) return true;
  } catch {
    return true;
  }
  if (window.top !== window.self) return true;
  if (new URL(window.location.href).searchParams.get("sw") === "off") return true;
  const h = window.location.hostname;
  if (
    h.startsWith("id-preview--") ||
    h.startsWith("preview--") ||
    h === "lovableproject.com" ||
    h.endsWith(".lovableproject.com") ||
    h === "lovableproject-dev.com" ||
    h.endsWith(".lovableproject-dev.com") ||
    h === "beta.lovable.dev" ||
    h.endsWith(".beta.lovable.dev")
  ) {
    return true;
  }
  return false;
}

async function unregisterOurs() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations().catch(() => []);
  for (const r of regs) {
    const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
    if (url.endsWith(SW_PATH)) {
      await r.unregister().catch(() => {});
    }
  }
}

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

export function registerReminderSW(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }
  if (isRefusedContext()) {
    void unregisterOurs();
    return Promise.resolve(null);
  }
  if (registrationPromise) return registrationPromise;
  registrationPromise = navigator.serviceWorker
    .register(SW_PATH, { scope: "/" })
    .then(async (reg) => {
      await navigator.serviceWorker.ready;
      // best-effort periodic sync registration (Android Chrome)
      try {
        const anyReg = reg as unknown as {
          periodicSync?: { register: (tag: string, opts: { minInterval: number }) => Promise<void> };
        };
        if (anyReg.periodicSync) {
          await anyReg.periodicSync
            .register("rafeeq-rehydrate", { minInterval: 6 * 60 * 60 * 1000 })
            .catch(() => {});
        }
      } catch {
        /* noop */
      }
      return reg;
    })
    .catch(() => null);
  return registrationPromise;
}

export async function getActiveSW(): Promise<ServiceWorker | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  if (isRefusedContext()) return null;
  const reg = await registerReminderSW();
  if (!reg) return null;
  return reg.active || reg.waiting || reg.installing || null;
}

export function isSWSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && !isRefusedContext();
}
