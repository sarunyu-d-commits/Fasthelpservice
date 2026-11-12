import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollViewInstance,
} from "react-native";

import { fetchMessages, sendMessage } from "@/lib/api";
import { formatTime } from "@/lib/format";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Message } from "@/lib/types";
import { colors, font, radius, spacing } from "@/theme";

function mergeMessages(current: Message[], incoming: Message[]) {
  const known = new Set(current.map((message) => message.id));
  const merged = [...current];
  for (const message of incoming) {
    if (!known.has(message.id)) {
      merged.push(message);
      known.add(message.id);
    }
  }
  return merged.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

export function ChatBox({
  bookingId,
  currentUserId,
  initialMessages,
}: {
  bookingId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    setMessages((current) => mergeMessages(current, initialMessages));
  }, [initialMessages]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel(`messages-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          setMessages((current) =>
            mergeMessages(current, [payload.new as Message]),
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [bookingId]);

  async function handleSend() {
    const text = body.trim();
    if (!text || sending) return;

    setSending(true);
    setError(null);
    const result = await sendMessage(bookingId, currentUserId, text);
    if (result.error) {
      setError(result.error);
      setSending(false);
      return;
    }

    setBody("");
    const latest = await fetchMessages(bookingId);
    setMessages((current) => mergeMessages(current, latest));
    setSending(false);
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.length === 0 ? (
          <Text style={styles.empty}>
            ยังไม่มีข้อความ เริ่มคุยกับคู่สนทนาได้เลย
          </Text>
        ) : (
          messages.map((message) => {
            const mine = message.sender_id === currentUserId;
            return (
              <View
                key={message.id}
                style={[styles.messageRow, mine && styles.messageRowMine]}
              >
                <View
                  style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}
                >
                  <Text
                    style={mine ? styles.bubbleTextMine : styles.bubbleTextOther}
                  >
                    {message.body}
                  </Text>
                </View>
                <Text style={styles.time}>{formatTime(message.created_at)}</Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.inputRow}>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="พิมพ์ข้อความ..."
          placeholderTextColor={colors.slate400}
          maxLength={2000}
          style={styles.input}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable
          onPress={handleSend}
          disabled={sending || !body.trim()}
          style={({ pressed }) => [
            styles.sendButton,
            (sending || !body.trim()) && styles.sendButtonDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  list: {
    height: 280,
    backgroundColor: colors.slate50,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
    flexGrow: 1,
  },
  empty: {
    marginVertical: "auto",
    textAlign: "center",
    fontSize: 13,
    color: colors.slate400,
  },
  messageRow: {
    alignItems: "flex-start",
  },
  messageRowMine: {
    alignItems: "flex-end",
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleMine: {
    backgroundColor: colors.blue600,
    borderBottomRightRadius: radius.sm,
  },
  bubbleOther: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderBottomLeftRadius: radius.sm,
  },
  bubbleTextMine: {
    color: colors.white,
    fontSize: 14,
  },
  bubbleTextOther: {
    color: colors.slate900,
    fontSize: 14,
  },
  time: {
    marginTop: 2,
    fontSize: 10,
    color: colors.slate400,
  },
  error: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    fontSize: 12,
    color: colors.rose700,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
    padding: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.slate50,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.slate900,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.blue600,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendIcon: {
    color: colors.white,
    fontSize: 16,
    fontWeight: font.bold,
  },
  pressed: {
    opacity: 0.85,
  },
});
