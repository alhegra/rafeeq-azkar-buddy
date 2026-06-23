import { useEffect } from "react";
import { speakArabic } from "@/lib/speech";

/**
 * When the app is opened via a notification click that includes ?say=...&voice=1,
 * speak the phrase aloud once and clean the URL.
 */
export function SpeakOnLoad() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const say = url.searchParams.get("say");
    const voice = url.searchParams.get("voice");
    if (!say) return;
    if (voice === "1") {
      // delay slightly so the browser has voices loaded after navigation
      setTimeout(() => speakArabic(say), 400);
    }
    url.searchParams.delete("say");
    url.searchParams.delete("voice");
    window.history.replaceState({}, "", url.pathname + (url.search || "") + url.hash);
  }, []);
  return null;
}
