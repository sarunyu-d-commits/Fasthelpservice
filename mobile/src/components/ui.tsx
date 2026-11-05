import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BOOKING_STATUS_COLOR,
  BOOKING_STATUS_LABEL,
  PAYMENT_STATUS_COLOR,
  PAYMENT_STATUS_LABEL,
} from "@/lib/constants";
import type { BookingStatus, PaymentStatus } from "@/lib/types";
import { colors, font, radius, spacing } from "@/theme";

export function Screen({
  children,
  scroll = true,
  padded = true,
  style,
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const content = [
    styles.screenContent,
    padded && styles.padded,
    style,
  ] as StyleProp<ViewStyle>;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.screenContent, content]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerText}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && styles.buttonPrimary,
        variant === "secondary" && styles.buttonSecondary,
        variant === "danger" && styles.buttonDanger,
        variant === "ghost" && styles.buttonGhost,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.white : colors.teal700}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === "primary" && styles.buttonTextPrimary,
            variant === "secondary" && styles.buttonTextSecondary,
            variant === "danger" && styles.buttonTextDanger,
            variant === "ghost" && styles.buttonTextGhost,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function TextField({
  label,
  error,
  hint,
  style,
  ...props
}: TextInputProps & {
  label?: string;
  error?: string | null;
  hint?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.slate400}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!error && hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Badge({
  label,
  backgroundColor,
  textColor,
}: {
  label: string;
  backgroundColor: string;
  textColor: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const palette = BOOKING_STATUS_COLOR[status];
  return (
    <Badge
      label={BOOKING_STATUS_LABEL[status]}
      backgroundColor={palette.background}
      textColor={palette.text}
    />
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const palette = PAYMENT_STATUS_COLOR[status];
  return (
    <Badge
      label={PAYMENT_STATUS_LABEL[status]}
      backgroundColor={palette.background}
      textColor={palette.text}
    />
  );
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? (
        <Text style={styles.emptyDescription}>{description}</Text>
      ) : null}
      {action ? <View style={styles.emptyAction}>{action}</View> : null}
    </View>
  );
}

export function LoadingView({ label = "กำลังโหลด..." }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.teal600} size="large" />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

export function AlertBox({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: ReactNode;
}) {
  return (
    <View
      style={[
        styles.alert,
        tone === "error" && styles.alertError,
        tone === "success" && styles.alertSuccess,
        tone === "info" && styles.alertInfo,
      ]}
    >
      <Text
        style={[
          styles.alertText,
          tone === "error" && styles.alertTextError,
          tone === "success" && styles.alertTextSuccess,
          tone === "info" && styles.alertTextInfo,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

export function SectionTitle({
  title,
  right,
}: {
  title: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {right}
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.slate50,
  },
  screenContent: {
    flexGrow: 1,
    paddingBottom: 108,
  },
  padded: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: font.bold,
    color: colors.slate900,
  },
  subtitle: {
    fontSize: 14,
    color: colors.slate500,
  },
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
  },
  buttonPrimary: {
    backgroundColor: colors.teal600,
  },
  buttonSecondary: {
    backgroundColor: colors.teal50,
    borderWidth: 1,
    borderColor: colors.teal100,
  },
  buttonDanger: {
    backgroundColor: colors.rose50,
    borderWidth: 1,
    borderColor: colors.rose200,
  },
  buttonGhost: {
    backgroundColor: "transparent",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: font.semibold,
  },
  buttonTextPrimary: {
    color: colors.white,
  },
  buttonTextSecondary: {
    color: colors.teal700,
  },
  buttonTextDanger: {
    color: colors.rose700,
  },
  buttonTextGhost: {
    color: colors.teal700,
  },
  fieldWrap: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: font.semibold,
    color: colors.slate700,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.slate900,
  },
  inputError: {
    borderColor: colors.rose600,
  },
  errorText: {
    fontSize: 12,
    color: colors.rose700,
  },
  hint: {
    fontSize: 12,
    color: colors.slate500,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: font.semibold,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: font.semibold,
    color: colors.slate700,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.slate500,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyAction: {
    marginTop: spacing.sm,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: colors.slate500,
  },
  alert: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  alertError: {
    backgroundColor: colors.rose50,
    borderColor: colors.rose200,
  },
  alertSuccess: {
    backgroundColor: colors.emerald50,
    borderColor: colors.emerald200,
  },
  alertInfo: {
    backgroundColor: colors.sky50,
    borderColor: colors.sky200,
  },
  alertText: {
    fontSize: 13,
    lineHeight: 19,
  },
  alertTextError: {
    color: colors.rose700,
  },
  alertTextSuccess: {
    color: colors.emerald700,
  },
  alertTextInfo: {
    color: colors.sky800,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: font.bold,
    color: colors.slate900,
  },
  divider: {
    height: 1,
    backgroundColor: colors.slate200,
    marginVertical: spacing.md,
  },
});
