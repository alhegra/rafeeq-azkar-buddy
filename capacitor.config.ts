import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.rafeeqazkar.app",
  appName: "رفيق أذكار",
  webDir: "dist/client",
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
    backgroundColor: "#F0F9FF",
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#F0F9FF",
  },
  server: {
    androidScheme: "https",
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#F0F9FF",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashImmersive: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#F0F9FF",
    },
  },
};

export default config;
