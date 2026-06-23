import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAppStore } from "@/lib/store";
import { Moon, Sun, Languages, Type, Vibrate, Volume2, Info, Bell, Sunrise, Sunset, Sparkles, Download, Smartphone, Send, Mic, Repeat } from "lucide-react";
import { requestNotificationPermission } from "@/hooks/use-reminders";
import { sendTestNotification } from "@/lib/reminders-bridge";
import { speakArabic, isSpeechSupported } from "@/lib/speech";
import { QUICK_AZKAR } from "@/lib/quick-azkar";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function SettingsPage() {
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const fontSize = useAppStore((s) => s.fontSize);
  const setFontSize = useAppStore((s) => s.setFontSize);
  const vibration = useAppStore((s) => s.vibration);
  const setVibration = useAppStore((s) => s.setVibration);
  const sound = useAppStore((s) => s.sound);
  const setSound = useAppStore((s) => s.setSound);
  const reminders = useAppStore((s) => s.reminders);
  const setReminders = useAppStore((s) => s.setReminders);
  const ambientEnabled = useAppStore((s) => s.ambientEnabled);
  const setAmbientEnabled = useAppStore((s) => s.setAmbientEnabled);
  const ambientIntervalMin = useAppStore((s) => s.ambientIntervalMin);
  const setAmbientIntervalMin = useAppStore((s) => s.setAmbientIntervalMin);
  const quickAzkar = useAppStore((s) => s.quickAzkar);
  const setQuickAzkar = useAppStore((s) => s.setQuickAzkar);
  const toggleQuickId = useAppStore((s) => s.toggleQuickId);

  // PWA install
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setInstallEvent(null);
    };
    if (typeof window !== "undefined") {
      const standalone =
        window.matchMedia?.("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(Boolean(standalone));
      window.addEventListener("beforeinstallprompt", onPrompt);
      window.addEventListener("appinstalled", onInstalled);
      return () => {
        window.removeEventListener("beforeinstallprompt", onPrompt);
        window.removeEventListener("appinstalled", onInstalled);
      };
    }
  }, []);

  const handleInstall = async () => {
    if (installEvent) {
      await installEvent.prompt();
      const res = await installEvent.userChoice;
      if (res.outcome === "accepted") {
        setIsInstalled(true);
        toast.success("تم تثبيت التطبيق");
      }
      setInstallEvent(null);
    } else if (isIOS) {
      toast.message("على iPhone/iPad: اضغط زر المشاركة ⬆ ثم اختر «أضف إلى الشاشة الرئيسية»", { duration: 7000 });
    } else {
      toast.message("افتح قائمة المتصفح ثم اختر «ثبّت التطبيق» أو «أضف إلى الشاشة الرئيسية»", { duration: 7000 });
    }
  };

  const handleTestNotification = async () => {
    const ok = await requestNotificationPermission();
    if (!ok) {
      toast.error(t("settings.permissionDenied"));
      return;
    }
    // Slight delay so a user can switch tabs to confirm it fires in background.
    setTimeout(() => {
      void sendTestNotification();
    }, 1500);
    toast.success("سيظهر التذكير خلال لحظات — يمكنك تصغير التطبيق لرؤيته");
  };

  const handleToggleReminder = async (key: "morningEnabled" | "eveningEnabled") => {
    const turningOn = !reminders[key];
    if (turningOn) {
      const ok = await requestNotificationPermission();
      if (!ok) {
        toast.error(t("settings.permissionDenied"));
        return;
      }
      toast.success(t("settings.permissionGranted"));
    }
    setReminders({ [key]: turningOn });
  };

  return (
    <AppShell>
      <div className="px-6 pt-10 space-y-6 animate-fade-up">
        <header>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {t("settings.title")}
          </h1>
        </header>

        {/* Appearance */}
        <Section title={t("settings.appearance")}>
          <Row
            icon={theme === "dark" ? <Moon className="size-5" /> : <Sun className="size-5" />}
            label={t("settings.darkMode")}
          >
            <Toggle on={theme === "dark"} onChange={toggleTheme} />
          </Row>
          <Row icon={<Languages className="size-5" />} label={t("settings.language")}>
            <div className="flex rounded-full bg-muted p-1">
              {(["ar", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={
                    "px-3 py-1 text-xs font-medium rounded-full transition " +
                    (language === l
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground")
                  }
                >
                  {l === "ar" ? "العربية" : "English"}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        {/* Text */}
        <Section title={t("settings.text")}>
          <Row icon={<Type className="size-5" />} label={t("settings.fontSize")}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFontSize(fontSize - 2)}
                className="size-8 rounded-full bg-muted text-ink font-bold active:scale-95"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold arabic-nums">
                {fontSize}
              </span>
              <button
                onClick={() => setFontSize(fontSize + 2)}
                className="size-8 rounded-full bg-muted text-ink font-bold active:scale-95"
              >
                +
              </button>
            </div>
          </Row>
          <div className="glass-card rounded-2xl p-4 ring-1 ring-black/5 text-center">
            <p className="font-body text-ink leading-loose" style={{ fontSize: `${fontSize}px` }}>
              سُبْحَانَ اللَّهِ وَبِحَمْدِهِ
            </p>
          </div>
        </Section>

        {/* Sensory */}
        <Section title={t("settings.sensory")}>
          <Row icon={<Vibrate className="size-5" />} label={t("settings.vibration")}>
            <Toggle on={vibration} onChange={() => setVibration(!vibration)} />
          </Row>
          <Row icon={<Volume2 className="size-5" />} label={t("settings.sound")}>
            <Toggle on={sound} onChange={() => setSound(!sound)} />
          </Row>
        </Section>

        {/* Install as App */}
        <Section title="تثبيت التطبيق">
          <Row
            icon={isInstalled ? <Smartphone className="size-5" /> : <Download className="size-5" />}
            label={isInstalled ? "التطبيق مثبّت ✓" : "ثبّت التطبيق على جهازك"}
          >
            {!isInstalled && (
              <button
                onClick={handleInstall}
                className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground active:scale-95 transition"
              >
                {installEvent ? "تثبيت" : "كيف؟"}
              </button>
            )}
          </Row>
          <Row icon={<Send className="size-5" />} label="جرّب التذكير الآن">
            <button
              onClick={handleTestNotification}
              className="rounded-full bg-muted px-4 py-1.5 text-xs font-medium text-ink active:scale-95 transition"
            >
              إرسال
            </button>
          </Row>
          <p className="px-1 text-[11px] text-muted-foreground leading-relaxed">
            بعد التثبيت ومنح إذن الإشعارات، تظهر التذكيرات حتى لو كان التطبيق مغلقاً تماماً (طالما الجهاز يعمل).
            {isIOS && " على iPhone: من Safari اضغط زر المشاركة ← «إضافة إلى الشاشة الرئيسية»."}
          </p>
        </Section>

        {/* Reminders */}
        <Section title={t("settings.reminders")}>
          <Row icon={<Sunrise className="size-5" />} label={t("settings.morningReminder")}>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={reminders.morningTime}
                onChange={(e) => setReminders({ morningTime: e.target.value })}
                className="rounded-lg bg-muted px-2 py-1 text-xs text-ink arabic-nums outline-none"
              />
              <Toggle
                on={reminders.morningEnabled}
                onChange={() => handleToggleReminder("morningEnabled")}
              />
            </div>
          </Row>
          <Row icon={<Sunset className="size-5" />} label={t("settings.eveningReminder")}>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={reminders.eveningTime}
                onChange={(e) => setReminders({ eveningTime: e.target.value })}
                className="rounded-lg bg-muted px-2 py-1 text-xs text-ink arabic-nums outline-none"
              />
              <Toggle
                on={reminders.eveningEnabled}
                onChange={() => handleToggleReminder("eveningEnabled")}
              />
            </div>
          </Row>
          <p className="px-1 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Bell className="size-3.5 mt-0.5 shrink-0" />
            <span>التذكيرات تعمل في الخلفية بعد تثبيت التطبيق ومنح إذن الإشعارات (انظر القسم أعلاه).</span>
          </p>
        </Section>

        {/* Ambient zikr */}
        <Section title={t("settings.ambient")}>
          <Row icon={<Sparkles className="size-5" />} label={t("settings.ambient")}>
            <Toggle
              on={ambientEnabled}
              onChange={async () => {
                const turningOn = !ambientEnabled;
                if (turningOn) await requestNotificationPermission();
                setAmbientEnabled(turningOn);
              }}
            />
          </Row>
          {ambientEnabled && (
            <Row icon={<Bell className="size-5" />} label={t("settings.ambientInterval")}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAmbientIntervalMin(ambientIntervalMin - 1)}
                  className="size-8 rounded-full bg-muted text-ink font-bold active:scale-95"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-semibold arabic-nums">
                  {ambientIntervalMin}
                </span>
                <button
                  onClick={() => setAmbientIntervalMin(ambientIntervalMin + 1)}
                  className="size-8 rounded-full bg-muted text-ink font-bold active:scale-95"
                >
                  +
                </button>
              </div>
            </Row>
          )}
          <p className="px-1 text-[11px] text-muted-foreground leading-relaxed">
            {t("settings.ambientHint")}
          </p>
        </Section>

        {/* Quick periodic azkar reminders with voice */}
        <Section title="التذكيرات السريعة بالصوت">
          <Row icon={<Repeat className="size-5" />} label="تفعيل التذكيرات السريعة">
            <Toggle
              on={quickAzkar.enabled}
              onChange={async () => {
                const turningOn = !quickAzkar.enabled;
                if (turningOn) {
                  const ok = await requestNotificationPermission();
                  if (!ok) {
                    toast.error(t("settings.permissionDenied"));
                    return;
                  }
                }
                setQuickAzkar({ enabled: turningOn });
              }}
            />
          </Row>

          {quickAzkar.enabled && (
            <>
              <Row icon={<Mic className="size-5" />} label="نطق الذكر بالصوت">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!isSpeechSupported()) {
                        toast.error("المتصفح لا يدعم النطق الصوتي");
                        return;
                      }
                      speakArabic("اللهم صل وسلم على نبينا محمد");
                    }}
                    className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-ink active:scale-95"
                  >
                    تجربة
                  </button>
                  <Toggle on={quickAzkar.voice} onChange={() => setQuickAzkar({ voice: !quickAzkar.voice })} />
                </div>
              </Row>

              <Row icon={<Bell className="size-5" />} label="كل (دقيقة)">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuickAzkar({ intervalMin: Math.max(5, quickAzkar.intervalMin - 5) })}
                    className="size-8 rounded-full bg-muted text-ink font-bold active:scale-95"
                  >−</button>
                  <span className="w-12 text-center text-sm font-semibold arabic-nums">{quickAzkar.intervalMin}</span>
                  <button
                    onClick={() => setQuickAzkar({ intervalMin: Math.min(360, quickAzkar.intervalMin + 5) })}
                    className="size-8 rounded-full bg-muted text-ink font-bold active:scale-95"
                  >+</button>
                </div>
              </Row>

              <Row icon={<Sunrise className="size-5" />} label="فعّالة بين الساعتين">
                <div className="flex items-center gap-1.5 arabic-nums text-xs">
                  <input
                    type="number" min={0} max={23}
                    value={quickAzkar.fromHour}
                    onChange={(e) => setQuickAzkar({ fromHour: Math.max(0, Math.min(23, Number(e.target.value) || 0)) })}
                    className="w-12 rounded-lg bg-muted px-2 py-1 text-center outline-none"
                  />
                  <span className="text-muted-foreground">→</span>
                  <input
                    type="number" min={0} max={23}
                    value={quickAzkar.toHour}
                    onChange={(e) => setQuickAzkar({ toHour: Math.max(0, Math.min(23, Number(e.target.value) || 0)) })}
                    className="w-12 rounded-lg bg-muted px-2 py-1 text-center outline-none"
                  />
                </div>
              </Row>

              <div className="space-y-2">
                <p className="px-1 text-[11px] font-semibold text-muted-foreground">اختر الأذكار:</p>
                <div className="grid grid-cols-1 gap-2">
                  {QUICK_AZKAR.map((q) => {
                    const on = quickAzkar.ids.includes(q.id);
                    return (
                      <button
                        key={q.id}
                        onClick={() => toggleQuickId(q.id)}
                        className={
                          "glass-card flex items-center gap-3 rounded-2xl p-3 text-right transition active:scale-[0.98] " +
                          (on ? "ring-2 ring-primary" : "ring-1 ring-black/5 opacity-70")
                        }
                      >
                        <span className="text-2xl">{q.emoji}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold text-ink">{q.label}</span>
                          <span className="block truncate text-[11px] text-muted-foreground">{q.text}</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakArabic(q.speak);
                          }}
                          className="shrink-0 rounded-full bg-primary/10 p-2 text-primary"
                          aria-label="نطق"
                        >
                          <Volume2 className="size-4" />
                        </button>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          <p className="px-1 text-[11px] text-muted-foreground leading-relaxed">
            تظهر إشعارات بالأذكار المختارة بشكل دوري حتى لو كان التطبيق مغلقاً. عند الضغط على الإشعار يُفتح التطبيق ويُنطق الذكر صوتياً.
          </p>
        </Section>




        {/* About */}
        <Section title={t("settings.about")}>
          <Row icon={<Info className="size-5" />} label={t("appName")}>
            <span className="text-xs text-muted-foreground arabic-nums">v0.1.0</span>
          </Row>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="glass-card flex items-center gap-3 rounded-2xl p-4 ring-1 ring-black/5">
      <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium text-ink">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={
        "relative h-7 w-12 rounded-full transition-colors " +
        (on ? "bg-primary" : "bg-muted")
      }
      role="switch"
      aria-checked={on}
    >
      <span
        className={
          "absolute top-0.5 size-6 rounded-full bg-white shadow-md transition-all " +
          (on ? "start-[1.4rem]" : "start-0.5")
        }
      />
    </button>
  );
}
