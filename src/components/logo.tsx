import Link from "next/link";
import { BoltIcon } from "./icons";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 text-white shadow-sm shadow-blue-600/30">
        <BoltIcon className="size-5" />
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight text-ink">
        Fast<span className="text-blue-600">Help</span>
      </span>
    </Link>
  );
}
