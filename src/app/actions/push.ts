"use server";

import { getAuthContext } from "@/lib/data";
import { isPushConfigured } from "@/lib/push";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface PushSubscriptionInput {
  endpoint?: string;
  p256dh?: string;
  auth?: string;
}

const NOT_CONFIGURED = "ยังไม่ได้ตั้งค่าการแจ้งเตือน";
const NO_SESSION = "กรุณาเข้าสู่ระบบก่อนเปิดการแจ้งเตือน";

function normalize(input: PushSubscriptionInput) {
  const endpoint = String(input?.endpoint ?? "");
  const p256dh = String(input?.p256dh ?? "");
  const authKey = String(input?.auth ?? "");
  if (
    !endpoint.startsWith("https://") ||
    endpoint.length > 2000 ||
    !p256dh ||
    p256dh.length > 500 ||
    !authKey ||
    authKey.length > 500
  ) {
    return null;
  }
  return { endpoint, p256dh, auth: authKey };
}

export async function savePushSubscription(
  input: PushSubscriptionInput,
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured() || !isPushConfigured()) {
    return { error: NOT_CONFIGURED };
  }
  const ctx = await getAuthContext();
  if (!ctx) return { error: NO_SESSION };

  const values = normalize(input);
  if (!values) return { error: "ข้อมูลการแจ้งเตือนไม่ถูกต้อง" };

  const supabase = await createClient();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: ctx.user.id,
      endpoint: values.endpoint,
      p256dh: values.p256dh,
      auth: values.auth,
    },
    { onConflict: "user_id,endpoint" },
  );

  return error ? { error: error.message } : {};
}

export async function removePushSubscription(
  endpoint: string,
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };
  const ctx = await getAuthContext();
  if (!ctx) return { error: NO_SESSION };

  const clean = String(endpoint ?? "");
  if (!clean.startsWith("https://") || clean.length > 2000) {
    return { error: "ข้อมูลการแจ้งเตือนไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", ctx.user.id)
    .eq("endpoint", clean);

  return error ? { error: error.message } : {};
}
