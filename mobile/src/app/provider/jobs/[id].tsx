import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { ChatBox } from "@/components/chat-box";
import {
  AlertBox,
  Button,
  Card,
  EmptyState,
  LoadingView,
  PaymentBadge,
  Screen,
  StatusBadge,
} from "@/components/ui";
import {
  fetchBookingById,
  fetchMessages,
  updateBookingStatus,
} from "@/lib/api";
import { formatDateTime, formatTHB } from "@/lib/format";
import { useAsyncData } from "@/lib/use-async-data";
import { useAuth } from "@/providers/auth";
import { colors, font, radius, spacing } from "@/theme";

export default function ProviderJobScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === "string" ? params.id : "";
  const { user, profile, loading: authLoading } = useAuth();
  const [actionError, setActionError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, loading, error, reload } = useAsyncData(async () => {
    if (!user) return null;
    const booking = await fetchBookingById(id);
    if (!booking) return null;
    const messages = await fetchMessages(id);
    return { booking, messages };
  });

  if (authLoading) return <LoadingView />;
  if (!user) {
    return (
      <Redirect
        href={{ pathname: "/login", params: { next: `/provider/jobs/${id}` } }}
      />
    );
  }
  if (profile?.role !== "provider") return <Redirect href="/bookings" />;
  if (loading || !data) return <LoadingView />;

  const { booking, messages } = data;

  if (booking.provider_id !== user.id) {
    return (
      <Screen>
        <EmptyState
          icon="🚫"
          title="ไม่พบงานนี้ในรายการของคุณ"
          description="คุณสามารถดูงานที่คุณรับไว้ได้จากแดชบอร์ดช่าง"
          action={
            <Button
              title="กลับไปแดชบอร์ด"
              onPress={() => router.replace("/provider")}
            />
          }
        />
      </Screen>
    );
  }

  async function handleStatus(status: "in_progress" | "completed") {
    setBusy(true);
    setActionError(null);
    const result = await updateBookingStatus(booking.id, status);
    setBusy(false);
    if (result.error) {
      setActionError(result.error);
      return;
    }
    setMessage(
      status === "in_progress" ? "เริ่มให้บริการแล้ว" : "ปิดงานเรียบร้อยแล้ว",
    );
    await reload();
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>‹ กลับไปแดชบอร์ด</Text>
      </Pressable>

      {error ? <AlertBox>{error}</AlertBox> : null}
      {actionError ? <AlertBox>{actionError}</AlertBox> : null}
      {message ? <AlertBox tone="success">{message}</AlertBox> : null}

      <Card>
        <View style={styles.headRow}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>{booking.service?.icon ?? "🛠️"}</Text>
          </View>
          <View style={styles.headBody}>
            <View style={styles.badgeRow}>
              <Text style={styles.title}>
                {booking.service?.name ?? "บริการ"}
              </Text>
              <StatusBadge status={booking.status} />
              <PaymentBadge status={booking.payment_status} />
            </View>
            <Text style={styles.code}>
              รหัสงาน: {booking.id.slice(0, 8).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>วันและเวลานัดหมาย</Text>
              <Text style={styles.infoValue}>
                {formatDateTime(booking.scheduled_at)}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>ที่อยู่</Text>
              <Text style={styles.infoValue}>{booking.address}</Text>
            </View>
          </View>
          {booking.notes ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📝</Text>
              <View style={styles.infoBody}>
                <Text style={styles.infoLabel}>รายละเอียดเพิ่มเติม</Text>
                <Text style={styles.infoValue}>{booking.notes}</Text>
              </View>
            </View>
          ) : null}
          <View style={styles.totalRow}>
            <Text style={styles.infoLabel}>ยอดที่ลูกค้าชำระ</Text>
            <Text style={styles.totalValue}>{formatTHB(booking.price)}</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.gap}>
        <Text style={styles.sectionTitle}>แชทกับลูกค้า</Text>
        <ChatBox
          bookingId={booking.id}
          currentUserId={user.id}
          initialMessages={messages}
        />
      </Card>

      <Card style={styles.gap}>
        <Text style={styles.sectionTitle}>ข้อมูลลูกค้า</Text>
        <View style={styles.customerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {booking.customer?.full_name.charAt(0) || "ล"}
            </Text>
          </View>
          <View style={styles.infoBody}>
            <Text style={styles.customerName}>
              {booking.customer?.full_name || "ลูกค้า"}
            </Text>
            <Text style={styles.customerPhone}>
              {booking.customer?.phone || "ไม่ระบุเบอร์โทร"}
            </Text>
          </View>
        </View>
        {booking.customer?.phone ? (
          <Button
            title="โทรหาลูกค้า"
            variant="secondary"
            onPress={() =>
              void Linking.openURL(`tel:${booking.customer?.phone ?? ""}`)
            }
          />
        ) : null}
      </Card>

      <Card style={styles.gap}>
        <Text style={styles.sectionTitle}>อัปเดตสถานะงาน</Text>

        {booking.status === "accepted" ? (
          <Button
            title="เริ่มให้บริการ"
            onPress={() => handleStatus("in_progress")}
            loading={busy}
          />
        ) : booking.status === "in_progress" ? (
          <Button
            title="✓ งานเสร็จสิ้น"
            onPress={() => handleStatus("completed")}
            loading={busy}
          />
        ) : booking.status === "completed" ? (
          <Text style={styles.doneBox}>
            งานนี้เสร็จสิ้นแล้ว ขอบคุณสำหรับการให้บริการ
          </Text>
        ) : (
          <Text style={styles.muted}>
            สถานะปัจจุบัน:{" "}
            {booking.status === "cancelled" ? "ยกเลิก" : "รอดำเนินการ"}
          </Text>
        )}
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
  headRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.blue50,
    borderWidth: 1,
    borderColor: colors.blue100,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 28,
  },
  headBody: {
    flex: 1,
    gap: 4,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: font.extrabold,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  code: {
    fontSize: 12,
    color: colors.slate500,
  },
  infoList: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.slate100,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  infoIcon: {
    fontSize: 15,
    marginTop: 1,
  },
  infoBody: {
    flex: 1,
    gap: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.slate500,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: font.medium,
    color: colors.slate900,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.slate100,
    paddingTop: spacing.md,
  },
  totalValue: {
    fontSize: 21,
    fontWeight: font.extrabold,
    color: colors.blue700,
  },
  gap: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: font.extrabold,
    letterSpacing: -0.2,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.slate100,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: font.semibold,
    color: colors.slate600,
  },
  customerName: {
    fontSize: 16,
    fontWeight: font.extrabold,
    color: colors.ink,
  },
  customerPhone: {
    fontSize: 12,
    color: colors.slate500,
  },
  doneBox: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.sky100,
    backgroundColor: colors.sky50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 13,
    color: colors.sky700,
    overflow: "hidden",
  },
  muted: {
    fontSize: 13,
    color: colors.slate500,
  },
});
