import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollViewInstance,
} from "react-native";

import {
  fetchChatImageUrl,
  fetchMessages,
  markChatRead,
  normalizeMessage,
  sendMessage,
  uploadChatImage,
  type ChatMessageInput,
} from "@/lib/api";
import { formatTime } from "@/lib/format";
import { isLocationExpired, isValidCoordinate, osmLink } from "@/lib/location";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { BookingRead, Message } from "@/lib/types";
import { colors, font, radius, spacing } from "@/theme";

type TypingChannel = {
  send: (message: {
    type: "broadcast";
    event: string;
    payload: Record<string, unknown>;
  }) => Promise<string>;
};

function mergeMessages(current: Message[], incoming: Message[]) {
  const byId = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) {
    if (!byId.has(message.id)) byId.set(message.id, message);
  }
  return [...byId.values()].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
      a.id.localeCompare(b.id),
  );
}

export function ChatBox({
  bookingId,
  currentUserId,
  otherUserId,
  initialMessages,
  reads = [],
}: {
  bookingId: string;
  currentUserId: string;
  otherUserId?: string | null;
  initialMessages: Message[];
  reads?: BookingRead[];
}) {
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const scrollRef = useRef<ScrollViewInstance>(null);
  const typingChannel = useRef<TypingChannel | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSent = useRef(0);
  const lastMarked = useRef<string | null>(null);

  const messages = useMemo(
    () => mergeMessages(initialMessages, liveMessages),
    [initialMessages, liveMessages],
  );

  const otherReadAt = useMemo(() => {
    if (!otherUserId) return 0;
    const read = reads.find((item) => item.user_id === otherUserId);
    return read ? new Date(read.last_read_at).getTime() : 0;
  }, [reads, otherUserId]);

  const imagePaths = useMemo(
    () =>
      Array.from(
        new Set(
          messages
            .map((message) => message.image_path)
            .filter((path): path is string => Boolean(path)),
        ),
      ),
    [messages],
  );

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
          setLiveMessages((current) =>
            mergeMessages(current, [normalizeMessage(payload.new as Record<string, unknown>)]),
          );
        },
      )
      .subscribe();

    const broadcast = supabase
      .channel(`chat-typing-${bookingId}`, {
        config: { broadcast: { self: false } },
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.user_id === otherUserId) {
          setTyping(Boolean(payload.is_typing));
          if (typingTimeout.current) clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(() => setTyping(false), 2500);
        }
      })
      .subscribe();

    typingChannel.current = broadcast;

    return () => {
      void supabase.removeChannel(channel);
      void supabase.removeChannel(broadcast);
      typingChannel.current = null;
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [bookingId, otherUserId]);

  useEffect(() => {
    const latest = messages[messages.length - 1]?.id;
    if (!latest || latest === lastMarked.current) return;
    lastMarked.current = latest;
    void markChatRead(bookingId, currentUserId);
  }, [messages, bookingId, currentUserId]);

  useEffect(() => {
    if (!isSupabaseConfigured || imagePaths.length === 0) return;

    void Promise.all(
      imagePaths.map(async (path) => {
        const url = await fetchChatImageUrl(path);
        return [path, url ?? ""] as const;
      }),
    ).then((entries) => {
      setImageUrls((current) => {
        const next = { ...current };
        let changed = false;
        for (const [path, url] of entries) {
          if (url && next[path] !== url) {
            next[path] = url;
            changed = true;
          }
        }
        return changed ? next : current;
      });
    });
  }, [imagePaths]);

  function notifyTyping() {
    const now = Date.now();
    if (now - lastTypingSent.current < 1000) return;
    lastTypingSent.current = now;
    void typingChannel.current
      ?.send({
        type: "broadcast",
        event: "typing",
        payload: { user_id: currentUserId, is_typing: true },
      })
      .catch(() => {});
  }

  async function submit(
    value: string,
    type: Message["message_type"] = "text",
    extra: Partial<ChatMessageInput> = {},
  ) {
    if (sending) return;
    setSending(true);
    setError(null);
    const result = await sendMessage({
      ...extra,
      bookingId,
      senderId: currentUserId,
      body: value,
      type,
    });
    if (result.error) {
      setError(result.error);
      setSending(false);
      return;
    }
    setBody("");
    const latest = await fetchMessages(bookingId);
    setLiveMessages((current) => mergeMessages(current, latest));
    setSending(false);
  }

  async function handleImage() {
    if (sending) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("กรุณาอนุญาตแอปเข้าถึงคลังรูปภาพก่อนแนบรูป");
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    const asset = picked.assets?.[0];
    if (picked.canceled || !asset) return;

    setSending(true);
    setError(null);
    const uploaded = await uploadChatImage({
      bookingId,
      userId: currentUserId,
      uri: asset.uri,
      mimeType: asset.mimeType ?? "image/jpeg",
    });
    if (uploaded.error || !uploaded.path) {
      setError(uploaded.error ?? "อัปโหลดรูปไม่สำเร็จ");
      setSending(false);
      return;
    }

    const result = await sendMessage({
      bookingId,
      senderId: currentUserId,
      body: "",
      type: "image",
      imagePath: uploaded.path,
    });
    if (result.error) {
      setError(result.error);
      setSending(false);
      return;
    }
    const latest = await fetchMessages(bookingId);
    setLiveMessages((current) => mergeMessages(current, latest));
    setSending(false);
  }

  async function handleLocation() {
    if (sending) return;
    setError(null);
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      setError("กรุณาอนุญาตแอปเข้าถึงตำแหน่งก่อนแชร์พิกัด");
      return;
    }
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      await submit("ตำแหน่งปัจจุบันของฉัน", "location", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch {
      setError("อ่านตำแหน่งไม่สำเร็จ กรุณาลองใหม่");
    }
  }

  function openLocation(message: Message) {
    if (message.latitude === null || message.longitude === null) return;
    const label =
      message.location_label || message.body || "ตำแหน่งที่แชร์";
    void Linking.openURL(osmLink(message.latitude, message.longitude, label)).catch(
      () => {},
    );
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
          <Text style={styles.empty}>ยังไม่มีข้อความ เริ่มคุยกับคู่สนทนาได้เลย</Text>
        ) : (
          messages.map((message) => {
            const mine = message.sender_id === currentUserId;
            const read =
              mine && otherReadAt >= new Date(message.created_at).getTime();
            const hasLocation = isValidCoordinate(
              message.latitude,
              message.longitude,
            );
            const locationLabel =
              message.location_label || message.body || "ตำแหน่งที่แชร์";

            return (
              <View
                key={message.id}
                style={[styles.messageRow, mine && styles.messageRowMine]}
              >
                <View
                  style={[
                    styles.bubble,
                    mine ? styles.bubbleMine : styles.bubbleOther,
                  ]}
                >
                  {message.message_type === "image" && message.image_path ? (
                    imageUrls[message.image_path] ? (
                      <Image
                        source={{ uri: imageUrls[message.image_path] }}
                        style={styles.image}
                      />
                    ) : (
                      <Text
                        style={
                          mine ? styles.bubbleTextMine : styles.bubbleTextOther
                        }
                      >
                        กำลังโหลดรูปภาพ...
                      </Text>
                    )
                  ) : null}

                  {message.message_type === "location" && hasLocation ? (
                    <View style={styles.locationBlock}>
                      <Text
                        style={
                          mine ? styles.bubbleTextMine : styles.bubbleTextOther
                        }
                      >
                        📍 {locationLabel}
                      </Text>
                      {isLocationExpired(message.expires_at) ? (
                        <Text style={styles.expired}>ลิงก์ตำแหน่งหมดอายุแล้ว</Text>
                      ) : (
                        <Pressable onPress={() => openLocation(message)}>
                          <Text style={styles.mapLink}>เปิดในแผนที่ ↗</Text>
                        </Pressable>
                      )}
                    </View>
                  ) : null}

                  {message.message_type === "text" ? (
                    <Text
                      style={
                        mine ? styles.bubbleTextMine : styles.bubbleTextOther
                      }
                    >
                      {message.body}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.time}>
                  {formatTime(message.created_at)}
                  {read ? " · อ่านแล้ว" : mine ? " · ส่งแล้ว" : ""}
                </Text>
              </View>
            );
          })
        )}
        {typing ? <Text style={styles.typing}>กำลังพิมพ์...</Text> : null}
      </ScrollView>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.inputRow}>
        <Pressable
          onPress={() => void handleImage()}
          disabled={sending}
          style={({ pressed }) => [
            styles.iconButton,
            sending && styles.iconButtonDisabled,
            pressed && styles.pressed,
          ]}
          accessibilityLabel="แนบรูปภาพ"
        >
          <Text style={styles.iconText}>🖼️</Text>
        </Pressable>
        <Pressable
          onPress={() => void handleLocation()}
          disabled={sending}
          style={({ pressed }) => [
            styles.iconButton,
            sending && styles.iconButtonDisabled,
            pressed && styles.pressed,
          ]}
          accessibilityLabel="แชร์ตำแหน่งปัจจุบัน"
        >
          <Text style={styles.iconText}>📍</Text>
        </Pressable>
        <TextInput
          value={body}
          onChangeText={(value) => {
            setBody(value);
            notifyTyping();
          }}
          placeholder="พิมพ์ข้อความ..."
          placeholderTextColor={colors.slate400}
          maxLength={2000}
          style={styles.input}
          onSubmitEditing={() => void submit(body)}
          returnKeyType="send"
        />
        <Pressable
          onPress={() => void submit(body)}
          disabled={sending || !body.trim()}
          style={({ pressed }) => [
            styles.sendButton,
            (sending || !body.trim()) && styles.sendButtonDisabled,
            pressed && styles.pressed,
          ]}
          accessibilityLabel="ส่งข้อความ"
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
    gap: spacing.xs,
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
  image: {
    width: 220,
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.slate100,
  },
  locationBlock: {
    gap: 4,
  },
  mapLink: {
    fontSize: 12,
    fontWeight: font.semibold,
    color: colors.blue700,
    textDecorationLine: "underline",
  },
  expired: {
    fontSize: 11,
    color: colors.slate400,
  },
  typing: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    fontSize: 12,
    color: colors.slate500,
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
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
    padding: spacing.sm,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.slate100,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonDisabled: {
    opacity: 0.4,
  },
  iconText: {
    fontSize: 16,
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
