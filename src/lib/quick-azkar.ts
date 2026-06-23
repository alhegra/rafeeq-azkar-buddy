// Curated short azkar for periodic reminders ("التذكيرات السريعة").
// Each phrase is brief enough to fit a notification body and to be spoken aloud.

export interface QuickZikr {
  id: string;
  text: string;        // shown in notification
  speak: string;       // text to pass to speechSynthesis (can be a shorter form)
  label: string;       // settings label
  emoji: string;
}

export const QUICK_AZKAR: QuickZikr[] = [
  {
    id: "salah_nabi",
    text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    speak: "اللهم صل وسلم على نبينا محمد",
    label: "الصلاة على النبي ﷺ",
    emoji: "🌿",
  },
  {
    id: "istighfar",
    text: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    speak: "أستغفر الله وأتوب إليه",
    label: "الاستغفار",
    emoji: "🤲",
  },
  {
    id: "subhan_hamd",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    speak: "سبحان الله وبحمده، سبحان الله العظيم",
    label: "سبحان الله وبحمده",
    emoji: "✨",
  },
  {
    id: "tahlil",
    text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    speak: "لا إله إلا الله وحده لا شريك له",
    label: "التهليل",
    emoji: "☀️",
  },
  {
    id: "hawqala",
    text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    speak: "لا حول ولا قوة إلا بالله",
    label: "الحوقلة",
    emoji: "🕊️",
  },
  {
    id: "hasbi",
    text: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ",
    speak: "حسبي الله لا إله إلا هو، عليه توكلت",
    label: "حسبي الله",
    emoji: "🌙",
  },
  {
    id: "hamdullah",
    text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    speak: "الحمد لله رب العالمين",
    label: "الحمد لله",
    emoji: "💫",
  },
  {
    id: "tasbih_kabir",
    text: "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ",
    speak: "سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر",
    label: "الباقيات الصالحات",
    emoji: "🌟",
  },
];

export function getQuickById(id: string): QuickZikr | undefined {
  return QUICK_AZKAR.find((q) => q.id === id);
}
