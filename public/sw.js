/* Rafeeq Azkar — notification scheduler service worker.
 * Not an app-shell cache. Sole purpose: receive a schedule from the page
 * and fire local notifications via registration.showNotification, so
 * reminders appear even when the app/tab is closed (after PWA install).
 */

const DB_NAME = "rafeeq-reminders";
const STORE = "schedule";
const TIMER_MAP = new Map(); // id -> timeoutId

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveSchedule(items) {
  const db = await openDb();
  await new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.clear();
    for (const it of items) store.put(it);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

async function loadSchedule() {
  const db = await openDb();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror = () => rej(req.error);
  });
}

function nextOccurrenceMs(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  const now = new Date();
  const t = new Date();
  t.setHours(h || 0, m || 0, 0, 0);
  if (t.getTime() <= now.getTime()) t.setDate(t.getDate() + 1);
  return t.getTime() - now.getTime();
}

function clearAllTimers() {
  for (const id of TIMER_MAP.keys()) {
    clearTimeout(TIMER_MAP.get(id));
  }
  TIMER_MAP.clear();
}

function scheduleOne(item) {
  const fire = () => {
    self.registration.showNotification(item.title, {
      body: item.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: item.id,
      lang: "ar",
      dir: "rtl",
      requireInteraction: false,
      data: { href: item.href || "/" },
    });
    // re-schedule for next day
    const next = nextOccurrenceMs(item.time);
    const tid = setTimeout(fire, next);
    TIMER_MAP.set(item.id, tid);
  };
  const delay = nextOccurrenceMs(item.time);
  const tid = setTimeout(fire, delay);
  TIMER_MAP.set(item.id, tid);
}

function withinActiveHours(item) {
  if (item.fromHour == null || item.toHour == null) return true;
  const h = new Date().getHours();
  const from = item.fromHour, to = item.toHour;
  if (from === to) return true;
  if (from < to) return h >= from && h < to;
  // wrap around midnight
  return h >= from || h < to;
}

function scheduleAmbient(item) {
  // item: { id, kind:"ambient"|"quick", intervalMin, picks:[{text,speak?,emoji?}], fromHour?, toHour?, voice? }
  const fire = () => {
    const pool = item.picks || [];
    if (pool.length && withinActiveHours(item)) {
      const p = pool[Math.floor(Math.random() * pool.length)];
      const title = item.kind === "quick" ? ((p.emoji ? p.emoji + " " : "") + "تذكير بذكر الله") : "ذكر لله";
      const href = "/?say=" + encodeURIComponent(p.speak || p.text) + (item.voice ? "&voice=1" : "");
      self.registration.showNotification(title, {
        body: p.text,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: item.id,
        lang: "ar",
        dir: "rtl",
        silent: false,
        renotify: true,
        vibrate: [80, 40, 80],
        data: { href, speak: p.speak || p.text, voice: !!item.voice },
      });
    }
    const tid = setTimeout(fire, Math.max(1, item.intervalMin) * 60 * 1000);
    TIMER_MAP.set(item.id, tid);
  };
  const tid = setTimeout(fire, Math.max(1, item.intervalMin) * 60 * 1000);
  TIMER_MAP.set(item.id, tid);
}

async function applySchedule(items) {
  clearAllTimers();
  await saveSchedule(items);
  for (const it of items) {
    if (it.kind === "ambient" || it.kind === "quick") scheduleAmbient(it);
    else scheduleOne(it);
  }
}

async function rehydrate() {
  const items = await loadSchedule().catch(() => []);
  clearAllTimers();
  for (const it of items) {
    if (it.kind === "ambient" || it.kind === "quick") scheduleAmbient(it);
    else scheduleOne(it);
  }
}

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    await self.clients.claim();
    await rehydrate();
  })());
});

self.addEventListener("message", (event) => {
  const msg = event.data || {};
  if (msg.type === "SCHEDULE_SET") {
    event.waitUntil(applySchedule(msg.items || []));
  } else if (msg.type === "SCHEDULE_CLEAR") {
    event.waitUntil(applySchedule([]));
  } else if (msg.type === "TEST_NOTIFY") {
    event.waitUntil(self.registration.showNotification(
      msg.title || "تذكير تجريبي",
      {
        body: msg.body || "إن شاء الله ستصلك التذكيرات بهذا الشكل.",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "test",
        lang: "ar",
        dir: "rtl",
        data: { href: "/" },
      },
    ));
  } else if (msg.type === "REHYDRATE") {
    event.waitUntil(rehydrate());
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const href = (event.notification.data && event.notification.data.href) || "/";
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of allClients) {
      try {
        const url = new URL(c.url);
        if (url.origin === self.location.origin) {
          await c.focus();
          if ("navigate" in c) await c.navigate(href);
          return;
        }
      } catch { /* noop */ }
    }
    if (self.clients.openWindow) {
      await self.clients.openWindow(href);
    }
  })());
});

// Periodic background sync (Android Chrome) — re-arm timers if SW was killed.
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "rafeeq-rehydrate") {
    event.waitUntil(rehydrate());
  }
});
