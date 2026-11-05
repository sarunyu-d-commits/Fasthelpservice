import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatTHB } from "@/lib/format";
import type { Service } from "@/lib/types";
import { colors, font, radius, spacing } from "@/theme";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/services/${service.slug}`} asChild>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{service.icon ?? "🛠️"}</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={1}>
            {service.name}
          </Text>
          <Text style={styles.description} numberOfLines={1}>
            {service.description}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.price}>
              เริ่ม {formatTHB(service.base_price)}
            </Text>
            <Text style={styles.duration}>⏱ {service.duration_minutes} นาที</Text>
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.slate200,
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
  },
  name: {
    fontSize: 15,
    fontWeight: font.semibold,
    color: colors.slate900,
  },
  description: {
    marginTop: 2,
    fontSize: 13,
    color: colors.slate500,
  },
  metaRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  price: {
    fontSize: 13,
    fontWeight: font.semibold,
    color: colors.teal700,
  },
  duration: {
    fontSize: 12,
    color: colors.slate400,
  },
  chevron: {
    fontSize: 24,
    color: colors.slate300,
  },
});
