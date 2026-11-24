"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  markChatRead,
  sendMessage,
  type ChatMessageInput,
} from "@/app/actions/messages";
import { GoogleMap } from "@/components/google-map";
import { sendMessageDirect } from "@/lib/chat-send";
import { formatTime } from "@/lib/format";
import {
  googleMapsLink,
  isLocationExpired,
  locationExpiresAt,
} from "@/lib/location";
import type { BookingRead, Message } from "@/lib/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { SendIcon } from "./icons";

type TypingChannel = {
  send: (message: {
    type: "broadcast";
    event: string;
    payload: Record<string, unknown>;
  }) => Promise<string>;
};

function mergeMessages(initial: Message[], incoming: Message[]): Message[] {
  const byId = new Map(initial.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
      a.id.localeCompare(b.id),
  );
}

function optimisticMessage(
  bookingId: string,
  currentUserId: string,
  value: string,
  type: Message["message_type"],
  extra: Partial<ChatMessageInput>,
): Message {
  return {
    id: `temp-${crypto.randomUUID()}`,
    booking_id: bookingId,
    sender_id: currentUserId,
    body: value,
    message_type: type,
    latitude: extra.latitude ?? null,
    longitude: extra.longitude ?? null,
    location_label: type === "location" ? value || null : null,
    image_path: extra.imagePath ?? null,
    expires_at: type === "location" ? locationExpiresAt() : null,
    created_at: new Date().toISOString(),
  };
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
  const [incoming, setIncoming] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [readOverrides, setReadOverrides] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingChannel = useRef<TypingChannel | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSent = useRef(0);
  const lastMarked = useRef<string | null>(null);

  const messages = useMemo(
    () => mergeMessages(initialMessages, incoming),
    [initialMessages, incoming],
  );

  const liveReads = useMemo(() => {
    const byUser = new Map(reads.map((item) => [item.user_id, item.last_read_at]));
    for (const [userId, lastReadAt] of Object.entries(readOverrides)) {
      byUser.set(userId, lastReadAt);
    }
    return byUser;
  }, [reads, readOverrides]);

  const otherReadAt = useMemo(() => {
    if (!otherUserId) return 0;
    const lastReadAt = liveReads.get(otherUserId);
    return lastReadAt ? new Date(lastReadAt).getTime() : 0;
  }, [liveReads, otherUserId]);

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
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    // โหลดข้อความที่อาจพลาดไปตอน tab  inactive / realtime ตัดการเชื่อมต่อ
    async function refreshMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("booking_id", bookingId);
      if (data?.length) {
        setIncoming((current) => mergeMessages(current, data as Message[]));
      }
    }

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
          setIncoming((current) => {
            const message = payload.new as Message;
            return current.some((item) => item.id === message.id)
              ? current
              : [...current, message];
          });
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") void refreshMessages();
      });

    const readsChannel = supabase
      .channel(`chat-reads-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "booking_reads",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const row = payload.new as BookingRead;
          if (!row.user_id || !row.last_read_at) return;
          setReadOverrides((current) => ({
            ...current,
            [row.user_id]: row.last_read_at,
          }));
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
      void supabase.removeChannel(readsChannel);
      void supabase.removeChannel(broadcast);
      typingChannel.current = null;
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [bookingId, otherUserId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  useEffect(() => {
    const latest = messages[messages.length - 1]?.id;
    if (!latest || latest === lastMarked.current) return;
    lastMarked.current = latest;
    void markChatRead(bookingId);
  }, [messages, bookingId]);

  // ใช้ string เป็น dependency เพื่อไม่ให้ sign รูปซ้ำทุกครั้งที่มีข้อความใหม่
  const imageKey = imagePaths.join("|");
  useEffect(() => {
    if (!isSupabaseConfigured() || !imageKey) return;
    const supabase = createClient();
    const paths = imageKey.split("|");

    void Promise.all(
      paths.map(async (path) => {
        const { data } = await supabase.storage
          .from("chat-images")
          .createSignedUrl(path, 60 * 60);
        return [path, data?.signedUrl ?? ""] as const;
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
  }, [imageKey]);

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

    const pending = optimisticMessage(
      bookingId,
      currentUserId,
      value,
      type,
      extra,
    );
    // แสดงทันทีก่อนรอ server + realtime
    setIncoming((current) => mergeMessages(current, [pending]));

    // ส่งตรง Supabase ก่อน (1 hop) ถ้า RLS/session ยังไม่พร้อมค่อย fallback ไป server action
    let result = await sendMessageDirect({
      ...extra,
      bookingId,
      senderId: currentUserId,
      body: value,
      type,
    });
    if (result.error) {
      result = await sendMessage({
        ...extra,
        bookingId,
        body: value,
        type,
      });
    }
    setSending(false);

    if (result.error) {
      setIncoming((current) => current.filter((item) => item.id !== pending.id));
      setError(result.error);
      return;
    }

    // แทนข้อความชั่วคราวด้วยแถวจริง (realtime ที่มาถึงก่อนจะโดน dedup ตาม id)
    if (result.message) {
      const saved = result.message;
      setIncoming((current) =>
        mergeMessages(
          current.filter((item) => item.id !== pending.id),
          [saved],
        ),
      );
    }
    setBody("");
  }

  async function handleImage(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("รองรับเฉพาะรูปภาพ JPG, PNG และ WEBP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("ขนาดรูปต้องไม่เกิน 5 MB");
      return;
    }
    if (!isSupabaseConfigured()) {
      setError("ยังไม่ได้ตั้งค่า Supabase");
      return;
    }

    setUploading(true);
    setError(null);
    const supabase = createClient();
    const extension = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const path = `${bookingId}/${currentUserId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("chat-images")
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      setUploading(false);
      setError(`อัปโหลดรูปไม่สำเร็จ: ${uploadError.message}`);
      return;
    }

    setUploading(false);
    await submit("", "image", { imagePath: path });
  }

  function handleLocation() {
    if (!navigator.geolocation) {
      setError("เบราว์เซอร์นี้ไม่รองรับการแชร์ตำแหน่ง");
      return;
    }
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void submit("ตำแหน่งปัจจุบันของฉัน", "location", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => setError("ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาอนุญาตในเบราว์เซอร์"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      <div
        ref={scrollRef}
        className="no-scrollbar flex h-72 flex-col gap-2 overflow-y-auto bg-slate-50/70 p-3"
      >
        {messages.length === 0 ? (
          <p className="m-auto text-sm text-slate-400">
            ยังไม่มีข้อความ เริ่มคุยกับคู่สนทนาได้เลย
          </p>
        ) : (
          messages.map((message) => {
            const mine = message.sender_id === currentUserId;
            const locationLabel =
              message.location_label || message.body || "ตำแหน่งที่แชร์";
            const read =
              mine &&
              otherReadAt >= new Date(message.created_at).getTime();
            return (
              <div
                key={message.id}
                className={`animate-message-in flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] space-y-2 rounded-2xl px-3.5 py-2 text-sm ${
                    mine
                      ? "rounded-br-sm bg-gradient-to-br from-blue-600 to-sky-600 text-white"
                      : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  {message.message_type === "image" && message.image_path ? (
                    imageUrls[message.image_path] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrls[message.image_path]}
                        alt="รูปภาพในแชท"
                        className="max-h-56 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <p className="text-xs opacity-70">กำลังโหลดรูปภาพ...</p>
                    )
                  ) : null}

                  {message.message_type === "location" &&
                  message.latitude != null &&
                  message.longitude != null ? (
                    <div className="space-y-2">
                      <p className="font-semibold">📍 {locationLabel}</p>
                      {isLocationExpired(message.expires_at) ? (
                        <p className="text-xs opacity-70">ลิงก์ตำแหน่งหมดอายุแล้ว</p>
                      ) : (
                        <>
                          <GoogleMap
                            latitude={message.latitude}
                            longitude={message.longitude}
                            label={locationLabel}
                            className="h-36 w-64 rounded-xl border-0"
                          />
                          <a
                            href={googleMapsLink(
                              message.latitude,
                              message.longitude,
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-xs font-semibold underline"
                          >
                            เปิดใน Google Maps
                          </a>
                        </>
                      )}
                    </div>
                  ) : null}

                  {message.message_type === "text" ? message.body : null}
                </div>
                <span className="mt-0.5 px-1 text-[10px] text-slate-400">
                  {formatTime(message.created_at)}
                  {read ? " · อ่านแล้ว" : mine ? " · ส่งแล้ว" : ""}
                </span>
              </div>
            );
          })
        )}
        {typing ? (
          <p className="animate-message-in self-start rounded-full bg-white px-3 py-1 text-xs text-slate-500 shadow-sm">
            กำลังพิมพ์...
          </p>
        ) : null}
      </div>

      {error ? <p className="px-3 py-1 text-xs text-rose-600">{error}</p> : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit(body);
        }}
        className="flex flex-wrap items-center gap-2 border-t border-slate-200 p-2.5"
      >
        <label className="cursor-pointer rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600 transition hover:bg-blue-50 hover:text-blue-700">
          🖼️
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={sending || uploading}
            onChange={(event) => {
              void handleImage(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
        <button
          type="button"
          onClick={handleLocation}
          disabled={sending || uploading}
          className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
          title="แชร์ตำแหน่งปัจจุบัน"
        >
          📍
        </button>
        <input
          name="body"
          value={body}
          required
          maxLength={2000}
          autoComplete="off"
          placeholder="พิมพ์ข้อความ..."
          onChange={(event) => {
            setBody(event.target.value);
            notifyTyping();
          }}
          className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        />
        <button
          type="submit"
          disabled={sending || uploading || !body.trim()}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-sky-600 text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-sky-700 disabled:opacity-50"
          aria-label="ส่งข้อความ"
        >
          <SendIcon className="size-5" />
        </button>
      </form>
    </div>
  );
}
