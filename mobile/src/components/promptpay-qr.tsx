import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { formatTHB } from "@/lib/format";
import { buildPromptPayPayload } from "@/lib/promptpay";
import { colors, font, radius, spacing } from "@/theme";

export function PromptPayQR({
  amount,
  promptpayId,
  receiverName,
}: {
  amount: number;
  promptpayId: string;
  receiverName: string;
}) {
  if (!promptpayId) {
    return (
      <View style={styles.warning}>
        <Text style={styles.warningText}>
          ยังไม่ได้ตั้งค่า EXPO_PUBLIC_PROMPTPAY_ID สำหรับรับเงิน
        </Text>
      </View>
    );
  }

  const payload = buildPromptPayPayload(promptpayId, amount);

  return (
    <View style={styles.wrap}>
      <View style={styles.qrCard}>
        {payload ? (
          <QRCode value={payload} size={220} color={colors.slate900} />
        ) : (
          <Text style={styles.qrFallback}>ไม่สามารถสร้าง QR ได้</Text>
        )}
      </View>
      <View style={styles.details}>
        <Text style={styles.bank}>พร้อมเพย์</Text>
        <Text style={styles.name}>{receiverName}</Text>
        <Text style={styles.amount}>{formatTHB(amount)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: spacing.md,
  },
  qrCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  qrFallback: {
    width: 220,
    height: 220,
    textAlign: "center",
    textAlignVertical: "center",
    color: colors.slate400,
    fontSize: 13,
  },
  details: {
    alignItems: "center",
    gap: 2,
  },
  bank: {
    fontSize: 15,
    fontWeight: font.semibold,
    color: colors.slate900,
  },
  name: {
    fontSize: 14,
    color: colors.slate600,
  },
  amount: {
    fontSize: 16,
    fontWeight: font.bold,
    color: colors.teal700,
  },
  warning: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.amber100,
    backgroundColor: colors.amber50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  warningText: {
    fontSize: 13,
    color: colors.amber800,
  },
});
