import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatTHB } from "@/lib/format";
import type { Service } from "@/lib/types";
import { colors, font, radius, shadow, spacing } from "@/theme";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/services/${service.slug}`} asChild>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.topRow}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>{service.icon ?? "🛠️"}</Text>
          </View>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText} numberOfLines={1}>
              {service.category}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {service.name}
            </Text>
            <View style={styles.rating}>
              <Text style={styles.ratingText}>★ 4.8</Text>
            </View>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {service.description}
          </Text>
          <Text style={styles.guarantee}>🛡 รับประกันคุณภาพ 30 วัน</Text>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>เริ่มต้น</Text>
            <Text style={styles.price}>
              {formatTHB(service.base_price)}
              <Text style={styles.unit}> / {service.unit}</Text>
            </Text>
          </View>
          <View style={styles.footerRight}>
            <View style={styles.durationChip}>
              <Text style={styles.durationText}>
                ⏱ {service.duration_minutes} นาที
              </Text>
            </View>
            <View style={styles.arrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.card,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.blue50,
    borderWidth: 1,
    borderColor: colors.blue100,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 27,
  },
  categoryChip: {
    maxWidth: "62%",
    borderRadius: radius.full,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate100,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: font.medium,
    color: colors.slate500,
  },
  body: {
    gap: 3,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  name: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: font.extrabold,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  rating: {
    borderRadius: radius.full,
    backgroundColor: colors.amber50,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: font.semibold,
    color: colors.amber700,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.slate500,
  },
  guarantee: {
    fontSize: 11,
    fontWeight: font.medium,
    color: colors.sky700,
  },
  footer: {
    marginTop: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.slate100,
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  priceLabel: {
    fontSize: 11,
    color: colors.slate400,
  },
  price: {
    fontSize: 18,
    fontWeight: font.extrabold,
    color: colors.blue700,
  },
  unit: {
    fontSize: 11,
    fontWeight: font.regular,
    color: colors.slate400,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  durationChip: {
    borderRadius: radius.full,
    backgroundColor: colors.slate50,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  durationText: {
    fontSize: 11,
    color: colors.slate500,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.blue600,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    fontSize: 17,
    fontWeight: font.bold,
    color: colors.white,
  },
});
