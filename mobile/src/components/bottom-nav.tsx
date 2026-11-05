import { Link, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/providers/auth";
import { colors, font, spacing } from "@/theme";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const customerItems: NavItem[] = [
  { href: "/", label: "หน้าแรก", icon: "🏠" },
  { href: "/services", label: "บริการ", icon: "🧰" },
  { href: "/bookings", label: "การจอง", icon: "📅" },
  { href: "/account", label: "บัญชี", icon: "👤" },
];

const providerItems: NavItem[] = [
  { href: "/provider", label: "งาน", icon: "🧰" },
  { href: "/services", label: "บริการ", icon: "🗂️" },
  { href: "/account", label: "บัญชี", icon: "👤" },
];

const adminItems: NavItem[] = [
  { href: "/admin", label: "แอดมิน", icon: "🛡️" },
  { href: "/services", label: "บริการ", icon: "🗂️" },
  { href: "/bookings", label: "การจอง", icon: "📅" },
  { href: "/account", label: "บัญชี", icon: "👤" },
];

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth",
];

export function BottomNav() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user, profile, loading } = useAuth();

  if (loading || !user) return null;
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) return null;

  const role = profile?.role;
  const items =
    role === "provider"
      ? providerItems
      : role === "admin"
        ? adminItems
        : customerItems;

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 6) }]}
    >
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} asChild>
            <Pressable style={styles.item}>
              <Text style={[styles.icon, !active && styles.iconMuted]}>
                {item.icon}
              </Text>
              <Text style={[styles.label, active && styles.labelActive]}>
                {item.label}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 2,
  },
  icon: {
    fontSize: 20,
  },
  iconMuted: {
    opacity: 0.45,
  },
  label: {
    fontSize: 11,
    fontWeight: font.medium,
    color: colors.slate400,
  },
  labelActive: {
    color: colors.teal600,
  },
});
