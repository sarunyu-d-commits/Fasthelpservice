import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { AccountForm } from "@/components/account-form";
import {
  CalendarIcon,
  ChevronRightIcon,
  LogOutIcon,
  WrenchIcon,
} from "@/components/icons";
import { getAuthContext } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "บัญชีของฉัน" };

const ROLE_LABEL: Record<string, string> = {
  customer: "ลูกค้า",
  provider: "ผู้ให้บริการ",
  admin: "ผู้ดูแลระบบ",
};

export default async function AccountPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login?next=/account");

  const profile = auth.profile;
  const role = profile?.role ?? "customer";
  const initial = (profile?.full_name || auth.user.email || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">บัญชีของฉัน</h1>

      <div className="mt-5 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <span className="grid size-14 place-items-center rounded-full bg-teal-100 text-xl font-bold text-teal-700">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-slate-900">
            {profile?.full_name || "ยังไม่ได้ระบุชื่อ"}
          </p>
          <p className="truncate text-sm text-slate-500">{auth.user.email}</p>
          <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {ROLE_LABEL[role] ?? role}
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {role === "provider" ? (
          <>
            <Link
              href="/provider"
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-300"
            >
              <span className="flex items-center gap-2.5">
                <WrenchIcon className="size-5 text-teal-600" />
                แดชบอร์ดช่าง
              </span>
              <ChevronRightIcon className="size-4 text-slate-300" />
            </Link>
            <Link
              href="/provider/profile"
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-300"
            >
              <span className="flex items-center gap-2.5">
                <WrenchIcon className="size-5 text-teal-600" />
                โปรไฟล์ผู้ให้บริการ
              </span>
              <ChevronRightIcon className="size-4 text-slate-300" />
            </Link>
          </>
        ) : (
          <Link
            href="/bookings"
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-300"
          >
            <span className="flex items-center gap-2.5">
              <CalendarIcon className="size-5 text-teal-600" />
              การจองของฉัน
            </span>
            <ChevronRightIcon className="size-4 text-slate-300" />
          </Link>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">ข้อมูลส่วนตัว</h2>
        <div className="mt-4">
          <AccountForm
            fullName={profile?.full_name ?? ""}
            phone={profile?.phone ?? ""}
          />
        </div>
        {profile?.created_at ? (
          <p className="mt-4 text-xs text-slate-400">
            สมาชิกตั้งแต่ {formatDate(profile.created_at)}
          </p>
        ) : null}
      </div>

      <form action={signOut} className="mt-4">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
        >
          <LogOutIcon className="size-4" />
          ออกจากระบบ
        </button>
      </form>
    </div>
  );
}
