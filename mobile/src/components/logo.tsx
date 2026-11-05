import { StyleSheet, Text, View } from "react-native";

import { colors, font, radius, spacing } from "@/theme";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={[styles.mark, compact && styles.markCompact]}>
        <Text style={[styles.markText, compact && styles.markTextCompact]}>
          🔧
        </Text>
      </View>
      <View>
        <Text style={[styles.name, compact && styles.nameCompact]}>
          Fast<Text style={styles.nameAccent}>Help</Text>
        </Text>
        {!compact ? (
          <Text style={styles.tagline}>บริการถึงบ้าน ง่ายแค่ปลายนิ้ว</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  mark: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.teal600,
    alignItems: "center",
    justifyContent: "center",
  },
  markCompact: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
  },
  markText: {
    fontSize: 24,
  },
  markTextCompact: {
    fontSize: 18,
  },
  name: {
    fontSize: 24,
    fontWeight: font.bold,
    color: colors.slate900,
    letterSpacing: -0.5,
  },
  nameCompact: {
    fontSize: 20,
  },
  nameAccent: {
    color: colors.teal600,
  },
  tagline: {
    marginTop: 2,
    fontSize: 12,
    color: colors.slate500,
  },
});
