import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { Logo } from "@/components/logo";
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
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <Logo />
        <h1 className="mt-5 text-2xl font-bold text-slate-900">ยินดีต้อนรับกลับ</h1>
        <p className="mt-1 text-sm text-slate-500">
          เข้าสู่ระบบเพื่อจองบริการและติดตามงาน
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <LoginForm next={next} />
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        การเข้าใช้งานถือว่ายอมรับ{" "}
        <Link href="/" className="underline">
          ข้อกำหนดการใช้งาน
        </Link>
      </p>
    </div>
  );
}
