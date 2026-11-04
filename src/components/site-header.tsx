import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import type { AuthContext } from "@/lib/types";
import { LogOutIcon } from "./icons";
import { Logo } from "./logo";

export function SiteHeader({ auth }: { auth: AuthContext | null }) {
  const role = auth?.profile?.role;
  const name = auth?.profile?.full_name || auth?.user.email || "";

  const links =
    role === "provider"
      ? [
          { href: "/provider", label: "แดชบอร์ดช่าง" },
          { href: "/provider/profile", label: "โปรไฟล์ช่าง" },
          { href: "/account", label: "บัญชี" },
        ]
      : role === "admin"
        ? [
            { href: "/admin", label: "ผู้ดูแลระบบ" },
            { href: "/services", label: "บริการ" },
            { href: "/bookings", label: "การจองทั้งหมด" },
            { href: "/account", label: "บัญชี" },
          ]
        : role === "customer"
          ? [
              { href: "/services", label: "บริการ" },
              { href: "/bookings", label: "การจองของฉัน" },
              { href: "/account", label: "บัญชี" },
            ]
          : [{ href: "/services", label: "บริการทั้งหมด" }];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {auth ? (
            <>
              <span className="hidden max-w-36 truncate text-sm font-medium text-slate-600 sm:block">
                {name}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                  aria-label="ออกจากระบบ"
                >
                  <LogOutIcon className="size-4" />
                  <span className="hidden sm:inline">ออก</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
