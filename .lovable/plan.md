
## الهدف
جعل التذكيرات تظهر حتى لو التطبيق "مقفول تماماً" — وهذا يتطلب تثبيت التطبيق كـ **PWA** مع **Service Worker** يعمل في الخلفية، بالإضافة إلى استخدام **Web Push** للإشعارات الحقيقية على iOS/Android.

## الواقع التقني (مهم جداً)
لتمكين الإشعارات والتطبيق "مغلق فعلاً":
1. **التثبيت كـ PWA إلزامي** — على iOS خاصةً، الإشعارات لا تعمل إلا بعد "Add to Home Screen".
2. **Service Worker** ضروري لاستقبال الإشعارات في الخلفية.
3. **خياران للجدولة الزمنية:**
   - **(أ) Local Notifications داخل Service Worker** عبر `setTimeout` + `showNotification` — يعمل طالما المتصفح/النظام لم يقتل الـ SW (موثوق على Android، أقل موثوقية على iOS بعد فترة طويلة).
   - **(ب) Web Push حقيقي** عبر خادم يرسل Push messages — يعمل 100% حتى لو التطبيق ميت تماماً، لكنه يتطلب backend + VAPID keys + تخزين subscriptions.

سأبدأ بـ **(أ)** لأنها تغطي 95% من حالات الاستخدام بدون backend، ثم نضيف **(ب)** لاحقاً إذا احتجنا الموثوقية الكاملة على iOS.

## الخطوات

### 1) إعداد PWA كامل
- إنشاء `public/manifest.webmanifest` بـ `display: "standalone"`, `start_url`, `scope`, `theme_color`, `background_color`, مع روابط أيقونات (192, 512, maskable).
- إنشاء أيقونات PWA في `public/icons/` (سأولّدها).
- إضافة وسوم `<link rel="manifest">`, `<meta name="theme-color">`, `<link rel="apple-touch-icon">` في `__root.tsx`.

### 2) Service Worker موثوق (`public/sw.js`)
- يستمع لحدث `notificationclick` ويفتح التطبيق على المسار المناسب.
- يستمع لرسائل من الصفحة (`message` event) لجدولة تذكيرات داخلية.
- يحتفظ بقائمة تذكيرات في `IndexedDB` (يبقى حتى بعد إغلاق المتصفح).
- يستخدم **Periodic Background Sync** عندما يكون متاحاً (Android/Chrome) لإعادة جدولة التذكيرات.
- يستخدم **`registration.showNotification`** لإظهار الإشعار الفعلي (يعمل حتى والتطبيق مغلق).

### 3) Wrapper تسجيل آمن للمعاينة
- ملف `src/lib/sw-register.ts` يرفض التسجيل في:
  - dev mode
  - iframe (معاينة Lovable)
  - hostnames تبدأ بـ `id-preview--` / `preview--` / `*.lovableproject.com`
- في حال الرفض، يُلغي تسجيل أي SW موجود سابقاً.
- التسجيل يتم فقط في الإنتاج المنشور.

### 4) ربط التذكيرات الحالية بـ SW
- تحديث `src/hooks/use-reminders.ts` ليرسل قائمة التذكيرات إلى SW عبر `postMessage`.
- SW يجدول كل تذكير بـ `setTimeout` ويخزنها في IndexedDB.
- عند إعادة فتح التطبيق، تُعاد المزامنة تلقائياً.
- تغطية: تذكيرات الصلاة + أذكار الصباح/المساء + الذكر الجانبي (AmbientZikr).

### 5) شاشة "تثبيت التطبيق"
- عرض زر "ثبّت التطبيق" في الإعدادات + بانر لطيف في الصفحة الرئيسية عند اكتشاف `beforeinstallprompt`.
- على iOS: شرح بصري مختصر (مشاركة → إضافة إلى الشاشة الرئيسية) لأن iOS لا يدعم prompt تلقائي.
- بعد التثبيت، طلب إذن الإشعارات.

### 6) إعدادات إضافية
- مفتاح "تذكيرات الخلفية" في الإعدادات.
- اختبار زر "أرسل تذكيراً تجريبياً الآن" للتأكد من عمل الإشعارات.

## ملفات ستُنشأ/تُعدّل
- جديد: `public/manifest.webmanifest`, `public/sw.js`, `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable.png`
- جديد: `src/lib/sw-register.ts`, `src/lib/reminders-bridge.ts`
- تعديل: `src/routes/__root.tsx` (head tags + استدعاء التسجيل)
- تعديل: `src/hooks/use-reminders.ts` (الإرسال إلى SW)
- تعديل: `src/components/ambient-zikr.tsx` (الإرسال إلى SW بدل setTimeout داخلي)
- تعديل: `src/routes/settings.tsx` (زر التثبيت + اختبار الإشعار)
- تعديل: `src/lib/i18n.ts` (نصوص جديدة)

## ملاحظات صريحة للمستخدم
- **iOS 16.4+** فقط يدعم إشعارات PWA، ولا بد من التثبيت أولاً من Safari.
- **Android/Chrome** يعمل بشكل ممتاز بعد التثبيت.
- في **معاينة Lovable داخل الـ iframe** الإشعارات لن تعمل — يجب فتح الرابط المنشور في تبويب جديد وتثبيته.
- جدولة `setTimeout` داخل SW قد يوقفها النظام بعد ساعات طويلة من الخمول؛ لذلك التطبيق يعيد الجدولة عند كل فتح، وإذا أردت موثوقية مطلقة نضيف Web Push بـ backend لاحقاً.

هل أبدأ التنفيذ؟
