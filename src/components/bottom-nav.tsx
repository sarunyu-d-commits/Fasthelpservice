"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { isAuthPath } from "@/lib/navigation";
import type { Role } from "@/lib/types";
import {
  CalendarIcon,
  GridIcon,
  HomeIcon,
  ShieldIcon,
  UserIcon,
  WrenchIcon,
} from "./icons";

const customerItems = [
  { href: "/", label: "หน้าแรก", Icon: HomeIcon },
  { href: "/services", label: "บริการ", Icon: GridIcon },
  { href: "/bookings", label: "การจอง", Icon: CalendarIcon },
  { href: "/account", label: "บัญชี", Icon: UserIcon },
];

const providerItems = [
  { href: "/provider", label: "แดชบอร์ด", Icon: WrenchIcon },
  { href: "/services", label: "บริการ", Icon: GridIcon },
  { href: "/provider/profile", label: "โปรไฟล์", Icon: UserIcon },
];

const adminItems = [
  { href: "/admin", label: "แอดมิน", Icon: ShieldIcon },
  { href: "/services", label: "บริการ", Icon: GridIcon },
  { href: "/bookings", label: "การจอง", Icon: CalendarIcon },
  { href: "/account", label: "บัญชี", Icon: UserIcon },
];

const subscribeToNothing = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function BottomNav({ role }: { role: Role | undefined }) {
  const pathname = usePathname();

  // usePathname อาจยังชี้ไปที่เส้นทางเก่าขณะ hydrate หลัง navigation
  // ให้ server และ client render ค่าเดียวกันก่อน แล้วค่อยอ่าน pathname หลัง mount
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!mounted || isAuthPath(pathname)) {
    return null;
  }

  const items =
    role === "provider"
      ? providerItems
      : role === "admin"
        ? adminItems
        : customerItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="mx-auto mb-3 w-[calc(100%-1.5rem)] max-w-md rounded-[1.6rem] border border-slate-200/80 bg-white/95 shadow-[0_18px_40px_-18px_rgba(29,78,216,0.35)] backdrop-blur-xl">
        <div className="flex items-stretch justify-around px-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5">
          {items.map(({ href, label, Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] font-semibold transition ${
                  active ? "text-blue-700" : "text-slate-400"
                }`}
              >
                <span
                  className={`grid h-8 w-14 place-items-center rounded-full transition ${
                    active ? "bg-blue-50" : ""
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
