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
import type { Role } from "@/lib/types";
import { useAuth } from "@/providers/auth";
import { colors, font, radius, spacing } from "@/theme";

export default function RegisterScreen() {
  const { user, loading, signUp } = useAuth();
  const params = useLocalSearchParams<{ role?: string }>();
  const initialRole: Role = params.role === "provider" ? "provider" : "customer";

  const [role, setRole] = useState<Role>(initialRole);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingView />;
  if (user) {
    return <Redirect href={role === "provider" ? "/provider" : "/"} />;
  }

  async function handleSubmit() {
    setError(null);
    setMessage(null);
    setSubmitting(true);
    const result = await signUp({
      fullName,
      email,
      phone,
      password,
      role,
    });
    setSubmitting(false);
    if (result.error) setError(result.error);
    if (result.message) setMessage(result.message);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Logo />
        <Text style={styles.title}>สร้างบัญชีใหม่</Text>
        <Text style={styles.subtitle}>
          เริ่มใช้งาน FastHelp ได้ฟรี ไม่มีค่าสมัคร
        </Text>
      </View>

      <Card>
        {error ? <AlertBox>{error}</AlertBox> : null}
        {message ? <AlertBox tone="success">{message}</AlertBox> : null}

        <Text style={styles.label}>สมัครในฐานะ</Text>
        <View style={styles.roleRow}>
          {(["customer", "provider"] as Role[]).map((value) => {
            const active = role === value;
            const label = value === "customer" ? "ลูกค้า" : "ผู้ให้บริการ";
            const description =
              value === "customer" ? "เรียกใช้บริการ" : "รับงาน/เป็นช่าง";
            return (
              <Pressable
                key={value}
                onPress={() => setRole(value)}
                style={[styles.roleCard, active && styles.roleCardActive]}
              >
                <Text style={styles.roleTitle}>{label}</Text>
                <Text style={styles.roleDescription}>{description}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextField
          label="ชื่อ-นามสกุล"
          value={fullName}
          onChangeText={setFullName}
          placeholder="สมชาย ใจดี"
        />
        <TextField
          label="เบอร์โทรศัพท์"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="0812345678"
        />
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
          autoComplete="new-password"
          placeholder="อย่างน้อย 6 ตัวอักษร"
        />

        <Button
          title="สมัครสมาชิก"
          onPress={handleSubmit}
          loading={submitting}
        />

        <Text style={styles.switchText}>
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" style={styles.switchLink}>
            เข้าสู่ระบบ
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
  label: {
    fontSize: 13,
    fontWeight: font.semibold,
    color: colors.slate700,
    marginBottom: spacing.sm,
  },
  roleRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  roleCard: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    padding: spacing.md,
    gap: 2,
  },
  roleCardActive: {
    borderColor: colors.teal600,
    backgroundColor: colors.teal50,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: font.semibold,
    color: colors.slate900,
  },
  roleDescription: {
    fontSize: 11,
    color: colors.slate500,
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
