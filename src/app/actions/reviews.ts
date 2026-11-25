"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/data";
import { sendPushToUser } from "@/lib/push";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface ReviewFormState {
  error?: string;
}

export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  if (!isSupabaseConfigured()) {
    return { error: "ยังไม่ได้ตั้งค่า Supabase" };
  }

  const auth = await getAuthContext();
  if (!auth) return { error: "กรุณาเข้าสู่ระบบ" };

  const bookingId = String(formData.get("booking_id") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim();

  if (!bookingId) return { error: "ไม่พบงานที่ต้องการรีวิว" };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "กรุณาให้คะแนน 1-5 ดาว" };
  }

  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, customer_id, provider_id, status")
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking || booking.customer_id !== auth.user.id) {
    return { error: "คุณไม่มีสิทธิ์รีวิวงานนี้" };
  }
  if (booking.status !== "completed") {
    return { error: "รีวิวได้หลังงานเสร็จสิ้นแล้วเท่านั้น" };
  }
  if (!booking.provider_id) {
    return { error: "งานนี้ยังไม่มีผู้ให้บริการ" };
  }

  const { error } = await supabase.from("reviews").insert({
    booking_id: bookingId,
    customer_id: auth.user.id,
    provider_id: booking.provider_id,
    rating,
    comment: comment || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "คุณรีวิวงานนี้ไปแล้ว" };
    }
    return { error: `ส่งรีวิวไม่สำเร็จ: ${error.message}` };
  }

  await sendPushToUser(
    booking.provider_id,
    "รีวิวใหม่จากลูกค้า",
    `${rating}/5 ดาว${comment ? ` · ${comment.slice(0, 80)}` : ""}`,
    `/bookings/${bookingId}`,
  );

  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath("/bookings");
  redirect(`/bookings/${bookingId}?reviewed=1`);
}
