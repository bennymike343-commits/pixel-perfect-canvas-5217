import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.josppygadgets.app",
  appName: "JOSPPY GADGETS",
  // TanStack Start / Nitro client build output — loaded locally by the Android WebView.
  webDir: ".output/public",
  // No server.url: the app must NOT depend on a remote Nitro server to launch.
  android: {
    allowMixedContent: false,
  },
};

export default config;
