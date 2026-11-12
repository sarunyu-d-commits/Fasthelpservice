import { Link, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Logo } from "@/components/logo";
import { ServiceCard } from "@/components/service-card";
import {
  AlertBox,
  Button,
  LoadingView,
  Screen,
} from "@/components/ui";
import { fetchServices } from "@/lib/api";
import { formatTHB } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Service } from "@/lib/types";
import { useAsyncData } from "@/lib/use-async-data";
import { useAuth } from "@/providers/auth";
import { colors, font, radius, shadow, spacing } from "@/theme";

const steps = [
  {
    title: "เลือกบริการ",
    description: "เลือกงานที่ต้องการ เช่น ล้างแอร์ ทำความสะอาด หรือเปลี่ยนแบต",
  },
  {
    title: "ระบุวันเวลาและที่อยู่",
    description: "นัดหมายวันเวลาที่สะดวก พร้อมบอกจุดสังเกตให้ช่างไปถึงง่าย",
  },
  {
    title: "ช่างรับงานและให้บริการ",
    description: "ติดตามสถานะ แชทกับช่าง และชำระเงินเมื่องานเสร็จ",
  },
];

const highlights = [
  {
    icon: "🛡️",
    title: "ช่างผ่านการตรวจสอบ",
    description: "คัดสรรผู้ให้บริการที่มีประสบการณ์และคะแนนรีวิวที่ดี",
  },
  {
    icon: "⏰",
    title: "นัดหมายได้ตามต้องการ",
    description: "เลือกวันและเวลาที่สะดวก ช่างไปให้บริการถึงบ้าน",
  },
  {
    icon: "⭐",
    title: "รีวิวจากลูกค้าจริง",
    description: "อ่านรีวิวก่อนตัดสินใจ และให้คะแนนหลังใช้บริการ",
  },
];

