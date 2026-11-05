import { Link, Redirect, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  AlertBox,
  Button,
  EmptyState,
  LoadingView,
  PageHeader,
  PaymentBadge,
  Screen,
  StatusBadge,
} from "@/components/ui";
import { fetchCustomerBookings } from "@/lib/api";
import { formatDateTime, formatTHB } from "@/lib/format";
import { useAsyncData } from "@/lib/use-async-data";
import { useAuth } from "@/providers/auth";
import { colors, font, radius, spacing } from "@/theme";

export default function BookingsScreen() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { data, loading, error, reload } = useAsyncData(() =>
    user ? fetchCustomerBookings(user.id) : Promise.resolve([]),
  );

  if (authLoading) return <LoadingView />;
  if (!user) {
    return <Redirect href={{ pathname: "/login", params: { next: "/bookings" } }} />;
  }
  if (profile?.role === "provider") return <Redirect href="/provider" />;

  const bookings = data ?? [];

  return (
    <Screen>
      <PageHeader
        title="การจองของฉัน"
        subtitle="ติดตามสถานะงานและชำระเงินได้ที่นี่"
        right={
          <Button
            title="จองใหม่"
            variant="secondary"
            onPress={() => router.push("/services")}
          />
        }
      />

      {error ? (
        <AlertBox>
          {error}{" "}
          <Text style={styles.retry} onPress={() => void reload()}>
            ลองใหม่
          </Text>
        </AlertBox>
      ) : null}

      {loading && bookings.length === 0 ? (
        <LoadingView />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="📅"
          title="ยังไม่มีการจอง"
          description="เลือกบริการที่ต้องการ แล้วนัดหมายช่างได้เลย"
          action={
            <Link href="/services" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>ดูบริการทั้งหมด</Text>
              </Pressable>
            </Link>
          }
        />
      ) : (
        <View style={styles.list}>
          {bookings.map((booking) => (
            <Pressable
              key={booking.id}
              onPress={() => router.push(`/bookings/${booking.id}`)}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.iconWrap}>
                <Text style={styles.icon}>{booking.service?.icon ?? "🛠️"}</Text>
              </View>
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={1}>
                    {booking.service?.name ?? "บริการ"}
                  </Text>
                  <StatusBadge status={booking.status} />
                  <PaymentBadge status={booking.payment_status} />
                </View>
                <Text style={styles.meta}>
                  📅 {formatDateTime(booking.scheduled_at)}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  📍 {booking.address}
                </Text>
                <View style={styles.footerRow}>
                  <Text style={styles.provider} numberOfLines={1}>
                    {booking.provider?.full_name
                      ? `ช่าง: ${booking.provider.full_name}`
                      : "รอช่างรับงาน"}
                  </Text>
                  <Text style={styles.price}>{formatTHB(booking.price)}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  retry: {
    fontWeight: font.semibold,
    textDecorationLine: "underline",
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: "row",
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.teal50,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 24,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: font.semibold,
    color: colors.slate900,
  },
  meta: {
    fontSize: 12,
    color: colors.slate500,
  },
  footerRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  provider: {
    flex: 1,
    fontSize: 11,
    color: colors.slate400,
  },
  price: {
    fontSize: 15,
    fontWeight: font.bold,
    color: colors.teal700,
  },
  primaryButton: {
    backgroundColor: colors.teal600,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: font.semibold,
  },
});
