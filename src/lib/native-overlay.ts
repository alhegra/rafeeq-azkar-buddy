import { registerPlugin, Capacitor } from "@capacitor/core";

export interface ZikrOverlayPlugin {
  hasPermission(): Promise<{ granted: boolean }>;
  requestPermission(): Promise<{ opened: boolean }>;
  showOverlay(opts: { text: string; durationMs?: number }): Promise<void>;
  hideOverlay(): Promise<void>;
  startSchedule(opts: {
    azkar: string[];
    intervalMin: number;
    fromHour: number;
    toHour: number;
  }): Promise<void>;
  stopSchedule(): Promise<void>;
}

const ZikrOverlay = registerPlugin<ZikrOverlayPlugin>("ZikrOverlay");

export const isAndroidNative = () =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";

export async function hasOverlayPermission(): Promise<boolean> {
  if (!isAndroidNative()) return false;
  try {
    const { granted } = await ZikrOverlay.hasPermission();
    return granted;
  } catch {
    return false;
  }
}

export async function requestOverlayPermission(): Promise<void> {
  if (!isAndroidNative()) return;
  try {
    await ZikrOverlay.requestPermission();
  } catch {
    /* ignore */
  }
}

export async function showZikrOverlay(text: string, durationMs = 7000): Promise<void> {
  if (!isAndroidNative()) return;
  try {
    await ZikrOverlay.showOverlay({ text, durationMs });
  } catch {
    /* permission denied or service issue */
  }
}

export async function startOverlaySchedule(opts: {
  azkar: string[];
  intervalMin: number;
  fromHour: number;
  toHour: number;
}): Promise<void> {
  if (!isAndroidNative()) return;
  try {
    await ZikrOverlay.startSchedule(opts);
  } catch {
    /* ignore */
  }
}

export async function stopOverlaySchedule(): Promise<void> {
  if (!isAndroidNative()) return;
  try {
    await ZikrOverlay.stopSchedule();
  } catch {
    /* ignore */
  }
}
