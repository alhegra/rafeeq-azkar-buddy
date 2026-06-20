import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/components/app-shell";
import { useAppStore } from "@/lib/store";
import { Moon, Sun, Languages, Type, Vibrate, Volume2, Info, Bell, Sunrise, Sunset } from "lucide-react";
import { requestNotificationPermission } from "@/hooks/use-reminders";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

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
