"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function sendMessage(formData: FormData) {
  if (!isSupabaseConfigured()) return;

  const bookingId = String(formData.get("booking_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!bookingId || !body) return;

  const auth = await getAuthContext();
  if (!auth) return;

  const supabase = await createClient();
  await supabase.from("messages").insert({
    booking_id: bookingId,
    sender_id: auth.user.id,
    body: body.slice(0, 2000),
  });

  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath(`/provider/jobs/${bookingId}`);
}
