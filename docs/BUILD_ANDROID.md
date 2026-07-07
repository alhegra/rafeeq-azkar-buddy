# بناء تطبيق أندرويد (APK)

## 1) عبر GitHub Actions (الأسهل — لا تحتاج بيئة محلية)

1. اربط المشروع بمستودع GitHub من Lovable (زر **+** ← GitHub).
2. في المستودع افتح **Actions** → اختر **Build Android APK** → **Run workflow**.
   - أو ادفع وسمًا (tag) يبدأ بـ `v` (مثل `v1.0.0`) لبناء تلقائي وإرفاق الـ APK بالإصدار.
3. عند اكتمال البناء نزّل ملف `rafeeq-azkar-debug-apk` من قسم **Artifacts**.
4. انقل ملف `rafeeq-azkar-debug.apk` إلى هاتف أندرويد وثبّته (فعّل "تثبيت من مصادر غير معروفة").

الـ workflow يقوم بـ:
- بناء واجهة الويب عبر `vite.mobile.config.ts` إلى مجلد `dist/`.
- تشغيل `cap add android` (إن لم يكن موجودًا).
- تنفيذ `scripts/patch-android.mjs` لحقن ملفات الإضافة الأصلية `ZikrOverlayPlugin` و`ZikrOverlayService` وتحديث `AndroidManifest.xml` و`MainActivity.java`.
- تنفيذ `cap sync android` وبناء `assembleDebug`.

## 2) بناء محلي

المتطلبات:
- Node.js 22 و Bun آخر إصدار.
- JDK Temurin 21.
- Android SDK (platform-tools, platforms;android-34, build-tools;34.0.0).

الخطوات:

```bash
bun install
bunx vite build --config vite.mobile.config.ts
bunx cap add android            # مرة واحدة فقط
node scripts/patch-android.mjs
bunx cap sync android
cd android && ./gradlew assembleDebug
```

الـ APK: `android/app/build/outputs/apk/debug/app-debug.apk`.

## 3) الإذن العائم (Display over other apps)

عند أول تشغيل يطلب التطبيق فتح إعدادات النظام لمنح إذن "الظهور فوق التطبيقات الأخرى". فعّله يدويًا ثم عد إلى التطبيق.

## ملفات مهمة

- `capacitor.config.ts` — إعدادات Capacitor (`appId`, `webDir=dist`).
- `vite.mobile.config.ts` — بناء ويب مخصص لـ Android WebView (يستخدم `mobile/index.html`).
- `native/android/*.java` — الإضافة الأصلية للنافذة العائمة.
- `scripts/patch-android.mjs` — يحقن الملفات الأصلية بعد `cap add android`.
- `.github/workflows/android.yml` — بناء تلقائي على GitHub.
