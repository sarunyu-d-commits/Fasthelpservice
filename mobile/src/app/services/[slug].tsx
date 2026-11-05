import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BookingForm } from "@/components/booking-form";
import {
  AlertBox,
  Button,
  Card,
  EmptyState,
  LoadingView,
  Screen,
} from "@/components/ui";
import { fetchServiceBySlug } from "@/lib/api";
import { formatTHB } from "@/lib/format";
import { useAsyncData } from "@/lib/use-async-data";
import { useAuth } from "@/providers/auth";
import { colors, font, radius, spacing } from "@/theme";

const perks = [
  { icon: "🛡️", text: "ช่างผ่านการตรวจสอบและมีรีวิวจากลูกค้า" },
  { icon: "⏰", text: "นัดหมายวันและเวลาที่สะดวกได้เอง" },
  { icon: "📍", text: "ให้บริการถึงบ้านหรือสถานที่ที่ระบุ" },
];

export default function ServiceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { user, profile, loading: authLoading } = useAuth();

  const {
    data: service,
    loading,
    error,
    reload,
  } = useAsyncData(() => fetchServiceBySlug(slug));

  if (loading || authLoading) return <LoadingView />;

  if (!service) {
    return (
      <Screen>
        <EmptyState
          icon="🧰"
          title={error ? "โหลดบริการไม่สำเร็จ" : "ไม่พบบริการนี้"}
          description={error ?? "บริการนี้อาจถูกปิดใช้งานแล้ว"}
          action={
            <Button
              title={error ? "ลองใหม่" : "กลับไปหน้าบริการ"}
              onPress={() => (error ? void reload() : router.replace("/services"))}
            />
          }
        />
      </Screen>
    );
  }

  const role = profile?.role;

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>‹ กลับไปหน้าบริการ</Text>
      </Pressable>

      <Card>
        <View style={styles.headRow}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>{service.icon ?? "🛠️"}</Text>
          </View>
          <View style={styles.headBody}>
            <Text style={styles.category}>{service.category}</Text>
            <Text style={styles.name}>{service.name}</Text>
            <Text style={styles.description}>{service.description}</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>ราคาเริ่มต้น</Text>
            <Text style={styles.metaPrice}>
              {formatTHB(service.base_price)}
              <Text style={styles.metaUnit}> / {service.unit}</Text>
            </Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>ระยะเวลาโดยประมาณ</Text>
            <Text style={styles.metaValue}>{service.duration_minutes} นาที</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.gap}>
        <Text style={styles.sectionTitle}>สิ่งที่คุณจะได้รับ</Text>
        {perks.map((perk) => (
          <View key={perk.text} style={styles.perkRow}>
            <Text style={styles.perkIcon}>{perk.icon}</Text>
            <Text style={styles.perkText}>{perk.text}</Text>
          </View>
        ))}
        <View style={styles.paymentNote}>
          <Text style={styles.paymentNoteText}>
            ✓ ชำระเงินผ่าน PromptPay QR เมื่อช่างให้บริการเสร็จ
          </Text>
        </View>
      </Card>

      <Card style={styles.gap}>
        <Text style={styles.sectionTitle}>จองบริการนี้</Text>

        {!user ? (
          <View style={styles.bookingBox}>
            <Text style={styles.muted}>
              เข้าสู่ระบบเพื่อเลือกวันเวลาและยืนยันการจอง
            </Text>
            <Button
              title="เข้าสู่ระบบเพื่อจอง"
              onPress={() =>
                router.push({
                  pathname: "/login",
                  params: { next: `/services/${service.slug}` },
                })
              }
            />
            <Button
              title="สมัครสมาชิกใหม่"
              variant="secondary"
              onPress={() => router.push("/register")}
            />
          </View>
        ) : role === "provider" ? (
          <View style={styles.bookingBox}>
            <AlertBox tone="info">
              คุณเข้าสู่ระบบในฐานะผู้ให้บริการ หากต้องการรับงานนี้ไปที่แดชบอร์ดช่าง
            </AlertBox>
            <Button
              title="ไปที่แดชบอร์ดช่าง"
              onPress={() => router.push("/provider")}
            />
          </View>
        ) : role === "admin" ? (
          <AlertBox tone="info">
            บัญชีผู้ดูแลระบบไม่สามารถจองบริการได้
          </AlertBox>
        ) : (
          <BookingForm service={service} customerId={user.id} />
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
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.teal50,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 34,
  },
  headBody: {
    flex: 1,
    gap: 2,
  },
  category: {
    fontSize: 11,
    fontWeight: font.medium,
    color: colors.slate600,
    backgroundColor: colors.slate100,
    alignSelf: "flex-start",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    overflow: "hidden",
  },
  name: {
    fontSize: 21,
    fontWeight: font.bold,
    color: colors.slate900,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.slate600,
  },
  metaGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  metaBox: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.slate50,
    padding: spacing.md,
    gap: 2,
  },
  metaLabel: {
    fontSize: 11,
    color: colors.slate500,
  },
  metaPrice: {
    fontSize: 17,
    fontWeight: font.bold,
    color: colors.teal700,
  },
  metaUnit: {
    fontSize: 11,
    fontWeight: font.regular,
    color: colors.slate500,
  },
  metaValue: {
    fontSize: 17,
    fontWeight: font.bold,
    color: colors.slate900,
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
  perkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  perkIcon: {
    fontSize: 15,
  },
  perkText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.slate600,
  },
  paymentNote: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.emerald50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  paymentNoteText: {
    fontSize: 12,
    color: colors.emerald700,
  },
  bookingBox: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  muted: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.slate600,
  },
});
