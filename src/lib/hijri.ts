// Hijri date via Intl (Umm al-Qura). No deps.
export function getHijriDate(d: Date = new Date()): string {
  try {
    const fmt = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return fmt.format(d);
  } catch {
    return "";
  }
}

export function getHijriParts(d: Date = new Date()): { day: number; month: number; year: number } {
  try {
    const fmt = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
    const parts = fmt.formatToParts(d);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value || 0);
    return { day: get("day"), month: get("month"), year: get("year") };
  } catch {
    return { day: 0, month: 0, year: 0 };
  }
}

export function getGregorianDate(d: Date = new Date(), lang = "ar"): string {
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
