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
}
