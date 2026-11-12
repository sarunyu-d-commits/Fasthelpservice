import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-layout";
import { LoginForm } from "@/components/auth-forms";
import { getAuthContext } from "@/lib/data";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const auth = await getAuthContext();
  if (auth) redirect("/");

  const { next } = await searchParams;

  return (
    <AuthShell
      title="ยินดีต้อนรับกลับ"
      subtitle="เข้าสู่ระบบเพื่อจองบริการและติดตามงานของคุณ"
      footer={
        <p className="text-center text-xs text-slate-400">
          การเข้าใช้งานถือว่ายอมรับ{" "}
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
      <LoginForm next={next} />
    </AuthShell>
  );
}
