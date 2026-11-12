import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PasswordForm } from "@/components/auth-forms";
import { Logo } from "@/components/logo";
import { getAuthContext } from "@/lib/data";

export const metadata: Metadata = { title: "ตั้งรหัสผ่านใหม่" };

export default async function ResetPasswordPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/forgot-password");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <div className="mb-6 flex flex-col items-center text-center">
        <Logo />
        <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-ink">
          ตั้งรหัสผ่านใหม่
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          กำหนดรหัสผ่านใหม่สำหรับบัญชี {auth.user.email}
        </p>
      </div>

      <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_60px_-30px_rgba(37,99,235,0.4)] backdrop-blur">
        <PasswordForm successHref="/account" />
      </div>
    </div>
  );
}
