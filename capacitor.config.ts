import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl =
  process.env.CAPACITOR_SERVER_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://fasthelp.example.com";

const config: CapacitorConfig = {
  appId: "com.fasthelp.app",
  appName: "FastHelp",
  webDir: "public",
  server: {
    url: serverUrl,
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
