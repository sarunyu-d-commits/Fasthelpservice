"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sendMessage } from "@/app/actions/messages";
import { formatTime } from "@/lib/format";
import type { Message } from "@/lib/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { SendIcon } from "./icons";

export function ChatBox({
  bookingId,
  currentUserId,
  initialMessages,
}: {
  bookingId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [incoming, setIncoming] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const messages = useMemo(() => {
    const known = new Set(initialMessages.map((message) => message.id));
    return [
      ...initialMessages,
      ...incoming.filter((message) => !known.has(message.id)),
    ];
  }, [initialMessages, incoming]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
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
          const message = payload.new as Message;
          setIncoming((current) =>
            current.some((item) => item.id === message.id)
              ? current
              : [...current, message],
          );
          formRef.current?.reset();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

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
            return (
              <div
                key={message.id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                    mine
                      ? "rounded-br-sm bg-gradient-to-br from-blue-600 to-sky-600 text-white"
                      : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  {message.body}
                </div>
                <span className="mt-0.5 px-1 text-[10px] text-slate-400">
                  {formatTime(message.created_at)}
                </span>
              </div>
            );
          })
        )}
      </div>

      <form
        ref={formRef}
        action={sendMessage}
        className="flex items-center gap-2 border-t border-slate-200 p-2.5"
      >
        <input type="hidden" name="booking_id" value={bookingId} />
        <input
          name="body"
          required
          maxLength={2000}
          autoComplete="off"
          placeholder="พิมพ์ข้อความ..."
          className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        />
        <button
          type="submit"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-sky-600 text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-sky-700"
          aria-label="ส่งข้อความ"
        >
          <SendIcon className="size-5" />
        </button>
      </form>
    </div>
  );
}
