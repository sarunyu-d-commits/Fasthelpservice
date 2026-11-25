"use server";

import { getAuthContext, normalizeMessage } from "@/lib/data";
import { isValidCoordinate, locationExpiresAt } from "@/lib/location";
import { sendPushToUser } from "@/lib/push";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Message } from "@/lib/types";

export interface ChatMessageInput {
  bookingId: string;
  body?: string;
  type?: "text" | "location" | "image";
  latitude?: number | null;
  longitude?: number | null;
  imagePath?: string | null;
}

const NOT_CONFIGURED = "ยังไม่ได้ตั้งค่า Supabase";

async function requireParticipant(bookingId: string) {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED } as const;

  const auth = await getAuthContext();
  if (!auth) return { error: "กรุณาเข้าสู่ระบบก่อนใช้งานแชท" } as const;

  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, customer_id, provider_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (
    !booking ||
    (booking.customer_id !== auth.user.id &&
      booking.provider_id !== auth.user.id)
  ) {
    return { error: "คุณไม่มีสิทธิ์ในแชทนี้" } as const;
  }

  return { supabase, userId: auth.user.id, booking } as const;
}

export async function sendMessage(
  input: ChatMessageInput,
): Promise<{ error?: string; message?: Message }> {
  const bookingId = String(input.bookingId ?? "");
  if (!bookingId) return { error: "ไม่พบรายการจอง" };

  const participant = await requireParticipant(bookingId);
  if ("error" in participant) return { error: participant.error };
  const { supabase, userId, booking } = participant;

  const type = input.type ?? "text";
  const body = String(input.body ?? "").trim().slice(0, 2000);

  if (type === "text" && !body) {
    return { error: "กรุณาพิมพ์ข้อความ" };
  }

  let latitude: number | null = null;
  let longitude: number | null = null;
  let expiresAt: string | null = null;
  let imagePath: string | null = null;

  if (type === "location") {
    latitude = input.latitude ?? null;
    longitude = input.longitude ?? null;
    if (!isValidCoordinate(latitude, longitude)) {
      return { error: "พิกัดไม่ถูกต้อง" };
    }
    expiresAt = locationExpiresAt();
  }

  if (type === "image") {
    imagePath = input.imagePath ?? null;
    if (
      !imagePath ||
      !imagePath.startsWith(`${bookingId}/${userId}/`) ||
      imagePath.includes("..")
    ) {
      return { error: "ไฟล์รูปภาพไม่ถูกต้อง" };
    }
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      booking_id: bookingId,
      sender_id: userId,
      body: type === "text" ? body : body.slice(0, 2000),
      message_type: type,
      latitude,
      longitude,
      location_label: type === "location" ? body || null : null,
      image_path: imagePath,
      expires_at: expiresAt,
    })
    .select("*")
    .single();

  if (error) return { error: error.message };

  const recipientId =
    booking.customer_id === userId ? booking.provider_id : booking.customer_id;
  const preview =
    type === "text"
      ? body.slice(0, 120)
      : type === "image"
        ? "ส่งรูปภาพในแชท"
        : "ส่งตำแหน่งในแชท";
  await sendPushToUser(
    recipientId,
    "ข้อความใหม่จาก FastHelp",
    preview,
    `/bookings/${bookingId}`,
  );

  // คืนแถวที่เพิ่ง insert ให้ client แสดงทันที ไม่ต้องรอ realtime มาอีกรอบ
  return { message: normalizeMessage(data as Record<string, unknown>) };
}

export async function markChatRead(
  bookingId: string,
): Promise<{ error?: string }> {
  const participant = await requireParticipant(bookingId);
  if ("error" in participant) return { error: participant.error };
  const { supabase, userId } = participant;

  const { error } = await supabase.from("booking_reads").upsert(
    {
      booking_id: bookingId,
      user_id: userId,
      last_read_at: new Date().toISOString(),
    },
    { onConflict: "booking_id,user_id" },
  );

  if (error) return { error: error.message };

  return {};
}
