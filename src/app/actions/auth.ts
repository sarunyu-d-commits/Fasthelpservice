"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface AuthFormState {
  error?: string;
  message?: string;
}

function translateAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  }
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "อีเมลนี้ถูกใช้สมัครแล้ว";
  }
  if (lower.includes("password should be at least")) {
    return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
  }
  if (lower.includes("email not confirmed")) {
    return "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ";
  }
  if (
    lower.includes("over_email_send_rate_limit") ||
    lower.includes("email rate limit exceeded")
  ) {
    return "ขณะนี้โควต้าส่งอีเมลของระบบเต็ม (ผู้ให้บริการพื้นฐานส่งได้ 2 ฉบับต่อชั่วโมง) กรุณารอประมาณ 1 ชั่วโมงแล้วลองใหม่ หรือแจ้งผู้ดูแลเพื่อตั้งค่า SMTP";
  }
  if (lower.includes("for security purposes") && lower.includes("request this after")) {
    return "กรุณารอประมาณ 60 วินาทีก่อนขออีเมลใหม่อีกครั้ง";
  }
  if (
    lower.includes("email_address_not_authorized") ||
    lower.includes("not authorized")
  ) {
    return "อีเมลนี้ยังไม่ได้รับอนุญาตให้รับอีเมลจากระบบ กรุณาติดต่อผู้ดูแล";
  }
  return message;
}

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "";
}

async function getOrigin() {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");

  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "ยังไม่ได้ตั้งค่า Supabase กรุณาใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ใน .env.local",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "กรุณากรอกอีเมลและรหัสผ่าน" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: translateAuthError(error.message) };

  redirect(next || "/");
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "ยังไม่ได้ตั้งค่า Supabase กรุณาใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ใน .env.local",
    };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") === "provider" ? "provider" : "customer";

  if (!fullName || !email || !password) {
    return { error: "กรุณากรอกชื่อ อีเมล และรหัสผ่าน" };
  }
  if (password.length < 6) {
    return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone, role },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
        role === "provider" ? "/provider" : "/bookings",
      )}`,
    },
  });

  if (error) return { error: translateAuthError(error.message) };

  if (!data.session) {
    return {
      message:
        "สมัครสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี แล้วกลับมาเข้าสู่ระบบ",
    };
  }

  redirect(role === "provider" ? "/provider" : "/bookings");
}

export async function requestPasswordReset(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "ยังไม่ได้ตั้งค่า Supabase กรุณาใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ใน .env.local",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "กรุณากรอกอีเมล" };

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });

  if (error) return { error: translateAuthError(error.message) };

  return {
    message:
      "ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว กรุณาตรวจสอบกล่องจดหมายหรือโฟลเดอร์สแปม",
  };
}

export async function updatePassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return { error: "ยังไม่ได้ตั้งค่า Supabase" };
  }

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password.length < 6) {
    return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
  }
  if (password !== confirmPassword) {
    return { error: "รหัสผ่านทั้งสองช่องไม่ตรงกัน" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "ลิงก์รีเซ็ตรหัสผ่านหมดอายุหรือยังไม่ได้เข้าสู่ระบบ กรุณาขอลิงก์ใหม่",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: translateAuthError(error.message) };

  return { message: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" };
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
