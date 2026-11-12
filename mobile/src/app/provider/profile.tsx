import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import {
  AlertBox,
  Button,
  Card,
  LoadingView,
  Screen,
  TextField,
} from "@/components/ui";
import {
  fetchProviderProfile,
  fetchProviderServiceIds,
  fetchServices,
  saveProviderProfile,
} from "@/lib/api";
import type { ProviderProfile, Service } from "@/lib/types";
import { useAsyncData } from "@/lib/use-async-data";
import { useAuth } from "@/providers/auth";
import { colors, font, radius, spacing } from "@/theme";

function ProviderProfileForm({
  userId,
  services,
  provider,
  selectedServiceIds,
}: {
  userId: string;
  services: Service[];
  provider: ProviderProfile | null;
  selectedServiceIds: string[];
}) {
  const [bio, setBio] = useState(provider?.bio ?? "");
  const [serviceArea, setServiceArea] = useState(provider?.service_area ?? "");
  const [years, setYears] = useState(
    String(provider?.years_experience ?? 0),
  );
  const [isAvailable, setIsAvailable] = useState(
    provider?.is_available ?? true,
  );
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(selectedServiceIds),
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function toggleService(serviceId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });
  }

  async function handleSave() {
    setError(null);
    setMessage(null);
    setSaving(true);
    const parsedYears = Number.parseInt(years, 10);
    const result = await saveProviderProfile({
      id: userId,
      bio,
      serviceArea,
      yearsExperience: Number.isFinite(parsedYears) ? parsedYears : 0,
      isAvailable,
      serviceIds: services
        .filter((service) => selected.has(service.id))
        .map((service) => service.id),
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setMessage("บันทึกโปรไฟล์เรียบร้อยแล้ว");
  }

  return (
    <View style={styles.form}>
      {error ? <AlertBox>{error}</AlertBox> : null}
      {message ? <AlertBox tone="success">{message}</AlertBox> : null}

      <TextField
        label="แนะนำตัว"
        value={bio}
        onChangeText={setBio}
        placeholder="เล่าประสบการณ์และความถนัดของคุณ"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        style={styles.multiline}
      />

      <TextField
        label="พื้นที่ให้บริการ"
        value={serviceArea}
        onChangeText={setServiceArea}
        placeholder="เช่น กรุงเทพฯ, นนทบุรี"
      />

      <TextField
        label="ประสบการณ์ (ปี)"
        value={years}
        onChangeText={setYears}
        keyboardType="number-pad"
        placeholder="0"
      />

      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <Text style={styles.switchTitle}>เปิดรับงานใหม่</Text>
          <Text style={styles.switchHint}>
            ปิดไว้ชั่วคราวเมื่อไม่สะดวกรับงาน
          </Text>
        </View>
        <Switch
          value={isAvailable}
          onValueChange={setIsAvailable}
          trackColor={{ false: colors.slate300, true: colors.blue600 }}
          thumbColor={colors.white}
        />
      </View>

      <Text style={styles.label}>บริการที่ให้</Text>
      <View style={styles.services}>
        {services.map((service) => {
          const active = selected.has(service.id);
          return (
            <Pressable
              key={service.id}
              onPress={() => toggleService(service.id)}
              style={[styles.serviceItem, active && styles.serviceItemActive]}
            >
              <View
                style={[styles.checkbox, active && styles.checkboxActive]}
              >
                <Text style={styles.checkboxText}>{active ? "✓" : ""}</Text>
              </View>
              <Text style={styles.serviceIcon}>{service.icon ?? "🛠️"}</Text>
              <Text style={styles.serviceName}>{service.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Button title="บันทึกโปรไฟล์" onPress={handleSave} loading={saving} />
    </View>
  );
}

export default function ProviderProfileScreen() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const { data, loading } = useAsyncData(async () => {
    if (!user) return null;
    const [services, provider, selectedServiceIds] = await Promise.all([
      fetchServices(),
      fetchProviderProfile(user.id),
      fetchProviderServiceIds(user.id),
    ]);
    return { services, provider, selectedServiceIds };
  });

  if (authLoading) return <LoadingView />;
  if (!user) {
    return (
      <Redirect
        href={{ pathname: "/login", params: { next: "/provider/profile" } }}
      />
    );
  }
  if (profile?.role !== "provider") return <Redirect href="/bookings" />;
  if (loading || !data) return <LoadingView />;

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>‹ กลับไปแดชบอร์ด</Text>
      </Pressable>

      <Text style={styles.title}>โปรไฟล์ผู้ให้บริการ</Text>
      <Text style={styles.subtitle}>
        ข้อมูลนี้จะแสดงให้ลูกค้าเห็นเมื่อคุณรับงาน
      </Text>

      <Card style={styles.gap}>
        <ProviderProfileForm
          userId={user.id}
          services={data.services}
          provider={data.provider}
          selectedServiceIds={data.selectedServiceIds}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: "flex-start",
    marginBottom: spacing.md,
  },
  backText: {
    fontSize: 13,
    fontWeight: font.medium,
    color: colors.slate500,
  },
  title: {
    fontSize: 26,
    fontWeight: font.extrabold,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 19,
    color: colors.slate500,
  },
  gap: {
    marginTop: spacing.lg,
  },
  form: {
    gap: spacing.sm,
  },
  multiline: {
    minHeight: 84,
    paddingTop: spacing.md,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.slate50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  switchText: {
    flex: 1,
    gap: 1,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: font.semibold,
    color: colors.ink,
  },
  switchHint: {
    fontSize: 11,
    color: colors.slate500,
  },
  label: {
    fontSize: 13,
    fontWeight: font.semibold,
    color: colors.slate700,
    marginTop: spacing.sm,
  },
  services: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  serviceItemActive: {
    borderColor: colors.blue600,
    backgroundColor: colors.blue50,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm - 2,
    borderWidth: 1,
    borderColor: colors.slate300,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: colors.blue600,
    borderColor: colors.blue600,
  },
  checkboxText: {
    fontSize: 12,
    fontWeight: font.bold,
    color: colors.white,
  },
  serviceIcon: {
    fontSize: 17,
  },
  serviceName: {
    flex: 1,
    fontSize: 14,
    fontWeight: font.medium,
    color: colors.ink,
  },
});
