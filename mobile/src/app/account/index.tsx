import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  AlertBox,
  Button,
  Card,
  LoadingView,
  Screen,
  TextField,
} from "@/components/ui";
import { updateProfile } from "@/lib/api";
import { ROLE_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/providers/auth";
import { colors, font, radius, spacing } from "@/theme";

function AccountForm({
  userId,
  initialName,
  initialPhone,
  onSaved,
}: {
  userId: string;
  initialName: string;
  initialPhone: string;
  onSaved: () => Promise<void> | void;
}) {
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setMessage(null);
    if (!fullName.trim()) {
      setError("กรุณากรอกชื่อ-นามสกุล");
      return;
    }
    setSaving(true);
    const result = await updateProfile(userId, fullName.trim(), phone.trim());
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
    await onSaved();
  }

  return (
    <View style={styles.form}>
      {error ? <AlertBox>{error}</AlertBox> : null}
      {message ? <AlertBox tone="success">{message}</AlertBox> : null}
      <TextField
        label="ชื่อ-นามสกุล"
        value={fullName}
        onChangeText={setFullName}
        placeholder="ชื่อของคุณ"
        autoCapitalize="words"
      />
      <TextField
        label="เบอร์โทรศัพท์"
        value={phone}
        onChangeText={setPhone}
        placeholder="08xxxxxxxx"
        keyboardType="phone-pad"
      />
      <Button title="บันทึกข้อมูล" onPress={handleSave} loading={saving} />
    </View>
  );
}

function PasswordForm() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setMessage(null);
    if (password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (password !== confirm) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }
    setSaving(true);
    const result = await updatePassword(password, confirm);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setPassword("");
    setConfirm("");
    setMessage(result.message ?? "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
  }

  return (
    <View style={styles.form}>
      {error ? <AlertBox>{error}</AlertBox> : null}
      {message ? <AlertBox tone="success">{message}</AlertBox> : null}
      <TextField
        label="รหัสผ่านใหม่"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="อย่างน้อย 8 ตัวอักษร"
        autoCapitalize="none"
      />
      <TextField
        label="ยืนยันรหัสผ่านใหม่"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        placeholder="กรอกรหัสผ่านอีกครั้ง"
        autoCapitalize="none"
      />
      <Button
        title="เปลี่ยนรหัสผ่าน"
        variant="secondary"
        onPress={handleSave}
        loading={saving}
      />
    </View>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const { user, profile, loading, signOut, refreshProfile } = useAuth();

  if (loading) return <LoadingView />;
  if (!user) {
    return (
      <Redirect href={{ pathname: "/login", params: { next: "/account" } }} />
    );
  }

  const displayName = profile?.full_name || user.email || "ผู้ใช้";
  const roleLabel = ROLE_LABEL[profile?.role ?? "customer"] ?? "ลูกค้า";

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerBody}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
        </View>
      </View>

      <Card style={styles.gap}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>เบอร์โทรศัพท์</Text>
          <Text style={styles.metaValue}>{profile?.phone || "ยังไม่ระบุ"}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>สมาชิกตั้งแต่</Text>
          <Text style={styles.metaValue}>
            {profile?.created_at ? formatDate(profile.created_at) : "-"}
          </Text>
        </View>
      </Card>

      {profile?.role === "provider" ? (
        <Card style={styles.gap}>
          <Text style={styles.sectionTitle}>สำหรับช่าง</Text>
          <Button
            title="แดชบอร์ดช่าง"
            variant="secondary"
            onPress={() => router.push("/provider")}
          />
          <Button
            title="แก้ไขโปรไฟล์ช่าง"
            variant="ghost"
            onPress={() => router.push("/provider/profile")}
          />
        </Card>
      ) : null}

      {profile?.role === "admin" ? (
        <Card style={styles.gap}>
          <Text style={styles.sectionTitle}>สำหรับผู้ดูแล</Text>
          <Button
            title="หน้าผู้ดูแลระบบ"
            variant="secondary"
            onPress={() => router.push("/admin")}
          />
        </Card>
      ) : null}

      <Card style={styles.gap}>
        <Text style={styles.sectionTitle}>ข้อมูลส่วนตัว</Text>
        <AccountForm
          key={`${user.id}:${profile?.full_name ?? ""}:${profile?.phone ?? ""}`}
          userId={user.id}
          initialName={profile?.full_name ?? ""}
          initialPhone={profile?.phone ?? ""}
          onSaved={refreshProfile}
        />
      </Card>

      <Card style={styles.gap}>
        <Text style={styles.sectionTitle}>ความปลอดภัย</Text>
        <PasswordForm />
      </Card>

      <Pressable onPress={handleSignOut} style={styles.signOut}>
        <Text style={styles.signOutText}>ออกจากระบบ</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.blue100,
    backgroundColor: colors.blue50,
    padding: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.blue600,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: font.extrabold,
    color: colors.white,
  },
  headerBody: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 21,
    fontWeight: font.extrabold,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  email: {
    fontSize: 13,
    color: colors.slate500,
  },
  roleBadge: {
    alignSelf: "flex-start",
    marginTop: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.blue200,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  roleText: {
    fontSize: 11,
    fontWeight: font.semibold,
    color: colors.blue700,
  },
  gap: {
    marginTop: spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  metaLabel: {
    fontSize: 13,
    color: colors.slate500,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: font.semibold,
    color: colors.ink,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: font.extrabold,
    letterSpacing: -0.2,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  form: {
    gap: spacing.sm,
  },
  signOut: {
    marginTop: spacing.xl,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.rose200,
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  signOutText: {
    fontSize: 14,
    fontWeight: font.semibold,
    color: colors.rose600,
  },
});
