export interface Zikr {
  id: string;
  text: string;
  translation?: { en: string };
  count: number;
  reference?: string;
}

export interface AzkarCategory {
  id: string;
  icon: string; // lucide icon name
  azkar: Zikr[];
}

export const AZKAR: Record<string, AzkarCategory> = {
  morning: {
    id: "morning",
    icon: "Sun",
    azkar: [
      {
        id: "m1",
        text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        translation: {
          en: "We have entered the morning and the dominion belongs to Allah. Praise be to Allah. None has the right to be worshipped except Allah, alone with no partner.",
        },
        count: 1,
        reference: "مسلم",
      },
      {
        id: "m2",
        text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
        translation: {
          en: "O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the resurrection.",
        },
        count: 1,
        reference: "الترمذي",
      },
      {
        id: "m3",
        text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        translation: { en: "Glory and praise be to Allah." },
        count: 100,
        reference: "البخاري ومسلم",
      },
      {
        id: "m4",
        text: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        translation: {
          en: "There is no god but Allah alone, with no partner. His is the dominion and praise, and He is over all things capable.",
        },
        count: 10,
        reference: "النسائي",
      },
      {
        id: "m5",
        text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        translation: {
          en: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
        },
        count: 3,
        reference: "مسلم",
      },
      {
        id: "m6",
        text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ",
        translation: {
          en: "O Allah, grant my body health, my hearing health, my sight health. There is no god but You.",
        },
        count: 3,
        reference: "أبو داود",
      },
      {
        id: "m7",
        text: "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        translation: {
          en: "Allah is sufficient for me; there is no god but Him. Upon Him I rely, and He is the Lord of the great throne.",
        },
        count: 7,
        reference: "أبو داود",
      },
    ],
  },
  evening: {
    id: "evening",
    icon: "Moon",
    azkar: [
      {
        id: "e1",
        text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ",
        translation: {
          en: "We have entered the evening and the dominion belongs to Allah. Praise be to Allah.",
        },
        count: 1,
        reference: "مسلم",
      },
      {
        id: "e2",
        text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
        translation: {
          en: "O Allah, by You we enter the evening, and by You we enter the morning.",
        },
        count: 1,
        reference: "الترمذي",
      },
      {
        id: "e3",
        text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        translation: {
          en: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
        },
        count: 3,
        reference: "مسلم",
      },
      {
        id: "e4",
        text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
        translation: {
          en: "O Allah, I ask You for well-being in this world and the Hereafter.",
        },
        count: 1,
        reference: "أبو داود",
      },
      {
        id: "e5",
        text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
        translation: {
          en: "Glory and praise to Allah, by the number of His creation, the pleasure of Himself, the weight of His throne, and the ink of His words.",
        },
        count: 3,
        reference: "مسلم",
      },
      {
        id: "e6",
        text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ",
        translation: { en: "O Allah, You are my Lord, none has the right to be worshipped but You." },
        count: 1,
        reference: "البخاري",
      },
    ],
  },
  sleep: {
    id: "sleep",
    icon: "BedDouble",
    azkar: [
      {
        id: "s1",
        text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        translation: { en: "In Your name, O Allah, I die and I live." },
        count: 1,
        reference: "البخاري",
      },
      {
        id: "s2",
        text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
        translation: { en: "O Allah, protect me from Your punishment on the Day You resurrect Your servants." },
        count: 3,
        reference: "الترمذي",
      },
      {
        id: "s3",
        text: "سُبْحَانَ اللَّهِ (33) وَالْحَمْدُ لِلَّهِ (33) وَاللَّهُ أَكْبَرُ (34)",
        translation: { en: "Glory be to Allah (33), praise be to Allah (33), Allah is the greatest (34)." },
        count: 1,
        reference: "البخاري ومسلم",
      },
      {
        id: "s4",
        text: "اللَّهُمَّ بِاسْمِكَ وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
        translation: { en: "O Allah, in Your name I lay down, and in Your name I rise..." },
        count: 1,
        reference: "البخاري ومسلم",
      },
    ],
  },
  wakeup: {
    id: "wakeup",
    icon: "Sunrise",
    azkar: [
      {
        id: "w1",
        text: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        translation: { en: "Praise be to Allah who gave us life after death, and to Him is the resurrection." },
        count: 1,
        reference: "البخاري",
      },
      {
        id: "w2",
        text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
        translation: { en: "There is no god but Allah alone, with no partner." },
        count: 1,
        reference: "البخاري",
      },
    ],
  },
  prayer: {
    id: "prayer",
    icon: "Sparkles",
    azkar: [
      {
        id: "p1",
        text: "أَسْتَغْفِرُ اللَّهَ",
        translation: { en: "I seek forgiveness from Allah." },
        count: 3,
        reference: "مسلم",
      },
      {
        id: "p2",
        text: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        translation: { en: "O Allah, You are peace and from You is peace. Blessed are You, O Owner of majesty and honor." },
        count: 1,
        reference: "مسلم",
      },
      {
        id: "p3",
        text: "سُبْحَانَ اللَّهِ",
        translation: { en: "Glory be to Allah." },
        count: 33,
        reference: "مسلم",
      },
      {
        id: "p4",
        text: "الْحَمْدُ لِلَّهِ",
        translation: { en: "Praise be to Allah." },
        count: 33,
        reference: "مسلم",
      },
      {
        id: "p5",
        text: "اللَّهُ أَكْبَرُ",
        translation: { en: "Allah is the greatest." },
        count: 34,
        reference: "مسلم",
      },
    ],
  },
  travel: {
    id: "travel",
    icon: "Plane",
    azkar: [
      {
        id: "t1",
        text: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
        translation: { en: "Glory be to Him who has subjected this to us, and we to our Lord shall surely return." },
        count: 1,
        reference: "الزخرف",
      },
    ],
  },
  food: {
    id: "food",
    icon: "Utensils",
    azkar: [
      {
        id: "f1",
        text: "بِسْمِ اللَّهِ",
        translation: { en: "In the name of Allah." },
        count: 1,
        reference: "مسلم",
      },
      {
        id: "f2",
        text: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        translation: { en: "Praise be to Allah who fed me this and provided it without strength or power from me." },
        count: 1,
        reference: "أبو داود",
      },
    ],
  },
};

export const CATEGORY_ORDER = [
  "morning",
  "evening",
  "sleep",
  "wakeup",
  "prayer",
  "travel",
  "food",
] as const;
