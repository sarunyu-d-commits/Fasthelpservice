import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { createBooking } from "@/lib/api";
import { formatDate, formatTHB, formatTime } from "@/lib/format";
import type { Service } from "@/lib/types";
import { colors, font, radius, spacing } from "@/theme";
import { AlertBox, Button, TextField } from "./ui";

function tomorrowMorning() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date;
}

export function BookingForm({
  service,
  customerId,
  defaultAddress = "",
}: {
  service: Service;
  customerId: string;
  defaultAddress?: string;
}) {
  const router = useRouter();
  const initial = useMemo(tomorrowMorning, []);
  const [datePart, setDatePart] = useState(initial);
  const [timePart, setTimePart] = useState(initial);
  const [picker, setPicker] = useState<"date" | "time" | null>(null);
  const [address, setAddress] = useState(defaultAddress);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const scheduledAt = useMemo(() => {
    const value = new Date(datePart);
    value.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
    return value;
  }, [datePart, timePart]);

  function handlePickerChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS !== "ios") setPicker(null);
    if (event.type === "dismissed" || !selected) {
      if (Platform.OS === "ios") setPicker(null);
      return;
    }
    if (picker === "date") setDatePart(selected);
    if (picker === "time") setTimePart(selected);
    if (Platform.OS === "ios") setPicker(null);
  }

  async function handleSubmit() {
    setError(null);

    if (!address.trim()) {
      setError("กรุณาระบุที่อยู่สำหรับให้บริการ");
      return;
    }
    if (scheduledAt.getTime() <= Date.now()) {
      setError("กรุณาเลือกวันและเวลาในอนาคต");
      return;
    }

    setSubmitting(true);
    const result = await createBooking({
      customerId,
      serviceId: service.id,
      scheduledAt: scheduledAt.toISOString(),
      address: address.trim(),
      notes: notes.trim(),
      price: service.base_price,
    });
    setSubmitting(false);

    if (result.error || !result.id) {
      setError(result.error ?? "ไม่สามารถสร้างการจองได้ กรุณาลองใหม่");
      return;
    }
    router.replace(`/bookings/${result.id}`);
  }

  return (
    <View style={styles.wrap}>
      {error ? <AlertBox>{error}</AlertBox> : null}

      <Text style={styles.label}>วันและเวลานัดหมาย</Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => setPicker("date")}
          style={styles.pickerButton}
        >
          <Text style={styles.pickerText}>📅 {formatDate(scheduledAt)}</Text>
        </Pressable>
        <Pressable
          onPress={() => setPicker("time")}
          style={styles.pickerButton}
        >
          <Text style={styles.pickerText}>⏰ {formatTime(scheduledAt)}</Text>
        </Pressable>
      </View>

      {picker ? (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={picker === "date" ? datePart : timePart}
            mode={picker}
            display={Platform.OS === "ios" ? "compact" : "default"}
            minimumDate={picker === "date" ? new Date() : undefined}
            minuteInterval={15}
            onChange={handlePickerChange}
          />
        </View>
      ) : null}

      <TextField
        label="ที่อยู่สำหรับให้บริการ"
        value={address}
        onChangeText={setAddress}
        placeholder="บ้านเลขที่ / อาคาร / ห้อง / จุดสังเกต"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        style={styles.multiline}
      />

      <TextField
        label="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
        value={notes}
        onChangeText={setNotes}
        placeholder="เช่น จำนวนเครื่องแอร์, ชั้นที่อยู่, เวลาที่สะดวก"
        multiline
        numberOfLines={2}
        textAlignVertical="top"
        style={styles.multiline}
      />

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>ค่าบริการ {service.name}</Text>
          <Text style={styles.summaryValue}>
            {formatTHB(service.base_price)} / {service.unit}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotalRow]}>
          <Text style={styles.summaryTotalLabel}>ยอดรวม (ประมาณ)</Text>
          <Text style={styles.summaryTotalValue}>
            {formatTHB(service.base_price)}
          </Text>
        </View>
        <Text style={styles.summaryNote}>
          * ราคาจริงอาจปรับตามหน้างาน โดยช่างจะยืนยันก่อนเริ่มให้บริการ
        </Text>
      </View>

      <Button
        title="ยืนยันการจอง"
        onPress={handleSubmit}
        loading={submitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: font.semibold,
    color: colors.slate700,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  pickerButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  pickerText: {
    fontSize: 14,
    color: colors.slate900,
  },
  pickerWrap: {
    alignItems: "flex-start",
  },
  multiline: {
    minHeight: 84,
    paddingTop: spacing.md,
  },
  summary: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.slate50,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.slate600,
    flex: 1,
  },
  summaryValue: {
    fontSize: 13,
    color: colors.slate600,
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.slate300,
    borderStyle: "dashed",
    paddingTop: spacing.sm,
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: font.semibold,
    color: colors.slate900,
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: font.bold,
    color: colors.blue700,
  },
  summaryNote: {
    fontSize: 11,
    color: colors.slate500,
    lineHeight: 16,
  },
});
