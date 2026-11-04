import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth-forms";
import { Logo } from "@/components/logo";
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
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <Logo />
        <h1 className="mt-5 text-2xl font-bold text-slate-900">สร้างบัญชีใหม่</h1>
        <p className="mt-1 text-sm text-slate-500">
          เริ่มใช้งาน FastHelp ได้ฟรี ไม่มีค่าสมัคร
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <RegisterForm defaultRole={defaultRole} />
      </div>
    </div>
  );
}
