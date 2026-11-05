import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import "react-native-url-polyfill/auto";
import { StyleSheet, Text, View } from "react-native";

import { AlertBox, Button, LoadingView, Screen } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { colors, font, spacing } from "@/theme";

export default function AuthCallbackScreen() {
  const url = Linking.useURL();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    if (!url || handled) return;

    const currentUrl = url;
    let cancelled = false;

    async function complete() {
      const hashIndex = currentUrl.indexOf("#");
      const hash = hashIndex >= 0 ? currentUrl.slice(hashIndex + 1) : "";
      const query = currentUrl.split("?")[1]?.split("#")[0] ?? "";
      const params = new URLSearchParams(hash || query);

      const code = params.get("code");
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");
      const next = params.get("next");

      try {
        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
        } else {
          throw new Error("ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุแล้ว");
        }

        if (cancelled) return;
        setHandled(true);
        const target =
          type === "recovery" || next === "/reset-password"
            ? "/reset-password"
            : next && next.startsWith("/")
              ? next
              : "/";
        router.replace(target);
      } catch (err) {
        if (cancelled) return;
        setHandled(true);
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    void complete();

    return () => {
      cancelled = true;
    };
  }, [url, handled, router]);

  if (!error) return <LoadingView label="กำลังยืนยันลิงก์..." />;

  return (
    <Screen>
      <View style={styles.wrap}>
        <Text style={styles.title}>ยืนยันลิงก์ไม่สำเร็จ</Text>
        <AlertBox>{error}</AlertBox>
        <Button
          title="กลับไปเข้าสู่ระบบ"
          onPress={() => router.replace("/login")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: font.bold,
    color: colors.slate900,
    textAlign: "center",
  },
});
