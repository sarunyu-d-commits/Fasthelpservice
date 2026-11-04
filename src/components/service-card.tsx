import Link from "next/link";
import { formatTHB } from "@/lib/format";
import type { Service } from "@/lib/types";
import { ChevronRightIcon, ClockIcon } from "./icons";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-teal-50 text-2xl">
        {service.icon ?? "🛠️"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-slate-900">
          {service.name}
        </span>
        <span className="mt-0.5 block truncate text-sm text-slate-500">
          {service.description}
        </span>
        <span className="mt-1.5 flex items-center gap-3 text-sm">
          <span className="font-semibold text-teal-700">
            เริ่ม {formatTHB(service.base_price)}
          </span>
          <span className="inline-flex items-center gap-1 text-slate-400">
            <ClockIcon className="size-4" />
            {service.duration_minutes} นาที
          </span>
        </span>
      </span>
      <ChevronRightIcon className="size-5 shrink-0 text-slate-300 transition group-hover:text-teal-500" />
    </Link>
  );
}
