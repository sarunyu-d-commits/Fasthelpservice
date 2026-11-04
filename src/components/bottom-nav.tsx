"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/types";
import {
  CalendarIcon,
  GridIcon,
  HomeIcon,
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

export function BottomNav({ role }: { role: Role | undefined }) {
  const pathname = usePathname();

  if (!role || pathname === "/login" || pathname === "/register") {
    return null;
  }

  const items = role === "provider" ? providerItems : customerItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                active ? "text-teal-600" : "text-slate-400"
              }`}
            >
              <Icon className="size-6" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
