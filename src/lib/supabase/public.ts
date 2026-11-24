import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ของสาธารณะ (services) อ่านได้ด้วย anon key ไม่ต้องอ่าน cookie
// ใช้กับหน้า static/ISR ได้ เพราะไม่เรียก cookies() จาก next/headers
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
