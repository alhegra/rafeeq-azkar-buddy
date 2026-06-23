import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, Repeat, Volume2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { QUICK_AZKAR } from "@/lib/quick-azkar";
import { speak, stopSpeaking } from "@/lib/speech";

export const Route = createFileRoute("/audio")({
  component: AudioPage,
});

interface Track {
  id: string;
  title: string;
  text: string;
}

const PLAYLISTS: { id: string; title: string; emoji: string; tracks: Track[] }[] = [
  {
    id: "salawat",
    title: "الصلاة على النبي ﷺ",
    emoji: "🕊️",
    tracks: Array.from({ length: 10 }, (_, i) => ({
      id: `s${i}`,
      title: `الصلاة ${i + 1}`,
      text: "اللهم صل وسلم وبارك على نبينا محمد وعلى آله وصحبه أجمعين",
    })),
  },
  {
    id: "istighfar",
    title: "الاستغفار",
    emoji: "🤲",
    tracks: Array.from({ length: 33 }, (_, i) => ({
      id: `i${i}`,
      title: `الاستغفار ${i + 1}`,
      text: "أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه",
    })),
  },
  {
    id: "tasbih",
    title: "التسبيح",
    emoji: "✨",
    tracks: QUICK_AZKAR.map((q) => ({ id: q.id, title: q.label, text: q.speak })),
  },
];

function AudioPage() {
  const [plId, setPlId] = useState(PLAYLISTS[0].id);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [repeat, setRepeat] = useState(true);
  const [rate, setRate] = useState(0.9);
  const playingRef = useRef(false);

  const pl = PLAYLISTS.find((p) => p.id === plId)!;
  const track = pl.tracks[idx];

  useEffect(() => {
    playingRef.current = playing;
    if (!playing) stopSpeaking();
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    let cancelled = false;
    const run = async () => {
      try {
        await speak(track.text, { rate });
      } catch {
        /* noop */
      }
      if (cancelled || !playingRef.current) return;
      // next
      const nextIdx = idx + 1 < pl.tracks.length ? idx + 1 : repeat ? 0 : idx;
      if (nextIdx === idx && !repeat) {
        setPlaying(false);
      } else {
        setIdx(nextIdx);
      }
    };
    run();
    return () => {
      cancelled = true;
      stopSpeaking();
    };
  }, [playing, idx, plId, repeat, rate]);

  return (
    <AppShell>
      <PageHeader title="المكتبة الصوتية" subtitle="استمع لأذكار وأدعية مختارة" />
      <div className="px-6 pb-6 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {PLAYLISTS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setPlId(p.id);
                setIdx(0);
                setPlaying(false);
              }}
              className={
                "glass-card rounded-2xl py-4 flex flex-col items-center gap-1.5 ring-1 transition active:scale-95 " +
                (plId === p.id ? "ring-primary bg-primary/10" : "ring-black/5")
              }
            >
              <span className="text-2xl">{p.emoji}</span>
              <span className="text-[11px] font-semibold leading-tight text-center">{p.title}</span>
            </button>
          ))}
        </div>

        {/* Player */}
        <div className="glass-card rounded-3xl p-6 ring-1 ring-black/5 space-y-5">
          <div className="text-center space-y-2">
            <p className="text-[11px] text-muted-foreground">{pl.title}</p>
            <p className="font-body text-ink leading-loose" style={{ fontSize: "1.05rem" }}>
              {track.text}
            </p>
            <p className="text-[11px] text-muted-foreground arabic-nums">
              {idx + 1} / {pl.tracks.length}
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setRepeat((r) => !r)}
              className={
                "size-11 rounded-full flex items-center justify-center active:scale-95 " +
                (repeat ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground")
              }
              aria-label="تكرار"
            >
              <Repeat className="size-4" />
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="size-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sky active:scale-95"
              aria-label={playing ? "إيقاف" : "تشغيل"}
            >
              {playing ? <Pause className="size-6" /> : <Play className="size-6 ms-0.5" />}
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % pl.tracks.length)}
              className="size-11 rounded-full bg-secondary flex items-center justify-center active:scale-95"
              aria-label="التالي"
            >
              <SkipForward className="size-4" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Volume2 className="size-4 text-muted-foreground" />
            <input
              type="range"
              min={0.6}
              max={1.4}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-[11px] arabic-nums text-muted-foreground w-10 text-end">
              {rate.toFixed(1)}×
            </span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center px-6">
          يستخدم التطبيق صوت النظام لقراءة الأذكار، ويعمل دون اتصال بالإنترنت.
        </p>
      </div>
    </AppShell>
  );
}
