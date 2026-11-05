import { Link, Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  AlertBox,
  Button,
  EmptyState,
  LoadingView,
  PaymentBadge,
  Screen,
  StatusBadge,
} from "@/components/ui";
import {
  acceptBooking,
  fetchOpenJobs,
  fetchProviderJobs,
  fetchProviderProfile,
  fetchProviderServiceIds,
} from "@/lib/api";
import { formatDateTime, formatTHB } from "@/lib/format";
import { useAsyncData } from "@/lib/use-async-data";
import { useAuth } from "@/providers/auth";
import { colors, font, radius, spacing } from "@/theme";

export default function ProviderDashboardScreen() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, reload } = useAsyncData(async () => {
    if (!user) return null;
    const [openJobs, myJobs, provider, serviceIds] = await Promise.all([
      fetchOpenJobs(user.id),
      fetchProviderJobs(user.id),
      fetchProviderProfile(user.id),
      fetchProviderServiceIds(user.id),
    ]);
    return { openJobs, myJobs, provider, serviceIds };
  });

  if (authLoading) return <LoadingView />;
  if (!user) {
    return (
      <Redirect href={{ pathname: "/login", params: { next: "/provider" } }} />
    );
  }
  if (profile?.role !== "provider") return <Redirect href="/bookings" />;
  if (loading || !data) return <LoadingView />;

  const { openJobs, myJobs, provider, serviceIds } = data;
  const activeJobs = myJobs.filter(
    (job) => job.status === "accepted" || job.status === "in_progress",
  );
  const completedJobs = myJobs.filter((job) => job.status === "completed");

  async function handleAccept(jobId: string) {
    if (!user) return;
    setBusyId(jobId);
    setActionError(null);
    const result = await acceptBooking(jobId, user.id);
    setBusyId(null);
    if (result.error) {
      setActionError(result.error);
      return;
    }
    await reload();
  }

  return (
    <Screen>
      {error ? (
        <AlertBox>
          {error}{" "}
          <Text style={styles.link} onPress={() => void reload()}>
            ลองใหม่
          </Text>
        </AlertBox>
      ) : null}
      {actionError ? <AlertBox>{actionError}</AlertBox> : null}

      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <View style={styles.heroText}>
            <Text style={styles.heroGreeting}>สวัสดี,</Text>
            <Text style={styles.heroName}>
              {profile.full_name || "ผู้ให้บริการ"}
            </Text>
            <View style={styles.heroMeta}>
              <Text style={styles.heroMetaText}>
                ⭐{" "}
                {provider?.rating_count
                  ? `${provider.rating_avg.toFixed(1)} (${provider.rating_count} รีวิว)`
                  : "ยังไม่มีรีวิว"}
              </Text>
              <Text style={styles.heroMetaText}>
                {provider?.is_available === false ? "ปิดรับงาน" : "เปิดรับงาน"}
              </Text>
            </View>
          </View>
          <Link href="/provider/profile" asChild>
            <Pressable style={styles.profileButton}>
              <Text style={styles.profileButtonText}>โปรไฟล์</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>งานรอรับ</Text>
            <Text style={styles.statValue}>{openJobs.length}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>กำลังทำ</Text>
            <Text style={styles.statValue}>{activeJobs.length}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>เสร็จแล้ว</Text>
            <Text style={styles.statValue}>{completedJobs.length}</Text>
          </View>
        </View>
      </View>

      {provider?.is_available === false ? (
        <AlertBox tone="info">
          คุณปิดรับงานอยู่ เปิดรับงานได้ที่หน้า{" "}
          <Text
            style={styles.link}
            onPress={() => router.push("/provider/profile")}
          >
            โปรไฟล์ช่าง
          </Text>
        </AlertBox>
      ) : serviceIds.length === 0 ? (
        <AlertBox tone="info">
          ยังไม่ได้เลือกบริการที่ให้ เลือกบริการได้ที่หน้า{" "}
          <Text
            style={styles.link}
            onPress={() => router.push("/provider/profile")}
          >
            โปรไฟล์ช่าง
          </Text>{" "}
          เพื่อเริ่มรับงาน
        </AlertBox>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>งานที่รอรับ</Text>
        <Text style={styles.sectionCount}>{openJobs.length} งาน</Text>
      </View>

      {openJobs.length === 0 ? (
        <EmptyState
          title="ยังไม่มีงานใหม่"
          description="เมื่อมีลูกค้าจองบริการที่ตรงกับคุณ งานจะแสดงที่นี่"
        />
      ) : (
        <View style={styles.list}>
          {openJobs.map((job) => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.iconWrap}>
                  <Text style={styles.icon}>{job.service?.icon ?? "🛠️"}</Text>
                </View>
                <View style={styles.jobBody}>
                  <Text style={styles.jobTitle}>
                    {job.service?.name ?? "บริการ"}
                  </Text>
                  <Text style={styles.meta}>
                    📅 {formatDateTime(job.scheduled_at)}
                  </Text>
                  <Text style={styles.meta}>📍 ที่อยู่จะแสดงหลังคุณรับงาน</Text>
                  <Text style={styles.price}>{formatTHB(job.price)}</Text>
                </View>
              </View>
              <Button
                title={busyId === job.id ? "กำลังรับงาน..." : "รับงานนี้"}
                onPress={() => handleAccept(job.id)}
                loading={busyId === job.id}
              />
            </View>
          ))}
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>งานของฉัน</Text>
      </View>

      {myJobs.length === 0 ? (
        <EmptyState
          title="ยังไม่มีงานที่รับไว้"
          description="กดรับงานจากรายการด้านบนเพื่อเริ่มให้บริการ"
        />
      ) : (
        <View style={styles.list}>
          {myJobs.map((job) => (
            <Pressable
              key={job.id}
              onPress={() => router.push(`/provider/jobs/${job.id}`)}
              style={({ pressed }) => [styles.myJobCard, pressed && styles.pressed]}
            >
              <View style={styles.iconWrapSmall}>
                <Text style={styles.iconSmall}>{job.service?.icon ?? "🛠️"}</Text>
              </View>
              <View style={styles.jobBody}>
                <View style={styles.titleRow}>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {job.service?.name ?? "บริการ"}
                  </Text>
                  <StatusBadge status={job.status} />
                  <PaymentBadge status={job.payment_status} />
                </View>
                <Text style={styles.meta} numberOfLines={1}>
                  {formatDateTime(job.scheduled_at)} · {job.address}
                </Text>
                <Text style={styles.customer}>
                  ลูกค้า: {job.customer?.full_name || "-"}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  link: {
    fontWeight: font.semibold,
    textDecorationLine: "underline",
    color: colors.teal700,
  },
  hero: {
    borderRadius: radius.xl,
    backgroundColor: colors.teal600,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  heroGreeting: {
    fontSize: 12,
    color: colors.teal50,
  },
  heroName: {
    fontSize: 21,
    fontWeight: font.bold,
    color: colors.white,
  },
  heroMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: 4,
  },
  heroMetaText: {
    fontSize: 11,
    color: colors.teal50,
  },
  profileButton: {
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  profileButtonText: {
    fontSize: 13,
    fontWeight: font.medium,
    color: colors.white,
  },
  stats: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: colors.teal50,
  },
  statValue: {
    fontSize: 20,
    fontWeight: font.bold,
    color: colors.white,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: font.bold,
    color: colors.slate900,
  },
  sectionCount: {
    fontSize: 12,
    color: colors.slate500,
  },
  list: {
    gap: spacing.sm,
  },
  jobCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.md,
  },
  jobHeader: {
    flexDirection: "row",
    gap: spacing.md,
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
  iconWrapSmall: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.slate50,
    alignItems: "center",
    justifyContent: "center",
  },
  iconSmall: {
    fontSize: 21,
  },
  jobBody: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  jobTitle: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: font.semibold,
    color: colors.slate900,
  },
  meta: {
    fontSize: 12,
    color: colors.slate500,
  },
  price: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: font.bold,
    color: colors.teal700,
  },
  myJobCard: {
    flexDirection: "row",
    alignItems: "center",
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
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
  },
  customer: {
    fontSize: 11,
    color: colors.slate400,
  },
  chevron: {
    fontSize: 22,
    color: colors.slate300,
  },
});
