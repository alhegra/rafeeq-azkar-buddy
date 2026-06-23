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
  ids: string[];
  intervalMin: number;
  voice: boolean;
  fromHour: number;
  toHour: number;
}

export type GoalPeriod = "daily" | "weekly";
export interface Goal {
  id: string;
  zikrId: string; // QuickZikr id (or "tasbeeh")
  label: string;
  target: number;
  period: GoalPeriod;
  createdAt: number;
}

export interface Streak {
  current: number;
  longest: number;
  lastDate: string; // YYYY-MM-DD
}

interface AppState {
  language: Language;
  theme: Theme;
  fontSize: number;
  vibration: boolean;
  sound: boolean;
  reminders: Reminders;

  ambientEnabled: boolean;
  ambientIntervalMin: number;

  quickAzkar: QuickAzkarSettings;

  overlayEnabled: boolean;

  favorites: string[];
  progress: Record<string, Record<string, number>>;

  tasbeehCount: number;
  tasbeehGoal: number;
  tasbeehTotal: number;

  stats: DailyStat[];

  // NEW
  goals: Goal[];
  dailyCounts: Record<string, Record<string, number>>; // date -> {key -> n}
  streak: Streak;
  treeXp: number;

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

  // NEW actions
  addGoal: (g: Omit<Goal, "id" | "createdAt">) => void;
  removeGoal: (id: string) => void;
  bumpDaily: (key: string, by?: number) => void;
  getDailyCount: (key: string, date?: string) => number;
  getPeriodCount: (key: string, period: GoalPeriod) => number;
}

const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

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

const advanceStreak = (s: Streak): Streak => {
  const t = today();
  if (s.lastDate === t) return s;
  const cont = s.lastDate === yesterday();
  const current = cont ? s.current + 1 : 1;
  return {
    current,
    longest: Math.max(s.longest, current),
    lastDate: t,
  };
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

      goals: [],
      dailyCounts: {},
      streak: { current: 0, longest: 0, lastDate: "" },
      treeXp: 0,

      setLanguage: (l) => set({ language: l }),
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set({ theme: get().theme === "light" ? "dark" : "light" }),
      setFontSize: (n) => set({ fontSize: Math.max(16, Math.min(32, n)) }),
      setVibration: (b) => set({ vibration: b }),
      setSound: (b) => set({ sound: b }),
      setReminders: (r) => set({ reminders: { ...get().reminders, ...r } }),
      setAmbientEnabled: (b) => set({ ambientEnabled: b }),
      setAmbientIntervalMin: (n) => set({ ambientIntervalMin: Math.max(1, Math.min(120, n)) }),
      setQuickAzkar: (q) => set({ quickAzkar: { ...get().quickAzkar, ...q } }),
      toggleQuickId: (id) => {
        const cur = get().quickAzkar;
        const ids = cur.ids.includes(id) ? cur.ids.filter((x) => x !== id) : [...cur.ids, id];
        set({ quickAzkar: { ...cur, ids } });
      },

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
          streak: advanceStreak(get().streak),
          treeXp: get().treeXp + 1,
        });
        get().bumpDaily(`${categoryId}:${zikrId}`);
      },
      resetCategory: (categoryId) => {
        const p = { ...get().progress };
        delete p[categoryId];
        set({ progress: p });
      },
      getZikrCount: (categoryId, zikrId) =>
        get().progress[categoryId]?.[zikrId] || 0,

      incrementTasbeeh: () => {
        set({
          tasbeehCount: get().tasbeehCount + 1,
          tasbeehTotal: get().tasbeehTotal + 1,
          stats: bumpStat(get().stats, "tasbeehCount"),
          streak: advanceStreak(get().streak),
          treeXp: get().treeXp + 1,
        });
        get().bumpDaily("tasbeeh");
      },
      resetTasbeeh: () => set({ tasbeehCount: 0 }),
      setTasbeehGoal: (n) => set({ tasbeehGoal: Math.max(1, n) }),

      addAzkarRead: () => set({ stats: bumpStat(get().stats, "azkarRead") }),

      addGoal: (g) => {
        const id = `g_${Date.now().toString(36)}`;
        set({ goals: [...get().goals, { ...g, id, createdAt: Date.now() }] });
      },
      removeGoal: (id) => set({ goals: get().goals.filter((g) => g.id !== id) }),

      bumpDaily: (key, by = 1) => {
        const t = today();
        const map = { ...get().dailyCounts };
        const day = { ...(map[t] || {}) };
        day[key] = (day[key] || 0) + by;
        map[t] = day;
        // prune > 90 days
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        const cstr = cutoff.toISOString().slice(0, 10);
        for (const k of Object.keys(map)) if (k < cstr) delete map[k];
        set({ dailyCounts: map });
      },
      getDailyCount: (key, date) => {
        const d = date || today();
        return get().dailyCounts[d]?.[key] || 0;
      },
      getPeriodCount: (key, period) => {
        const map = get().dailyCounts;
        if (period === "daily") return map[today()]?.[key] || 0;
        // weekly: last 7 days inclusive
        let sum = 0;
        const now = new Date();
        for (let i = 0; i < 7; i++) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          sum += map[d.toISOString().slice(0, 10)]?.[key] || 0;
        }
        return sum;
      },
    }),
    {
      name: "rafeeq-azkar-store",
      version: 2,
    },
  ),
);