function PopularCard({ service }: { service: Service }) {
  return (
    <Link href={`/services/${service.slug}`} asChild>
      <Pressable style={({ pressed }) => [styles.popularCard, pressed && styles.pressed]}>
        <View style={styles.popularIconWrap}>
          <Text style={styles.popularIcon}>{service.icon ?? "🛠️"}</Text>
        </View>
        <Text style={styles.popularName} numberOfLines={2}>
          {service.name}
        </Text>
        <Text style={styles.popularPrice}>
          เริ่ม {formatTHB(service.base_price)}
        </Text>
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: services, loading, error, reload } = useAsyncData(fetchServices);

  if (loading && !services) return <LoadingView />;

  const list = services ?? [];
  const popular = list.slice(0, 6);
  const cheapest = list.length
    ? Math.min(...list.map((service) => service.base_price))
    : 0;

  return (
    <Screen>
      <View style={styles.topBar}>
        <Logo compact />
        {user ? (
          <Link href="/account" asChild>
            <Pressable style={styles.accountButton}>
              <Text style={styles.accountButtonText}>บัญชี</Text>
            </Pressable>
          </Link>
        ) : (
          <Link href="/login" asChild>
            <Pressable style={styles.accountButton}>
              <Text style={styles.accountButtonText}>เข้าสู่ระบบ</Text>
            </Pressable>
          </Link>
        )}
      </View>

      {!isSupabaseConfigured ? (
        <View style={styles.demoNotice}>
          <Text style={styles.demoNoticeText}>
            โหมดตัวอย่าง: ยังไม่ได้ตั้งค่า Supabase — ใส่ค่าใน mobile/.env เพื่อใช้งานจริง
          </Text>
        </View>
      ) : null}

      {error ? (
        <AlertBox>
          {error}{" "}
          <Text style={styles.retry} onPress={() => void reload()}>
            ลองใหม่
          </Text>
        </AlertBox>
      ) : null}

      <View style={styles.hero}>
        <View style={styles.heroGlowA} />
        <View style={styles.heroGlowB} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⚡ บริการถึงบ้าน ภายใน 60 นาที</Text>
        </View>
        <Text style={styles.heroTitle}>
          เรียกช่างที่ใช่{"\n"}
          <Text style={styles.heroAccent}>ถึงบ้านคุณ</Text>
        </Text>
        <Text style={styles.heroText}>
          ล้างแอร์ ทำความสะอาด เปลี่ยนแบตเตอรี่ ซ่อมไฟฟ้า และอีกหลากหลายบริการ
          จองง่าย ช่างมืออาชีพ ราคาชัดเจน
        </Text>

        <View style={styles.heroActions}>
          <Button
            title="เลือกบริการเลย"
            onPress={() => router.push("/services")}
          />
          <Button
            title="สมัครเป็นผู้ให้บริการ"
            variant="secondary"
            onPress={() =>
              router.push({ pathname: "/register", params: { role: "provider" } })
            }
          />
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>บริการเริ่มต้น</Text>
            <Text style={styles.statValue}>{formatTHB(cheapest)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>หมวดบริการ</Text>
            <Text style={styles.statValue}>{list.length}+</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>คะแนนเฉลี่ย</Text>
            <Text style={styles.statValue}>4.8 ⭐</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>บริการยอดนิยม</Text>
          <Link href="/services" asChild>
            <Pressable>
              <Text style={styles.link}>ดูทั้งหมด</Text>
            </Pressable>
          </Link>
        </View>
        <View style={styles.popularGrid}>
          {popular.slice(0, 4).map((service) => (
            <PopularCard key={service.id} service={service} />
          ))}
        </View>
        <View style={styles.paymentNote}>
          <Text style={styles.paymentNoteText}>
            ✓ ชำระเงินปลอดภัยด้วย PromptPay
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>บริการยอดนิยม</Text>
      <Text style={styles.sectionSubtitle}>
        เลือกบริการที่ต้องการ แล้วนัดช่างได้ทันที
      </Text>
      <View style={styles.list}>
        {popular.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </View>

      <Text style={[styles.sectionTitle, styles.centered]}>
        ใช้งานง่ายใน 3 ขั้นตอน
      </Text>
      <View style={styles.list}>
        {steps.map((step, index) => (
          <View key={step.title} style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepText}>{step.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.list}>
        {highlights.map((item) => (
          <View key={item.title} style={styles.highlightCard}>
            <Text style={styles.highlightIcon}>{item.icon}</Text>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>{item.title}</Text>
              <Text style={styles.stepText}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>มีฝีมือ? มาหารายได้กับ FastHelp</Text>
        <Text style={styles.ctaText}>
          สมัครเป็นผู้ให้บริการ รับงานใกล้บ้าน เลือกเวลาทำงานเองได้
        </Text>
        <Button
          title="สมัครเป็นช่างวันนี้"
          variant="secondary"
          onPress={() =>
            router.push({ pathname: "/register", params: { role: "provider" } })
          }
        />
      </View>

      <Text style={styles.footer}>© {new Date().getFullYear()} FastHelp</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  accountButton: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.blue100,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  accountButtonText: {
    fontSize: 13,
    fontWeight: font.semibold,
    color: colors.blue700,
  },
  demoNotice: {
    borderRadius: radius.md,
    backgroundColor: colors.amber50,
    borderWidth: 1,
    borderColor: colors.amber100,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  demoNoticeText: {
    fontSize: 12,
    color: colors.amber800,
    lineHeight: 18,
  },
  retry: {
    fontWeight: font.semibold,
    textDecorationLine: "underline",
  },
  hero: {
    gap: spacing.md,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.blue100,
    backgroundColor: colors.blue50,
    padding: spacing.xl,
    overflow: "hidden",
    ...shadow.card,
  },
  heroGlowA: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: colors.blue100,
    opacity: 0.6,
    top: -80,
    right: -60,
  },
  heroGlowB: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.sky100,
    opacity: 0.7,
    bottom: -70,
    left: -40,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.blue200,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: font.semibold,
    color: colors.blue700,
  },
  heroTitle: {
    fontSize: 33,
    lineHeight: 41,
    fontWeight: font.extrabold,
    letterSpacing: -0.9,
    color: colors.ink,
  },
  heroAccent: {
    color: colors.blue600,
  },
  heroText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.slate600,
  },
  heroActions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  stats: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  stat: {
    flex: 1,
    gap: 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.blue100,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statLabel: {
    fontSize: 10,
    color: colors.slate500,
  },
  statValue: {
    fontSize: 17,
    fontWeight: font.extrabold,
    color: colors.ink,
  },
  card: {
    marginTop: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: font.semibold,
    color: colors.slate900,
  },
  link: {
    fontSize: 12,
    fontWeight: font.semibold,
    color: colors.blue600,
  },
  popularGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  popularCard: {
    width: "48%",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    padding: spacing.md,
    ...shadow.card,
  },
  popularIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.blue50,
    borderWidth: 1,
    borderColor: colors.blue100,
    alignItems: "center",
    justifyContent: "center",
  },
  popularIcon: {
    fontSize: 22,
  },
  popularName: {
    marginTop: spacing.sm,
    fontSize: 13,
    fontWeight: font.extrabold,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  popularPrice: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: font.medium,
    color: colors.blue700,
  },
  paymentNote: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.sky50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  paymentNoteText: {
    fontSize: 12,
    color: colors.sky700,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    fontSize: 21,
    fontWeight: font.extrabold,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.slate500,
  },
  centered: {
    textAlign: "center",
  },
  list: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  stepCard: {
    flexDirection: "row",
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.blue600,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: font.bold,
  },
  stepBody: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: font.extrabold,
    color: colors.ink,
  },
  stepText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.slate600,
  },
  highlightCard: {
    flexDirection: "row",
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.sky100,
    backgroundColor: colors.sky50,
    padding: spacing.lg,
  },
  highlightIcon: {
    fontSize: 26,
  },
  cta: {
    marginTop: spacing.xl,
    borderRadius: radius.xxl,
    backgroundColor: colors.blue600,
    padding: spacing.xl,
    gap: spacing.sm,
    ...shadow.float,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: font.extrabold,
    color: colors.white,
    textAlign: "center",
  },
  ctaText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.blue50,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  footer: {
    marginTop: spacing.xl,
    textAlign: "center",
    fontSize: 12,
    color: colors.slate400,
  },
  pressed: {
    opacity: 0.85,
  },
});
