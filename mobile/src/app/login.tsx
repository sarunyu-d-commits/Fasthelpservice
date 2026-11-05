import { Link, Redirect, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Logo } from "@/components/logo";
import {
  AlertBox,
  Button,
  Card,
  LoadingView,
  Screen,
  TextField,
} from "@/components/ui";
import { useAuth } from "@/providers/auth";
import { colors, font, spacing } from "@/theme";

export default function LoginScreen() {
  const { user, loading, signIn } = useAuth();
  const params = useLocalSearchParams<{ next?: string }>();
  const next =
    typeof params.next === "string" && params.next.startsWith("/")
      ? params.next
      : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingView />;
  if (user) return <Redirect href={next} />;

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.error) setError(result.error);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Logo />
        <Text style={styles.title}>ยินดีต้อนรับกลับ</Text>
        <Text style={styles.subtitle}>
          เข้าสู่ระบบเพื่อจองบริการและติดตามงาน
        </Text>
      </View>

      <Card>
        {error ? <AlertBox>{error}</AlertBox> : null}

        <TextField
          label="อีเมล"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <TextField
          label="รหัสผ่าน"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          placeholder="••••••••"
          onSubmitEditing={handleSubmit}
        />

        <Link href="/forgot-password" asChild>
          <Pressable style={styles.forgotButton}>
            <Text style={styles.forgotText}>ลืมรหัสผ่าน?</Text>
          </Pressable>
        </Link>

        <Button
          title="เข้าสู่ระบบ"
          onPress={handleSubmit}
          loading={submitting}
        />

        <Text style={styles.switchText}>
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" style={styles.switchLink}>
            สมัครสมาชิก
          </Link>
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xl,
    marginTop: spacing.xl,
  },
  title: {
    marginTop: spacing.sm,
    fontSize: 24,
    fontWeight: font.bold,
    color: colors.slate900,
  },
  subtitle: {
    fontSize: 13,
    color: colors.slate500,
    textAlign: "center",
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: spacing.md,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: font.medium,
    color: colors.teal600,
  },
  switchText: {
    marginTop: spacing.md,
    textAlign: "center",
    fontSize: 13,
    color: colors.slate500,
  },
  switchLink: {
    fontWeight: font.semibold,
    color: colors.teal600,
  },
});
