#!/usr/bin/env node
/**
 * Patches the generated android/ Capacitor project to:
 *  - add SYSTEM_ALERT_WINDOW + FOREGROUND_SERVICE permissions to AndroidManifest
 *  - register ZikrOverlayService + ZikrAlarmReceiver
 *  - copy native Java sources from native/android into the app package
 *  - register the ZikrOverlayPlugin in MainActivity.onCreate
 *
 * Safe to run multiple times (idempotent).
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const androidDir = path.join(root, "android");
if (!fs.existsSync(androidDir)) {
  console.error("[patch-android] android/ not found — run `cap add android` first");
  process.exit(1);
}

const appId = "com.rafeeqazkar.app";
const pkgPath = appId.replace(/\./g, "/");
const javaDir = path.join(androidDir, "app/src/main/java", pkgPath);
const resLayoutDir = path.join(androidDir, "app/src/main/res/layout");
const resDrawableDir = path.join(androidDir, "app/src/main/res/drawable");
const manifestPath = path.join(androidDir, "app/src/main/AndroidManifest.xml");
const mainActivityPath = path.join(javaDir, "MainActivity.java");
const srcNative = path.join(root, "native/android");

fs.mkdirSync(javaDir, { recursive: true });
fs.mkdirSync(resLayoutDir, { recursive: true });
fs.mkdirSync(resDrawableDir, { recursive: true });

// 1) Copy Java files, replacing package placeholder
for (const fname of ["ZikrOverlayPlugin.java", "ZikrOverlayService.java", "ZikrAlarmReceiver.java"]) {
  const src = fs.readFileSync(path.join(srcNative, fname), "utf8").replace(/__PACKAGE__/g, appId);
  fs.writeFileSync(path.join(javaDir, fname), src);
  console.log("[patch-android] wrote", path.relative(root, path.join(javaDir, fname)));
}

// 2) Copy resources
fs.copyFileSync(path.join(srcNative, "res/layout/overlay_zikr.xml"), path.join(resLayoutDir, "overlay_zikr.xml"));
fs.copyFileSync(path.join(srcNative, "res/drawable/overlay_zikr_bg.xml"), path.join(resDrawableDir, "overlay_zikr_bg.xml"));

// 3) Patch AndroidManifest.xml
let manifest = fs.readFileSync(manifestPath, "utf8");

const permissions = [
  "android.permission.SYSTEM_ALERT_WINDOW",
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_SPECIAL_USE",
  "android.permission.POST_NOTIFICATIONS",
  "android.permission.SCHEDULE_EXACT_ALARM",
  "android.permission.USE_EXACT_ALARM",
  "android.permission.RECEIVE_BOOT_COMPLETED",
  "android.permission.WAKE_LOCK",
  "android.permission.VIBRATE",
];
for (const p of permissions) {
  if (!manifest.includes(`android:name="${p}"`)) {
    manifest = manifest.replace(
      /<manifest\b[^>]*>/,
      (m) => `${m}\n    <uses-permission android:name="${p}" />`,
    );
  }
}

const serviceXml = `        <service
            android:name="${appId}.ZikrOverlayService"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="floating_zikr_overlay" />
        </service>
        <receiver
            android:name="${appId}.ZikrAlarmReceiver"
            android:exported="false" />`;

if (!manifest.includes("ZikrOverlayService")) {
  manifest = manifest.replace(/<\/application>/, `${serviceXml}\n    </application>`);
}

fs.writeFileSync(manifestPath, manifest);
console.log("[patch-android] patched AndroidManifest.xml");

// 4) Register plugin in MainActivity
let mainActivity = fs.readFileSync(mainActivityPath, "utf8");
if (!mainActivity.includes("ZikrOverlayPlugin")) {
  // Insert import
  mainActivity = mainActivity.replace(
    /package [^;]+;\s*/,
    (m) => `${m}\nimport android.os.Bundle;\nimport ${appId}.ZikrOverlayPlugin;\n`,
  );
  // Inject onCreate override
  const onCreate = `
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ZikrOverlayPlugin.class);
        super.onCreate(savedInstanceState);
    }
`;
  mainActivity = mainActivity.replace(/public class MainActivity[^{]*\{/, (m) => `${m}\n${onCreate}`);
  fs.writeFileSync(mainActivityPath, mainActivity);
  console.log("[patch-android] patched MainActivity.java");
} else {
  console.log("[patch-android] MainActivity already patched");
}

console.log("[patch-android] done ✓");
