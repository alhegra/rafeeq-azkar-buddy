import { getHijriParts } from "./hijri";

export interface Occasion {
  id: string;
  label: string;
  description: string;
  cta?: { to: string; params?: Record<string, string>; label: string };
  emoji: string;
}

export function getActiveOccasions(d: Date = new Date()): Occasion[] {
  const { day, month } = getHijriParts(d);
  const dow = d.getDay(); // 0=Sun, 5=Fri
  const out: Occasion[] = [];

  if (dow === 5) {
    out.push({
      id: "friday",
      label: "يوم الجمعة المبارك",
      description: "أكثر من الصلاة على النبي ﷺ، واقرأ سورة الكهف",
      cta: { to: "/azkar/$category", params: { category: "morning" }, label: "أذكار اليوم" },
      emoji: "🕌",
    });
  }
  if (month === 9) {
    out.push({
      id: "ramadan",
      label: "شهر رمضان المبارك",
      description: "تقبل الله صيامك وقيامك",
      emoji: "🌙",
    });
  }
  if (month === 10 && day === 1) {
    out.push({ id: "fitr", label: "عيد الفطر المبارك", description: "كل عام وأنتم بخير", emoji: "🎉" });
  }
  if (month === 12 && day === 9) {
    out.push({
      id: "arafah",
      label: "يوم عرفة",
      description: "أفضل الدعاء دعاء يوم عرفة",
      emoji: "🏔️",
    });
  }
  if (month === 12 && day === 10) {
    out.push({ id: "adha", label: "عيد الأضحى المبارك", description: "تقبل الله طاعتكم", emoji: "🐑" });
  }
  if (month === 1 && day === 10) {
    out.push({ id: "ashura", label: "يوم عاشوراء", description: "يكفر السنة الماضية", emoji: "✨" });
  }
  if (day >= 13 && day <= 15) {
    out.push({
      id: "white_days",
      label: "الأيام البيض",
      description: "صيام مستحب 13، 14، 15 من الشهر الهجري",
      emoji: "🌕",
    });
  }
  return out;
}
