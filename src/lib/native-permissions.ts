// Request native Android permissions on app startup (Capacitor only).
// On the web this is a no-op since the plugins fall back to web APIs that
// only prompt at point-of-use.

import { Capacitor } from "@capacitor/core";

export async function requestNativePermissions(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  // Local notifications (POST_NOTIFICATIONS on Android 13+)
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const status = await LocalNotifications.checkPermissions();
    if (status.display !== "granted") {
      await LocalNotifications.requestPermissions();
    }
  } catch (err) {
    console.warn("[permissions] local-notifications failed", err);
  }

  // Geolocation (ACCESS_FINE_LOCATION / ACCESS_COARSE_LOCATION)
  try {
    const { Geolocation } = await import("@capacitor/geolocation");
    const status = await Geolocation.checkPermissions();
    if (status.location !== "granted" && status.coarseLocation !== "granted") {
      await Geolocation.requestPermissions({ permissions: ["location", "coarseLocation"] });
    }
  } catch (err) {
    console.warn("[permissions] geolocation failed", err);
  }

  // Android: "Display over other apps" (SYSTEM_ALERT_WINDOW) — required to
  // float Azkar above other apps. We can only open the system settings page;
  // the user must toggle it on manually.
  try {
    if (Capacitor.getPlatform() === "android") {
      const { hasOverlayPermission, requestOverlayPermission } = await import(
        "./native-overlay"
      );
      const granted = await hasOverlayPermission();
      if (!granted) {
        await requestOverlayPermission();
      }
    }
  } catch (err) {
    console.warn("[permissions] overlay failed", err);
  }
}
