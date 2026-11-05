import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ChatBox } from "@/components/chat-box";
import { PromptPayQR } from "@/components/promptpay-qr";
import { ReviewForm } from "@/components/review-form";
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
  confirmPayment,
  fetchBookingById,
  fetchMessages,
  fetchProviderProfile,
  updateBookingStatus,
} from "@/lib/api";
import { formatDateTime, formatTHB } from "@/lib/format";
import type { BookingStatus } from "@/lib/types";
import { useAsyncData } from "@/lib/use-async-data";
import { useAuth } from "@/providers/auth";
import { colors, font, radius, spacing } from "@/theme";

const TIMELINE: { status: BookingStatus; label: string }[] = [
  { status: "pending", label: "รอช่างรับงาน" },
  { status: "accepted", label: "ช่างรับงาน" },
  { status: "in_progress", label: "กำลังให้บริการ" },
  { status: "completed", label: "เสร็จสิ้น" },
];

export default function BookingDetailScreen() {
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
    const [messages, providerProfile] = await Promise.all([
      fetchMessages(id),
      booking.provider_id
        ? fetchProviderProfile(booking.provider_id)
        : Promise.resolve(null),
    ]);
    return { booking, messages, providerProfile };
  });

  if (authLoading || loading) return <LoadingView />;

  if (!user) {
    return (
      <Redirect
        href={{ pathname: "/login", params: { next: `/bookings/${id}` } }}
      />
    );
  }

  if (!data) {
    return (
      <Screen>
        <EmptyState
          icon="🔎"
          title={error ? "โหลดข้อมูลไม่สำเร็จ" : "ไม่พบงานที่ต้องการ"}
          description={error ?? "งานนี้อาจถูกลบหรือคุณไม่มีสิทธิ์เข้าถึง"}
          action={
            <Button
              title={error ? "ลองใหม่" : "กลับไปหน้าการจอง"}
              onPress={() =>
                error ? void reload() : router.replace("/bookings")
              }
            />
          }
        />
      </Screen>
    );
  }

  const { booking, messages, providerProfile } = data;
  const isCustomer = booking.customer_id === user.id;
  const isProvider = booking.provider_id === user.id;
  const isAdmin = profile?.role === "admin";

  if (!isCustomer && !isProvider && !isAdmin) {
    return (
      <Screen>
        <EmptyState
          icon="🚫"
          title="คุณไม่มีสิทธิ์เข้าถึงงานนี้"
          description="เฉพาะลูกค้า ผู้ให้บริการ และผู้ดูแลระบบเท่านั้น"
          action={
            <Button
              title="กลับไปหน้าการจอง"
              onPress={() => router.replace("/bookings")}
            />
          }
        />
      </Screen>
    );
  }

  if (isProvider && !isCustomer) {
    return <Redirect href={`/provider/jobs/${booking.id}`} />;
  }

  const currentStep = TIMELINE.findIndex((step) => step.status === booking.status);
  const canCancel =
    isCustomer &&
    (booking.status === "pending" || booking.status === "accepted");
  const canReview =
    isCustomer && booking.status === "completed" && !booking.review;
  const promptpayId = process.env.EXPO_PUBLIC_PROMPTPAY_ID ?? "";
  const receiverName = process.env.EXPO_PUBLIC_PROMPTPAY_NAME ?? "FastHelp";

  async function handleConfirmPayment() {
    if (!user) return;
    setBusy(true);
    setActionError(null);
    const result = await confirmPayment(booking.id, user.id);
    setBusy(false);
    if (result.error) {
      setActionError(result.error);
      return;
    }
    setMessage("ยืนยันการชำระเงินเรียบร้อยแล้ว");
    await reload();
  }

  function handleCancel() {
    Alert.alert(
      "ยกเลิกการจอง",
      "ต้องการยกเลิกการจองนี้ใช่หรือไม่?",
      [
        { text: "ไม่", style: "cancel" },
        {
          text: "ยกเลิกการจอง",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            setActionError(null);
            const result = await updateBookingStatus(booking.id, "cancelled");
            setBusy(false);
            if (result.error) {
              setActionError(result.error);
              return;
            }
            setMessage("ยกเลิกการจองเรียบร้อยแล้ว");
            await reload();
          },
        },
      ],
      { cancelable: true },
    );
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>‹ กลับ</Text>
      </Pressable>

      {actionError ? <AlertBox>{actionError}</AlertBox> : null}
      {message ? <AlertBox tone="success">{message}</AlertBox> : null}

      <Card>
        <View style={styles.headRow}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>{booking.service?.icon ?? "🛠️"}</Text>
          </View>
          <View style={styles.headBody}>
            <View style={styles.badgeRow}>
              <Text style={styles.title}>{booking.service?.name ?? "บริการ"}</Text>
              <StatusBadge status={booking.status} />
              <PaymentBadge status={booking.payment_status} />
            </View>
            <Text style={styles.code}>
              รหัสการจอง: {booking.id.slice(0, 8).toUpperCase()}
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
            <Text style={styles.infoLabel}>ยอดชำระ</Text>
            <Text style={styles.totalValue}>{formatTHB(booking.price)}</Text>
          </View>
        </View>
      </Card>

      {isCustomer ? (
        <Card style={styles.gap}>
          <Text style={styles.sectionTitle}>ชำระเงิน</Text>
          {booking.status === "cancelled" ? (
            <Text style={styles.mutedBox}>
              งานนี้ถูกยกเลิกแล้ว จึงไม่ต้องชำระเงิน
            </Text>
          ) : booking.payment_status === "paid" ? (
            <View style={styles.paidBox}>
              <Text style={styles.paidText}>
                ✓ ชำระเงินเรียบร้อยแล้ว เมื่อ{" "}
                {formatDateTime(booking.updated_at)}
              </Text>
            </View>
          ) : (
            <View style={styles.paymentBox}>
              <Text style={styles.muted}>
                สแกน QR ด้านล่างด้วยแอปธนาคารเพื่อชำระเงิน
                แล้วกดยืนยันการชำระเงิน
              </Text>
              <PromptPayQR
                amount={booking.price}
                promptpayId={promptpayId}
                receiverName={receiverName}
              />
              <Button
                title="ฉันชำระเงินแล้ว (ยืนยัน)"
                onPress={handleConfirmPayment}
                loading={busy}
              />
              <Text style={styles.note}>
                * เวอร์ชันเดโม: การชำระเงินเป็นการยืนยันด้วยตนเอง
                ยังไม่เชื่อมต่อเกตเวย์จริง
              </Text>
            </View>
          )}
        </Card>
      ) : null}

      {canReview ? (
        <Card style={styles.gap}>
          <Text style={styles.sectionTitle}>ให้คะแนนผู้ให้บริการ</Text>
          <ReviewForm
            bookingId={booking.id}
            customerId={user.id}
            providerId={booking.provider_id ?? ""}
            onSubmitted={() => void reload()}
          />
        </Card>
      ) : null}

      {booking.review ? (
        <Card style={styles.gap}>
          <Text style={styles.sectionTitle}>รีวิวของคุณ</Text>
          <Text style={styles.stars}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Text
                key={value}
                style={
                  value <= booking.review!.rating
                    ? styles.starOn
                    : styles.starOff
                }
              >
                ★
              </Text>
            ))}
          </Text>
          {booking.review.comment ? (
            <Text style={styles.reviewText}>{booking.review.comment}</Text>
          ) : null}
        </Card>
      ) : null}

      {isCustomer ? (
        <Card style={styles.gap}>
          <Text style={styles.sectionTitle}>แชทกับผู้ให้บริการ</Text>
          <ChatBox
            bookingId={booking.id}
            currentUserId={user.id}
            initialMessages={messages}
          />
        </Card>
      ) : null}

      <Card style={styles.gap}>
        <Text style={styles.sectionTitle}>ผู้ให้บริการ</Text>
        {booking.provider ? (
          <>
            <View style={styles.providerRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {booking.provider.full_name.charAt(0) || "ช"}
                </Text>
              </View>
              <View style={styles.providerBody}>
                <Text style={styles.providerName}>
                  {booking.provider.full_name}
                </Text>
                <Text style={styles.providerRating}>
                  ⭐{" "}
                  {providerProfile?.rating_count
                    ? `${providerProfile.rating_avg.toFixed(1)} (${providerProfile.rating_count} รีวิว)`
                    : "ยังไม่มีรีวิว"}
                </Text>
              </View>
            </View>
            {booking.provider.phone ? (
              <Button
                title={`โทร ${booking.provider.phone}`}
                variant="secondary"
                onPress={() =>
                  void Linking.openURL(`tel:${booking.provider?.phone ?? ""}`)
                }
              />
            ) : null}
          </>
        ) : (
          <Text style={styles.muted}>
            กำลังรอช่างรับงาน เมื่อมีช่างรับงาน สถานะจะอัปเดตที่หน้านี้
          </Text>
        )}
      </Card>

      <Card style={styles.gap}>
        <Text style={styles.sectionTitle}>สถานะงาน</Text>
        {booking.status === "cancelled" ? (
          <Text style={styles.cancelledBox}>การจองนี้ถูกยกเลิกแล้ว</Text>
        ) : (
          <View style={styles.timeline}>
            {TIMELINE.map((step, index) => {
              const done = currentStep >= index;
              const active = currentStep === index;
              return (
                <View key={step.status} style={styles.timelineRow}>
                  <View
                    style={[
                      styles.timelineDot,
                      done && styles.timelineDotDone,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timelineDotText,
                        done && styles.timelineDotTextDone,
                      ]}
                    >
                      {done ? "✓" : index + 1}
                    </Text>
                  </View>
                  <View style={styles.timelineBody}>
                    <Text
                      style={[
                        styles.timelineLabel,
                        active && styles.timelineLabelActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {active ? (
                      <Text style={styles.timelineHint}>สถานะปัจจุบัน</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {canCancel ? (
          <Button
            title="ยกเลิกการจอง"
            variant="danger"
            onPress={handleCancel}
            loading={busy}
          />
        ) : null}
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
    backgroundColor: colors.teal50,
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
    fontSize: 19,
    fontWeight: font.bold,
    color: colors.slate900,
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
    fontSize: 20,
    fontWeight: font.bold,
    color: colors.teal700,
  },
  gap: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: font.bold,
    color: colors.slate900,
    marginBottom: spacing.sm,
  },
  muted: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.slate600,
  },
  mutedBox: {
    borderRadius: radius.md,
    backgroundColor: colors.slate100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 13,
    color: colors.slate600,
    overflow: "hidden",
  },
  paidBox: {
    borderRadius: radius.md,
    backgroundColor: colors.emerald50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  paidText: {
    fontSize: 13,
    color: colors.emerald700,
  },
  paymentBox: {
    gap: spacing.md,
  },
  note: {
    fontSize: 11,
    textAlign: "center",
    color: colors.slate400,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  starOn: {
    fontSize: 20,
    color: "#fbbf24",
  },
  starOff: {
    fontSize: 20,
    color: colors.slate200,
  },
  reviewText: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 19,
    color: colors.slate600,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.teal100,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: font.semibold,
    color: colors.teal700,
  },
  providerBody: {
    flex: 1,
    gap: 2,
  },
  providerName: {
    fontSize: 15,
    fontWeight: font.medium,
    color: colors.slate900,
  },
  providerRating: {
    fontSize: 12,
    color: colors.slate500,
  },
  cancelledBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.rose200,
    backgroundColor: colors.rose50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 13,
    color: colors.rose700,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  timeline: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  timelineRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.slate100,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDotDone: {
    backgroundColor: colors.teal600,
  },
  timelineDotText: {
    fontSize: 11,
    fontWeight: font.bold,
    color: colors.slate400,
  },
  timelineDotTextDone: {
    color: colors.white,
  },
  timelineBody: {
    flex: 1,
    paddingTop: 2,
  },
  timelineLabel: {
    fontSize: 13,
    fontWeight: font.medium,
    color: colors.slate700,
  },
  timelineLabelActive: {
    color: colors.teal700,
  },
  timelineHint: {
    fontSize: 11,
    color: colors.slate400,
  },
});
