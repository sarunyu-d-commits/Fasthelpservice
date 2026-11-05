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

export default function ResetPasswordScreen() {
  const { user, loading, updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingView />;
  if (!user) return <Redirect href="/forgot-password" />;

  async function handleSubmit() {
    setError(null);
    setMessage(null);
    setSubmitting(true);
    const result = await updatePassword(password, confirmPassword);
    setSubmitting(false);
    if (result.error) setError(result.error);
    if (result.message) setMessage(result.message);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Logo />
        <Text style={styles.title}>ตั้งรหัสผ่านใหม่</Text>
        <Text style={styles.subtitle}>
          กำหนดรหัสผ่านใหม่สำหรับบัญชี {user.email}
        </Text>
      </View>

      <Card>
        {error ? <AlertBox>{error}</AlertBox> : null}
        {message ? (
          <AlertBox tone="success">
            {message}{" "}
            <Link href="/account" style={styles.link}>
              ไปที่บัญชีของฉัน
            </Link>
          </AlertBox>
        ) : null}

        <TextField
          label="รหัสผ่านใหม่"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          placeholder="อย่างน้อย 6 ตัวอักษร"
        />
        <TextField
          label="ยืนยันรหัสผ่านใหม่"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoComplete="new-password"
          placeholder="กรอกรหัสผ่านอีกครั้ง"
          onSubmitEditing={handleSubmit}
        />

        <Button
          title="บันทึกรหัสผ่านใหม่"
          onPress={handleSubmit}
          loading={submitting}
        />
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
  link: {
    fontWeight: font.semibold,
    textDecorationLine: "underline",
  },
});
