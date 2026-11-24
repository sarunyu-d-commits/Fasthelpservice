"use client";

import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { useAuth } from "./auth-provider";
import { LogOutIcon, MapPinIcon } from "./icons";
import { Logo } from "./logo";

const customerNav = [
  { href: "/", label: "หน้าแรก" },
  { href: "/services", label: "บริการ" },
  { href: "/bookings", label: "การจอง" },
];

const providerNav = [
  { href: "/provider", label: "แดชบอร์ด" },
  { href: "/services", label: "บริการ" },
  { href: "/provider/profile", label: "โปรไฟล์ช่าง" },
];

const adminNav = [
  { href: "/admin", label: "แอดมิน" },
  { href: "/services", label: "บริการ" },
  { href: "/bookings", label: "การจอง" },
];

export function SiteHeader() {
  const auth = useAuth();
  const name = auth?.profile?.full_name || auth?.user.email || "";
  const initial = name.trim().charAt(0).toUpperCase() || "U";
  const role = auth?.profile?.role;
  const nav =
    role === "provider" ? providerNav : role === "admin" ? adminNav : customerNav;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200/70 sm:inline-flex">
            <MapPinIcon className="size-3 text-blue-500" />
            กรุงเทพฯ
          </span>

          {auth ? (
            <>
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
                aria-label="บัญชีของฉัน"
              >
                <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-sm font-bold text-white">
                  {initial}
                </span>
                <span className="hidden max-w-28 truncate sm:block">บัญชี</span>
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  aria-label="ออกจากระบบ"
                >
                  <LogOutIcon className="size-4" />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700 sm:inline-flex"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/services"
                className="rounded-full bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:from-blue-700 hover:to-sky-600"
              >
                จองเลย
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
