import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { osmLink } from "@/lib/location";
import { colors, font, radius, spacing } from "@/theme";

export function BookingLocationCard({
  latitude,
  longitude,
  label,
}: {
  latitude: number;
  longitude: number;
  label?: string | null;
}) {
  function openMap() {
    void Linking.openURL(osmLink(latitude, longitude, label)).catch(() => {});
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>🗺️ แผนที่จุดนัดหมาย</Text>
      <Text style={styles.coordinate}>
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
        {label ? ` · ${label}` : ""}
      </Text>
      <Pressable
        onPress={openMap}
        style={({ pressed }) => [
          styles.link,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.linkText}>เปิดแผนที่ใน OpenStreetMap ↗</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.slate50,
    padding: spacing.md,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: font.semibold,
    color: colors.slate900,
  },
  coordinate: {
    fontSize: 12,
    color: colors.slate500,
  },
  link: {
    alignSelf: "flex-start",
    marginTop: spacing.xs,
  },
  linkText: {
    fontSize: 13,
    fontWeight: font.semibold,
    color: colors.blue700,
    textDecorationLine: "underline",
  },
  pressed: {
    opacity: 0.75,
  },
});
