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
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <Logo />
        <h1 className="mt-5 text-2xl font-bold text-slate-900">ลืมรหัสผ่าน</h1>
        <p className="mt-1 text-sm text-slate-500">
          กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
