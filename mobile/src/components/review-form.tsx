import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { submitReview } from "@/lib/api";
import { colors, font, radius, spacing } from "@/theme";
import { AlertBox, Button } from "./ui";

export function ReviewForm({
  bookingId,
  customerId,
  providerId,
  onSubmitted,
}: {
  bookingId: string;
  customerId: string;
  providerId: string;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    const result = await submitReview({
      bookingId,
      customerId,
      providerId,
      rating,
      comment,
    });
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    onSubmitted();
  }

  if (success) {
    return <AlertBox tone="success">ขอบคุณสำหรับรีวิวของคุณ</AlertBox>;
  }

  return (
    <View style={styles.wrap}>
      {error ? <AlertBox>{error}</AlertBox> : null}

      <Text style={styles.label}>ให้คะแนนการบริการ</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable key={value} onPress={() => setRating(value)} hitSlop={4}>
            <Text
              style={[styles.star, value <= rating ? styles.starOn : styles.starOff]}
            >
              ★
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>ความคิดเห็น (ไม่บังคับ)</Text>
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="เล่าประสบการณ์การใช้งาน..."
        placeholderTextColor={colors.slate400}
        maxLength={1000}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        style={styles.input}
      />

      <Button title="ส่งรีวิว" onPress={handleSubmit} loading={submitting} />
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
  stars: {
    flexDirection: "row",
    gap: 4,
  },
  star: {
    fontSize: 34,
    lineHeight: 40,
  },
  starOn: {
    color: "#fbbf24",
  },
  starOff: {
    color: colors.slate200,
  },
  input: {
    minHeight: 84,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    padding: spacing.md,
    fontSize: 14,
    color: colors.slate900,
  },
});
