import { Link, Redirect } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

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

export default function ForgotPasswordScreen() {
  const { user, loading, requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingView />;
  if (user) return <Redirect href="/account" />;

  async function handleSubmit() {
    setError(null);
    setMessage(null);
    if (!email.trim()) {
      setError("กรุณากรอกอีเมลที่ใช้สมัคร");
      return;
    }
    setSubmitting(true);
    const result = await requestPasswordReset(email);
    setSubmitting(false);
    if (result.error) setError(result.error);
    if (result.message) setMessage(result.message);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Logo />
        <Text style={styles.title}>ลืมรหัสผ่าน</Text>
        <Text style={styles.subtitle}>
          กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้
        </Text>
      </View>

      <Card>
        {error ? <AlertBox>{error}</AlertBox> : null}
        {message ? <AlertBox tone="success">{message}</AlertBox> : null}

        <TextField
          label="อีเมลที่ใช้สมัคร"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="you@example.com"
          onSubmitEditing={handleSubmit}
        />

        <Button
          title="ส่งลิงก์รีเซ็ตรหัสผ่าน"
          onPress={handleSubmit}
          loading={submitting}
        />

        <Text style={styles.switchText}>
          จำรหัสผ่านได้แล้ว?{" "}
          <Link href="/login" style={styles.switchLink}>
            กลับไปเข้าสู่ระบบ
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
    lineHeight: 19,
    color: colors.slate500,
    textAlign: "center",
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
