import Link from "next/link";
import { BoltIcon } from "./icons";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-600/30">
        <BoltIcon className="size-5" />
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">
        Fast<span className="text-teal-600">Help</span>
      </span>
    </Link>
  );
}
