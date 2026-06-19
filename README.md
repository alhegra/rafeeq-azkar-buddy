# رفيق أذكار — Rafeeq Azkar

> تطبيق إسلامي شامل مجاني للأذكار، الأدعية، التسبيح، مواقيت الصلاة، واتجاه القبلة.
> Free, premium Islamic companion app — Azkar, Dua, Tasbih, Prayer Times & Qibla.

تصميم زجاجي أنيق (Dawn Glassmorphism) · دعم كامل للعربية RTL · يعمل كـ **PWA** قابل للتثبيت وكتطبيق **Android** عبر Capacitor.

---

## ✨ المزايا الرئيسية

- 📿 **مكتبة أذكار وأدعية** — 10 فئات (الصباح، المساء، النوم، الاستيقاظ، الصلاة، الاستغفار، الرقية، المسجد، السفر، الطعام) بنصوص موثقة من البخاري ومسلم وأبي داود والترمذي.
- 🔍 **بحث ذكي بالعربية** — يتجاهل التشكيل ويوحّد الحروف (أ/إ/آ، ى/ي، ه/ة).
- 🧮 **مسبحة إلكترونية** — عدّاد دائري متحرك مع أهداف يومية واهتزاز.
- 🕋 **اتجاه القبلة** — بوصلة حية باستخدام DeviceOrientation + GPS.
- 🕌 **مواقيت الصلاة** — حسب الموقع الجغرافي مع عدّ تنازلي للصلاة القادمة.
- ⭐ **المفضلة + الإحصائيات** — سلسلة الأيام، إجمالي التسبيح، رسم بياني لآخر 7 أيام.
- 🌓 **الوضع الليلي** + تكبير الخط + لغتان (عربي/إنجليزي).
- 📱 **PWA كامل** — قابل للتثبيت بدون متجر، مع اختصارات سريعة.
- 🤖 **Android-ready** — جاهز للبناء كـ AAB ونشره على Google Play.
- 🔒 **خصوصية تامة** — جميع البيانات محفوظة محلياً (localStorage). لا تتبّع، لا تسجيل دخول.

---

## 🛠 التقنيات

| الطبقة | التقنية |
|---|---|
| Framework | TanStack Start v1 + React 19 |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 + Glassmorphism |
| State | Zustand + persist |
| i18n | i18next (ar/en, RTL) |
| Icons | lucide-react |
| Mobile Shell | Capacitor 6 (Android) |
| PWA | Web App Manifest |

---

## 🚀 التشغيل المحلي

```bash
# 1. تثبيت الاعتماديات
bun install

# 2. تشغيل خادم التطوير
bun run dev
# يفتح على http://localhost:8080
```

### الأوامر المتاحة

```bash
bun run dev          # خادم التطوير
bun run build        # بناء للإنتاج
bun run preview      # معاينة البناء النهائي
bun run lint         # فحص الكود
bun run format       # تنسيق الكود
```

---

## 🌍 متغيرات البيئة

التطبيق يعمل بدون أي متغيرات بيئة افتراضياً (تخزين محلي فقط). للمراحل المستقبلية:

```bash
# .env.local (اختياري)
VITE_APP_VERSION=1.0.0
# عند تفعيل المزامنة السحابية لاحقاً:
# VITE_SUPABASE_URL=
# VITE_SUPABASE_PUBLISHABLE_KEY=
```

---

## 📦 النشر على GitHub

```bash
# 1. أنشئ مستودعاً جديداً على github.com
# 2. اربط المشروع المحلي
git init
git add .
git commit -m "feat: initial commit - Rafeeq Azkar MVP"
git branch -M main
git remote add origin https://github.com/<username>/rafeeq-azkar.git
git push -u origin main
```

> 💡 المشروع يستخدم gitignore افتراضي يتجاهل `node_modules`, `dist`, `android/`, `ios/`, `.env*`.

---

## 📲 تثبيت كتطبيق PWA

التطبيق قابل للتثبيت مباشرة من المتصفح:

- **Android (Chrome/Edge)**: اضغط القائمة → "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".
- **iOS (Safari)**: اضغط مشاركة → "إضافة إلى الشاشة الرئيسية".
- **Desktop (Chrome/Edge)**: أيقونة التثبيت في شريط العنوان.

