import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/auth-forms";
import { Logo } from "@/components/logo";
import { getAuthContext } from "@/lib/data";

export const metadata: Metadata = { title: "ลืมรหัสผ่าน" };

export default async function ForgotPasswordPage() {
  const auth = await getAuthContext();
  if (auth) redirect("/account");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <div className="mb-6 flex flex-col items-center text-center">
        <Logo />
        <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-ink">
          ลืมรหัสผ่าน
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้
        </p>
      </div>

      <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_60px_-30px_rgba(37,99,235,0.4)] backdrop-blur">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
