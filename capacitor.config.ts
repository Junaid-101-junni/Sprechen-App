import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.junibolitalk.app",
  appName: "Juni Boli Talk",
  webDir: "out",
  backgroundColor: "#f5f0e8",
  android: {
    backgroundColor: "#f5f0e8",
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#d4a05a",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#d4a05a",
    },
  },
};

export default config;
