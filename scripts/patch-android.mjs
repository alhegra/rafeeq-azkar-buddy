#!/usr/bin/env node
/**
 * Post-`cap add android` patch step.
 * Injects the native ZikrOverlay plugin (overlay permission + floating widget service)
 * and required AndroidManifest permissions/components.
 *
 * Idempotent — safe to run multiple times.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ANDROID = path.join(ROOT, "android");
const PKG_PATH = "com/rafeeqazkar/app";
const JAVA_DIR = path.join(ANDROID, "app/src/main/java", PKG_PATH);
const MANIFEST = path.join(ANDROID, "app/src/main/AndroidManifest.xml");
const MAIN_ACTIVITY = path.join(JAVA_DIR, "MainActivity.java");
const NATIVE_SRC = path.join(ROOT, "native/android");

if (!fs.existsSync(ANDROID)) {
  console.error("[patch-android] android/ not found — run `cap add android` first.");
  process.exit(1);
}

fs.mkdirSync(JAVA_DIR, { recursive: true });

// 1. Copy plugin sources
for (const f of ["ZikrOverlayPlugin.java", "ZikrOverlayService.java"]) {
  const src = path.join(NATIVE_SRC, f);
  const dst = path.join(JAVA_DIR, f);
  fs.copyFileSync(src, dst);
  console.log("[patch-android] copied", f);
}

// 2. Patch AndroidManifest.xml
let manifest = fs.readFileSync(MANIFEST, "utf8");
const permissions = [
  "android.permission.SYSTEM_ALERT_WINDOW",
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_SPECIAL_USE",
  "android.permission.POST_NOTIFICATIONS",
  "android.permission.WAKE_LOCK",
  "android.permission.RECEIVE_BOOT_COMPLETED",
];
for (const p of permissions) {
  const tag = `<uses-permission android:name="${p}" />`;
  if (!manifest.includes(p)) {
    manifest = manifest.replace(/<manifest([^>]*)>/, (m) => `${m}\n    ${tag}`);
    console.log("[patch-android] added permission", p);
  }
}

// Service entry inside <application>
if (!manifest.includes("ZikrOverlayService")) {
  const serviceXml = `        <service
            android:name=".ZikrOverlayService"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="floating_zikr_reminder" />
        </service>`;
  manifest = manifest.replace(/<\/application>/, `${serviceXml}\n    </application>`);
  console.log("[patch-android] registered ZikrOverlayService");
}

fs.writeFileSync(MANIFEST, manifest);

// 3. Register plugin in MainActivity
if (fs.existsSync(MAIN_ACTIVITY)) {
  let ma = fs.readFileSync(MAIN_ACTIVITY, "utf8");
  if (!ma.includes("ZikrOverlayPlugin")) {
    // Add import for Bundle if missing and onCreate override that registers plugin
    if (!ma.includes("import android.os.Bundle;")) {
      ma = ma.replace(
        /package ([^;]+);/,
        (m) => `${m}\n\nimport android.os.Bundle;`,
      );
    }
    // Replace empty class body with onCreate override
    ma = ma.replace(
      /public class MainActivity extends BridgeActivity \{\s*\}/,
      `public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ZikrOverlayPlugin.class);
        super.onCreate(savedInstanceState);
    }
}`,
    );
    fs.writeFileSync(MAIN_ACTIVITY, ma);
    console.log("[patch-android] registered ZikrOverlayPlugin in MainActivity");
  }
} else {
  console.warn("[patch-android] MainActivity.java not found at", MAIN_ACTIVITY);
}

console.log("[patch-android] done.");
