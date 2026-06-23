// Lightweight wrapper around the Web Speech API for Arabic TTS.
// No network calls, no API keys — uses the OS-installed voices.

function pickArabicVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang?.toLowerCase().startsWith("ar")) ||
    voices.find((v) => /arab/i.test(v.name)) ||
    undefined
  );
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakArabic(text: string, opts?: { rate?: number; pitch?: number }): boolean {
  if (!isSpeechSupported()) return false;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ar-SA";
    utter.rate = opts?.rate ?? 0.95;
    utter.pitch = opts?.pitch ?? 1.0;
    const v = pickArabicVoice();
    if (v) utter.voice = v;
    synth.speak(utter);
    return true;
  } catch {
    return false;
  }
}

// Preload voices (some browsers populate the list asynchronously).
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  } catch { /* noop */ }
}
