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
import { fetchCustomerBookings, fetchUnreadCounts } from "@/lib/api";
import { formatDateTime, formatTHB } from "@/lib/format";
import { useAsyncData } from "@/lib/use-async-data";
import { useAuth } from "@/providers/auth";
import { colors, font, radius, shadow, spacing } from "@/theme";

export default function BookingsScreen() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { data, loading, error, reload } = useAsyncData(async () => {
    if (!user) return { bookings: [], unread: {} as Record<string, number> };
    const bookings = await fetchCustomerBookings(user.id);
    const unread = await fetchUnreadCounts(
      bookings.map((booking) => booking.id),
      user.id,
    );
    return { bookings, unread };
  });

  if (authLoading) return <LoadingView />;
  if (!user) {
    return <Redirect href={{ pathname: "/login", params: { next: "/bookings" } }} />;
  }
  if (profile?.role === "provider") return <Redirect href="/provider" />;

  const bookings = data?.bookings ?? [];
  const unread = data?.unread ?? {};

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
                  {unread[booking.id] ? (
                    <Text style={styles.unread}>
                      {unread[booking.id]} ข้อความใหม่
                    </Text>
                  ) : null}
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
                  <View style={styles.priceWrap}>
                    <Text style={styles.price}>{formatTHB(booking.price)}</Text>
                    <Text style={styles.chevron}>→</Text>
                  </View>
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
    gap: spacing.md,
  },
  card: {
    flexDirection: "row",
    gap: spacing.md,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    padding: spacing.lg,
    ...shadow.card,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.blue50,
    borderWidth: 1,
    borderColor: colors.blue100,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 25,
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
    fontSize: 16,
    fontWeight: font.extrabold,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  unread: {
    borderRadius: radius.full,
    backgroundColor: colors.blue600,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    fontSize: 11,
    fontWeight: font.semibold,
    color: colors.white,
  },
  meta: {
    fontSize: 12,
    color: colors.slate500,
  },
  footerRow: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.slate100,
    borderStyle: "dashed",
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
  priceWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  price: {
    fontSize: 16,
    fontWeight: font.extrabold,
    color: colors.blue700,
  },
  chevron: {
    fontSize: 14,
    fontWeight: font.bold,
    color: colors.blue600,
  },
  primaryButton: {
    backgroundColor: colors.blue600,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: font.semibold,
  },
});
