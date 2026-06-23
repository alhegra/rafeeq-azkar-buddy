# بناء تطبيق Android (APK) من GitHub Actions

يحتوي هذا المشروع على ورك‌فلو جاهز يبني ملف APK تلقائياً.

## كيف تُولّد APK

### الطريقة 1 — يدوي من GitHub
1. ادفع المشروع إلى GitHub.
2. افتح صفحة المستودع → تبويب **Actions**.
3. اختر **Build Android APK** من القائمة الجانبية.
4. اضغط **Run workflow** → فرع `main` → **Run workflow**.
5. انتظر ~٨–١٢ دقيقة. عند انتهاء البناء، حمّل ملف APK من قسم **Artifacts** أسفل الصفحة.

### الطريقة 2 — تلقائي عند إصدار نسخة
ادفع وسماً يبدأ بحرف `v` (مثل `v1.0.0`) — سيُنشئ Actions الـ APK ويرفعه تلقائياً
على صفحة Releases في المستودع:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## بناء محلي (اختياري)
يحتاج Node 20+ وJava 21 وAndroid SDK مع `ANDROID_HOME` معدّاً:

```bash
npm ci
npm install @capacitor/core @capacitor/cli @capacitor/android
npm run build:mobile
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
# الناتج: android/app/build/outputs/apk/debug/app-debug.apk
```

## ملاحظات
- الـ APK المُولَّد هو إصدار **Debug** — قابل للتثبيت مباشرة على هاتفك للتجربة.
- لإصدار **Release** موقَّع للنشر على Google Play تحتاج إلى توليد keystore وإضافته
  كسرّ في Actions (`ANDROID_KEYSTORE_BASE64` و`ANDROID_KEY_ALIAS` و`ANDROID_KEY_PASSWORD`)
  ثم تعديل خطوة Gradle لاستخدام `assembleRelease` + التوقيع.
- إشعارات الخلفية تعمل داخل APK كتطبيق محلي عبر `@capacitor/local-notifications`
  (يمكن إضافته لاحقاً للحصول على إشعارات حتى بدون اتصال أو متصفح).