يحتوي `manifest.webmanifest` على اختصارات سريعة: أذكار الصباح، المساء، المسبحة، القبلة.

---

## 🤖 بناء تطبيق Android (Capacitor)

### المتطلبات

- [Android Studio](https://developer.android.com/studio) (Hedgehog أو أحدث)
- Java JDK 17+
- Android SDK 34
- ملف `capacitor.config.ts` (موجود في جذر المشروع ✅)

### 1. تثبيت Capacitor

```bash
bun add @capacitor/core @capacitor/cli @capacitor/android \
        @capacitor/splash-screen @capacitor/status-bar \
        @capacitor/haptics @capacitor/geolocation
```

### 2. إعداد بناء ثابت (SPA prerender)

> ⚠️ **هام**: TanStack Start يبني بشكل SSR افتراضياً. لاستضافة التطبيق داخل WebView نحتاج نسخة ثابتة. أضف هذا السكربت في `package.json`:

```json
"scripts": {
  "build:mobile": "vite build --mode production && cp -r dist/client/* dist/mobile/ 2>/dev/null || true"
}
```

ثم تأكد أن `webDir` في `capacitor.config.ts` يشير إلى `dist/client`.

### 3. إضافة منصة Android

```bash
bun run build
bunx cap add android
bunx cap sync android
```

### 4. فتح المشروع في Android Studio

```bash
bunx cap open android
```

### 5. توقيع التطبيق (Keystore)

أنشئ مفتاحاً مرة واحدة (احفظه في مكان آمن):

```bash
keytool -genkey -v -keystore rafeeq-azkar.keystore \
  -alias rafeeq-azkar -keyalg RSA -keysize 2048 -validity 10000
```

أضف في `android/key.properties`:

```
storePassword=********
keyPassword=********
keyAlias=rafeeq-azkar
storeFile=../../rafeeq-azkar.keystore
```

عدّل `android/app/build.gradle` لإضافة `signingConfigs.release` (راجع [وثائق Capacitor](https://capacitorjs.com/docs/android/deploying-to-google-play)).

### 6. بناء ملف AAB للنشر على Google Play

```bash
cd android
./gradlew bundleRelease
```

الناتج: `android/app/build/outputs/bundle/release/app-release.aab`

### 7. النشر على Google Play

1. أنشئ حساب [Google Play Console](https://play.google.com/console) ($25 لمرة واحدة).
2. أنشئ تطبيقاً جديداً → ارفع `app-release.aab`.
3. املأ بطاقة المتجر، سياسة الخصوصية، تصنيف المحتوى.
4. أرسل للمراجعة (1-3 أيام عادةً).

---

## 🎨 التصميم

- **اتجاه**: Dawn Glassmorphism — درجات سماوية وبيضاء أنيقة.
- **الخطوط**: Reem Kufi (عناوين) + Noto Naskh Arabic (نصوص) + Inter (إنجليزي).
- **الألوان**: `#0c4a6e` (primary) · `#f0f9ff` (background) · `#7dd3fc` (accent).
- **الحركة**: تحريكات ناعمة (`fade-up`, `pulse-soft`) وتأثيرات ضغط (`active:scale`).

---

## 🗺 خارطة الطريق

- [x] MVP: 10 فئات أذكار، تسبيح، قبلة، مواقيت
- [x] بحث عربي ذكي
- [x] المفضلة + الإحصائيات
- [x] PWA كامل + أيقونات
- [x] إعداد Capacitor Android
- [ ] إشعارات تذكير (Service Worker + Capacitor LocalNotifications)
- [ ] صوت الأذان + اختيار المؤذن
- [ ] مزامنة سحابية (Lovable Cloud)
- [ ] إصدار Pro لإزالة الإعلانات ($3 شراء لمرة واحدة)
- [ ] نسخة iOS

---

## 📄 الترخيص

محتوى الأذكار من مصادر السنة الصحيحة (البخاري، مسلم، أبو داود، الترمذي).
الكود تحت رخصة MIT.

---

**صُنع بـ ❤️ للأمة الإسلامية.**
