import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "ar" | "en";
export type Theme = "light" | "dark";

export interface DailyStat {
  date: string; // YYYY-MM-DD
  tasbeehCount: number;
  azkarRead: number;
}

export interface Reminders {
  morningEnabled: boolean;
  morningTime: string; // "HH:mm"
  eveningEnabled: boolean;
  eveningTime: string;
}

export interface QuickAzkarSettings {
  enabled: boolean;
  ids: string[]; // enabled quick-zikr ids
  intervalMin: number; // minutes between pings
  voice: boolean; // speak with TTS when opened
  fromHour: number; // 0..23 — active window start
  toHour: number;   // 0..23 — active window end
}

interface AppState {
  // Settings
  language: Language;
  theme: Theme;
  fontSize: number; // 16..28
  vibration: boolean;
  sound: boolean;
  reminders: Reminders;

  // Ambient zikr bubble (in-app)
  ambientEnabled: boolean;
  ambientIntervalMin: number; // minutes between bubbles

  // Quick periodic azkar reminders (system notifications)
  quickAzkar: QuickAzkarSettings;

  // Favorites
  favorites: string[]; // zikr ids: `${categoryId}:${zikrId}`

  // Azkar progress: categoryId -> zikrId -> remaining-to-current count
  progress: Record<string, Record<string, number>>;

  // Tasbeeh
  tasbeehCount: number;
  tasbeehGoal: number;
  tasbeehTotal: number; // lifetime

  // Stats
  stats: DailyStat[];

  // Actions
  setLanguage: (l: Language) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setFontSize: (n: number) => void;
  setVibration: (b: boolean) => void;
  setSound: (b: boolean) => void;
  setReminders: (r: Partial<Reminders>) => void;
  setAmbientEnabled: (b: boolean) => void;
  setAmbientIntervalMin: (n: number) => void;
  setQuickAzkar: (q: Partial<QuickAzkarSettings>) => void;
  toggleQuickId: (id: string) => void;

  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  incrementZikr: (categoryId: string, zikrId: string) => void;
  resetCategory: (categoryId: string) => void;
  getZikrCount: (categoryId: string, zikrId: string) => number;

  incrementTasbeeh: () => void;
  resetTasbeeh: () => void;
  setTasbeehGoal: (n: number) => void;

  addAzkarRead: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const bumpStat = (stats: DailyStat[], key: "tasbeehCount" | "azkarRead"): DailyStat[] => {
  const d = today();
  const idx = stats.findIndex((s) => s.date === d);
  if (idx === -1) {
    return [...stats, { date: d, tasbeehCount: 0, azkarRead: 0, [key]: 1 } as DailyStat];
  }
  const copy = [...stats];
  copy[idx] = { ...copy[idx], [key]: copy[idx][key] + 1 };
  return copy;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: "ar",
      theme: "light",
      fontSize: 22,
      vibration: true,
      sound: false,
      reminders: {
        morningEnabled: false,
        morningTime: "06:30",
        eveningEnabled: false,
        eveningTime: "17:30",
      },
      ambientEnabled: true,
      ambientIntervalMin: 8,
      quickAzkar: {
        enabled: false,
        ids: ["salah_nabi", "istighfar", "subhan_hamd"],
        intervalMin: 30,
        voice: true,
        fromHour: 7,
        toHour: 23,
      },
      favorites: [],
      progress: {},
      tasbeehCount: 0,
      tasbeehGoal: 100,
      tasbeehTotal: 0,
      stats: [],

      setLanguage: (l) => set({ language: l }),
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set({ theme: get().theme === "light" ? "dark" : "light" }),
      setFontSize: (n) => set({ fontSize: Math.max(16, Math.min(32, n)) }),
      setVibration: (b) => set({ vibration: b }),
      setSound: (b) => set({ sound: b }),
      setReminders: (r) => set({ reminders: { ...get().reminders, ...r } }),
      setAmbientEnabled: (b) => set({ ambientEnabled: b }),
      setAmbientIntervalMin: (n) => set({ ambientIntervalMin: Math.max(1, Math.min(120, n)) }),

      toggleFavorite: (id) => {
        const favs = get().favorites;
        set({
          favorites: favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id],
        });
      },
      isFavorite: (id) => get().favorites.includes(id),

      incrementZikr: (categoryId, zikrId) => {
        const p = get().progress;
        const cat = { ...(p[categoryId] || {}) };
        cat[zikrId] = (cat[zikrId] || 0) + 1;
        set({
          progress: { ...p, [categoryId]: cat },
          stats: bumpStat(get().stats, "azkarRead"),
        });
      },
      resetCategory: (categoryId) => {
        const p = { ...get().progress };
        delete p[categoryId];
        set({ progress: p });
      },
      getZikrCount: (categoryId, zikrId) =>
        get().progress[categoryId]?.[zikrId] || 0,

      incrementTasbeeh: () =>
        set({
          tasbeehCount: get().tasbeehCount + 1,
          tasbeehTotal: get().tasbeehTotal + 1,
          stats: bumpStat(get().stats, "tasbeehCount"),
        }),
      resetTasbeeh: () => set({ tasbeehCount: 0 }),
      setTasbeehGoal: (n) => set({ tasbeehGoal: Math.max(1, n) }),

      addAzkarRead: () => set({ stats: bumpStat(get().stats, "azkarRead") }),
    }),
    {
      name: "rafeeq-azkar-store",
      version: 1,
    },
  ),
);
