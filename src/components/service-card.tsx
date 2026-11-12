import Link from "next/link";
import { formatTHB } from "@/lib/format";
import type { Service } from "@/lib/types";
import { ArrowRightIcon, ClockIcon, ShieldIcon, StarIcon } from "./icons";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-28px_rgba(29,78,216,0.45)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_50px_-24px_rgba(37,99,235,0.45)]"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 size-24 rounded-full bg-blue-50 opacity-0 transition group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 text-3xl ring-1 ring-blue-100/70 transition duration-300 group-hover:scale-105">
          {service.icon ?? "🛠️"}
        </span>
        <span className="max-w-[60%] truncate rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-100">
          {service.category}
        </span>
      </div>

      <div className="relative">
        <div className="flex items-center gap-1.5">
          <h3 className="font-display text-lg font-bold text-ink">
            {service.name}
          </h3>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-600">
            <StarIcon className="size-3" />
            4.8
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {service.description}
        </p>
        <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-sky-600">
          <ShieldIcon className="size-3.5" />
          รับประกันคุณภาพ 30 วัน
        </p>
      </div>

      <div className="relative mt-auto flex items-end justify-between border-t border-dashed border-slate-100 pt-4">
        <div>
          <p className="text-[11px] text-slate-400">เริ่มต้น</p>
          <p className="font-display text-lg font-bold text-blue-700">
            {formatTHB(service.base_price)}
            <span className="text-xs font-normal text-slate-400">
              {" "}
              / {service.unit}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[11px] text-slate-500">
            <ClockIcon className="size-3.5" />
            {service.duration_minutes} นาที
          </span>
          <span className="grid size-9 place-items-center rounded-full bg-blue-600 text-white transition duration-300 group-hover:translate-x-0.5 group-hover:bg-blue-700">
            <ArrowRightIcon className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
