import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-layout";
import { RegisterForm } from "@/components/auth-forms";
import { getAuthContext } from "@/lib/data";

export const metadata: Metadata = { title: "สมัครสมาชิก" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const auth = await getAuthContext();
  if (auth) redirect("/");

  const { role } = await searchParams;
  const defaultRole = role === "provider" ? "provider" : "customer";

  return (
    <AuthShell
      title="สร้างบัญชีใหม่"
      subtitle="เริ่มใช้งาน FastHelp ได้ฟรี ไม่มีค่าสมัคร"
      footer={
        <p className="text-center text-xs text-slate-400">
          การสมัครถือว่ายอมรับ{" "}
          <Link href="/terms" className="underline hover:text-slate-600">
            ข้อกำหนดการใช้งาน
          </Link>{" "}
          และ{" "}
          <Link href="/privacy" className="underline hover:text-slate-600">
            นโยบายความเป็นส่วนตัว
          </Link>
        </p>
      }
    >
      <RegisterForm defaultRole={defaultRole} />
    </AuthShell>
  );
}
