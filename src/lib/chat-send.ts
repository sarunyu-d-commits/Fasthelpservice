import { isValidCoordinate, locationExpiresAt } from "@/lib/location";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Message } from "@/lib/types";

export interface DirectMessageInput {
  bookingId: string;
  senderId: string;
  body?: string;
  type?: "text" | "location" | "image";
  latitude?: number | null;
  longitude?: number | null;
  imagePath?: string | null;
}

/**
 * ส่งข้อความตรงจาก browser ไป Supabase (ผ่าน RLS) ไม่ต้องผ่าน server action
 * → ลด 1 hop ทำให้แชทเร็วขึ้น ที่เหลือ RLS เป็นคนตรวจสิทธิ์เหมือนเดิม
 */
export async function sendMessageDirect(
  input: DirectMessageInput,
): Promise<{ error?: string; message?: Message }> {
  if (!isSupabaseConfigured()) return { error: "ยังไม่ได้ตั้งค่า Supabase" };

  const bookingId = String(input.bookingId ?? "");
  if (!bookingId) return { error: "ไม่พบรายการจอง" };

  const type = input.type ?? "text";
  const body = String(input.body ?? "").trim().slice(0, 2000);
  if (type === "text" && !body) return { error: "กรุณาพิมพ์ข้อความ" };

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
      !imagePath.startsWith(`${bookingId}/${input.senderId}/`) ||
      imagePath.includes("..")
    ) {
      return { error: "ไฟล์รูปภาพไม่ถูกต้อง" };
    }
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      booking_id: bookingId,
      sender_id: input.senderId,
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
  return { message: data as Message };
}
