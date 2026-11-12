import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  AlertBox,
  Button,
  Card,
  EmptyState,
  LoadingView,
  Screen,
  StatusBadge,
} from "@/components/ui";
import {
  fetchAllProviders,
  fetchAllServices,
  fetchRecentBookings,
  setProviderVerified,
  setServiceActive,
} from "@/lib/api";
import { formatDateTime, formatTHB } from "@/lib/format";
import { useAsyncData } from "@/lib/use-async-data";
import { useAuth } from "@/providers/auth";
import { colors, font, radius, shadow, spacing } from "@/theme";

export default function AdminScreen() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { data, loading, error: loadError, reload } = useAsyncData(async () => {
    if (!user) return null;
    const [providers, services, bookings] = await Promise.all([
      fetchAllProviders(),
      fetchAllServices(),
      fetchRecentBookings(10),
    ]);
    return { providers, services, bookings };
  });

  if (authLoading) return <LoadingView />;
  if (!user) {
    return (
      <Redirect href={{ pathname: "/login", params: { next: "/admin" } }} />
    );
  }
  if (profile?.role !== "admin") return <Redirect href="/account" />;
  if (loading || !data) return <LoadingView />;

  const { providers, services, bookings } = data;
  const verifiedCount = providers.filter((provider) => provider.is_verified).length;
  const activeServiceCount = services.filter((service) => service.is_active).length;

  async function handleVerify(providerId: string, next: boolean) {
    setBusyKey(`provider-${providerId}`);
    setError(null);
    setMessage(null);
    const result = await setProviderVerified(providerId, next);
    setBusyKey(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setMessage("อัปเดตสถานะผู้ให้บริการแล้ว");
    await reload();
  }

  async function handleToggleService(serviceId: string, next: boolean) {
    setBusyKey(`service-${serviceId}`);
    setError(null);
    setMessage(null);
    const result = await setServiceActive(serviceId, next);
    setBusyKey(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setMessage("อัปเดตสถานะบริการแล้ว");
    await reload();
  }

  return (
    <Screen>
      <Text style={styles.title}>🛡️ ผู้ดูแลระบบ</Text>
      <Text style={styles.subtitle}>
        ตรวจสอบช่าง ยืนยันตัวตน และจัดการบริการในระบบ
      </Text>

      {error || loadError ? <AlertBox>{error ?? loadError}</AlertBox> : null}
      {message ? <AlertBox tone="success">{message}</AlertBox> : null}

      <View style={styles.statsGrid}>
        {[
          { label: "ช่างทั้งหมด", value: providers.length },
          { label: "ยืนยันแล้ว", value: verifiedCount },
          { label: "บริการทั้งหมด", value: services.length },
          { label: "บริการเปิดใช้", value: activeServiceCount },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>ผู้ให้บริการ</Text>
      {providers.length === 0 ? (
        <EmptyState title="ยังไม่มีผู้ให้บริการในระบบ" />
      ) : (
        <View style={styles.list}>
          {providers.map((provider) => (
            <Card key={provider.id}>
              <View style={styles.providerHeader}>
                <View style={styles.providerBody}>
                  <Text style={styles.providerName}>
                    {provider.profile?.full_name || "ไม่ระบุชื่อ"}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {provider.profile?.phone || "ไม่มีเบอร์โทร"} ·{" "}
                    {provider.service_area || "ไม่ระบุพื้นที่"}
                  </Text>
                  <Text style={styles.metaSmall}>
                    ⭐ {provider.rating_avg.toFixed(1)} ({provider.rating_count}) ·{" "}
                    {provider.is_available ? "เปิดรับงาน" : "ปิดรับงาน"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.verifyBadge,
                    provider.is_verified
                      ? styles.verifyBadgeOn
                      : styles.verifyBadgeOff,
                  ]}
                >
                  <Text
                    style={[
                      styles.verifyBadgeText,
                      provider.is_verified
                        ? styles.verifyBadgeTextOn
                        : styles.verifyBadgeTextOff,
                    ]}
                  >
                    {provider.is_verified ? "ยืนยันแล้ว" : "รอยืนยัน"}
                  </Text>
                </View>
              </View>
              <Button
                title={
                  provider.is_verified ? "ยกเลิกการยืนยัน" : "ยืนยันช่าง"
                }
                variant={provider.is_verified ? "secondary" : "primary"}
                onPress={() =>
                  handleVerify(provider.id, !provider.is_verified)
                }
                loading={busyKey === `provider-${provider.id}`}
              />
            </Card>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>บริการ</Text>
      <Card>
        {services.map((service) => (
          <View key={service.id} style={styles.serviceRow}>
            <View style={styles.serviceBody}>
              <Text style={styles.serviceName} numberOfLines={1}>
                {service.icon ?? "🛠️"} {service.name}
              </Text>
              <Text style={styles.metaSmall} numberOfLines={1}>
                {service.category} · {formatTHB(service.base_price)} /{" "}
                {service.unit}
              </Text>
            </View>
            <Pressable
              onPress={() =>
                handleToggleService(service.id, !service.is_active)
              }
              disabled={busyKey === `service-${service.id}`}
              style={[
                styles.toggleButton,
                service.is_active
                  ? styles.toggleButtonOff
                  : styles.toggleButtonOn,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  service.is_active
                    ? styles.toggleTextOff
                    : styles.toggleTextOn,
                ]}
              >
                {busyKey === `service-${service.id}`
                  ? "..."
                  : service.is_active
                    ? "ปิดใช้งาน"
                    : "เปิดใช้งาน"}
              </Text>
            </Pressable>
          </View>
        ))}
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>การจองล่าสุด</Text>
        <Pressable onPress={() => router.push("/bookings")}>
          <Text style={styles.link}>ดูทั้งหมด</Text>
        </Pressable>
      </View>
      {bookings.length === 0 ? (
        <EmptyState title="ยังไม่มีการจอง" />
      ) : (
        <View style={styles.list}>
          {bookings.map((booking) => (
            <Pressable
              key={booking.id}
              onPress={() => router.push(`/bookings/${booking.id}`)}
              style={({ pressed }) => [
                styles.bookingRow,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.bookingBody}>
                <Text style={styles.bookingTitle} numberOfLines={1}>
                  {booking.service?.icon ?? "🛠️"}{" "}
                  {booking.service?.name ?? "บริการ"}
                </Text>
                <Text style={styles.metaSmall} numberOfLines={1}>
                  {booking.customer?.full_name || "ลูกค้า"} ·{" "}
                  {formatDateTime(booking.scheduled_at)} ·{" "}
                  {formatTHB(booking.price)}
                </Text>
              </View>
              <StatusBadge status={booking.status} />
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  statCard: {
    width: "48%",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.blue100,
    backgroundColor: colors.blue50,
    padding: spacing.md,
  },
  statLabel: {
    fontSize: 12,
    color: colors.slate500,
  },
  statValue: {
    marginTop: 2,
    fontSize: 25,
    fontWeight: font.extrabold,
    color: colors.ink,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    fontSize: 19,
    fontWeight: font.extrabold,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  link: {
    fontSize: 13,
    fontWeight: font.semibold,
    color: colors.blue700,
  },
  list: {
    gap: spacing.md,
  },
  providerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  providerBody: {
    flex: 1,
    gap: 2,
  },
  providerName: {
    fontSize: 16,
    fontWeight: font.extrabold,
    color: colors.ink,
  },
  meta: {
    fontSize: 12,
    color: colors.slate500,
  },
  metaSmall: {
    fontSize: 11,
    color: colors.slate500,
  },
  verifyBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  verifyBadgeOn: {
    backgroundColor: colors.sky50,
  },
  verifyBadgeOff: {
    backgroundColor: colors.amber50,
  },
  verifyBadgeText: {
    fontSize: 11,
    fontWeight: font.semibold,
  },
  verifyBadgeTextOn: {
    color: colors.sky700,
  },
  verifyBadgeTextOff: {
    color: colors.amber700,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
  },
  serviceBody: {
    flex: 1,
    gap: 2,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: font.semibold,
    color: colors.ink,
  },
  toggleButton: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  toggleButtonOn: {
    backgroundColor: colors.blue600,
    borderColor: colors.blue600,
  },
  toggleButtonOff: {
    backgroundColor: colors.white,
    borderColor: colors.slate200,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: font.semibold,
  },
  toggleTextOn: {
    color: colors.white,
  },
  toggleTextOff: {
    color: colors.slate600,
  },
  bookingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...shadow.card,
  },
  pressed: {
    opacity: 0.9,
  },
  bookingBody: {
    flex: 1,
    gap: 2,
  },
  bookingTitle: {
    fontSize: 15,
    fontWeight: font.extrabold,
    color: colors.ink,
  },
});
