import { QUICK_AZKAR, type QuickZikr } from "./quick-azkar";

export interface SmartSuggestion {
  id: string;
  title: string;
  subtitle: string;
  to: string;
  params?: Record<string, string>;
  emoji: string;
  reason: string;
}

export function getSmartSuggestions(d: Date = new Date()): SmartSuggestion[] {
  const h = d.getHours();
  const dow = d.getDay();
  const out: SmartSuggestion[] = [];

  if (h >= 4 && h < 11) {
    out.push({
      id: "morning",
      title: "أذكار الصباح",
      subtitle: "حصن المسلم لبداية يومك",
      to: "/azkar/$category",
      params: { category: "morning" },
      emoji: "🌅",
      reason: "وقت الصباح",
    });
  }
  if (h >= 15 && h < 20) {
    out.push({
      id: "evening",
      title: "أذكار المساء",
      subtitle: "اختم نهارك بذكر الله",
      to: "/azkar/$category",
      params: { category: "evening" },
      emoji: "🌇",
      reason: "وقت المساء",
    });
  }
  if (h >= 21 || h < 4) {
    out.push({
      id: "sleep",
      title: "أذكار النوم",
      subtitle: "نم في حفظ الله ورعايته",
      to: "/azkar/$category",
      params: { category: "sleep" },
      emoji: "🌙",
      reason: "وقت النوم",
    });
  }
  if (dow === 5) {
    out.push({
      id: "salawat",
      title: "الصلاة على النبي ﷺ",
      subtitle: "أكثر منها في يوم الجمعة",
      to: "/tasbeeh",
      emoji: "🕊️",
      reason: "يوم الجمعة",
    });
  }
  // Always suggest istighfar as a gentle anchor
  out.push({
    id: "istighfar",
    title: "الاستغفار",
    subtitle: "أستغفر الله وأتوب إليه",
    to: "/tasbeeh",
    emoji: "🤲",
    reason: "مستحب دائماً",
  });
  return out.slice(0, 4);
}

export function getRecommendedQuickZikr(d: Date = new Date()): QuickZikr {
  const h = d.getHours();
  const dow = d.getDay();
  if (dow === 5) return QUICK_AZKAR.find((q) => q.id === "salah_nabi")!;
  if (h < 11) return QUICK_AZKAR.find((q) => q.id === "subhan_hamd")!;
  if (h < 17) return QUICK_AZKAR.find((q) => q.id === "istighfar")!;
  if (h < 21) return QUICK_AZKAR.find((q) => q.id === "tahlil")!;
  return QUICK_AZKAR.find((q) => q.id === "hawqala")!;
}
