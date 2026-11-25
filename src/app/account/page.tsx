import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { AccountForm } from "@/components/account-form";
import { PasswordForm } from "@/components/auth-forms";
import { PushSubscribe } from "@/components/push-subscribe";
import {
  CalendarIcon,
  ChevronRightIcon,
  LogOutIcon,
  WrenchIcon,
} from "@/components/icons";
import { getProfile, getSessionUser } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "บัญชีของฉัน" };

const ROLE_LABEL: Record<string, string> = {
  customer: "ลูกค้า",
  provider: "ผู้ให้บริการ",
  admin: "ผู้ดูแลระบบ",
};

const cardClass =
  "rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");

  const profile = await getProfile(user.id);
  const role = profile?.role ?? "customer";
  const initial = (profile?.full_name || user.email || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          บัญชีของฉัน
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">
          จัดการข้อมูลส่วนตัว
        </h1>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-sky-700 p-5 text-white shadow-lg shadow-blue-900/20">
        <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/15 text-2xl font-bold text-white ring-1 ring-white/25 backdrop-blur">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold">
              {profile?.full_name || "ยังไม่ได้ระบุชื่อ"}
            </p>
            <p className="truncate text-sm text-blue-50">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-blue-50">
                {ROLE_LABEL[role] ?? role}
              </span>
              {profile?.created_at ? (
                <span className="text-xs text-blue-100/80">
                  สมาชิกตั้งแต่ {formatDate(profile.created_at)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        {role === "provider" ? (
          <>
            <Link
              href="/provider"
              className="group flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 shadow-card transition hover:border-blue-200"
            >
              <span className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 text-blue-600 ring-1 ring-blue-100/70">
                  <WrenchIcon className="size-5" />
                </span>
                แดชบอร์ดช่าง
              </span>
              <ChevronRightIcon className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />
            </Link>
            <Link
              href="/provider/profile"
              className="group flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 shadow-card transition hover:border-blue-200"
            >
              <span className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 text-blue-600 ring-1 ring-blue-100/70">
                  <WrenchIcon className="size-5" />
                </span>
                โปรไฟล์ผู้ให้บริการ
              </span>
              <ChevronRightIcon className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />
            </Link>
          </>
        ) : (
          <Link
            href="/bookings"
            className="group flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 shadow-card transition hover:border-blue-200"
          >
            <span className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 text-blue-600 ring-1 ring-blue-100/70">
                <CalendarIcon className="size-5" />
              </span>
              การจองของฉัน
            </span>
            <ChevronRightIcon className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />
          </Link>
        )}
      </div>

      <div className={`mt-6 ${cardClass}`}>
        <h2 className="font-display text-lg font-bold text-ink">ข้อมูลส่วนตัว</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          ข้อมูลนี้ใช้สำหรับการติดต่อและให้บริการ
        </p>
        <div className="mt-4">
          <AccountForm
            fullName={profile?.full_name ?? ""}
            phone={profile?.phone ?? ""}
          />
        </div>
      </div>

      <div className="mt-4">
        <PushSubscribe />
      </div>

      <div className={`mt-4 ${cardClass}`}>
        <h2 className="font-display text-lg font-bold text-ink">เปลี่ยนรหัสผ่าน</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          ตั้งรหัสผ่านใหม่สำหรับบัญชีนี้
        </p>
        <div className="mt-4">
          <PasswordForm />
        </div>
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
