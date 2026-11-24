"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ViewTransition } from "react";
import { ServiceCard } from "@/components/service-card";
import { EmptyState } from "@/components/ui";
import {
  CheckIcon,
  ClockIcon,
  SearchIcon,
  ShieldIcon,
  SparklesIcon,
} from "@/components/icons";
import { filterServices } from "@/lib/service-filter";
import type { Service } from "@/lib/types";

export function ServiceCatalog({ services }: { services: Service[] }) {
  const params = useSearchParams();
  const category = params.get("category") ?? undefined;
  const q = params.get("q") ?? undefined;
  const query = (q ?? "").trim();
  const categories = Array.from(new Set(services.map((s) => s.category)));
  const categoryMeta = categories.map((name) => ({
    name,
    icon: services.find((service) => service.category === name)?.icon ?? "🛠️",
  }));
  const activeCategory =
    category && categories.includes(category) ? category : undefined;

  const filtered = filterServices(services, {
    category: activeCategory,
    query,
  });

  const categoryHref = (value?: string) => {
    const nextParams = new URLSearchParams();
    if (value) nextParams.set("category", value);
    if (query) nextParams.set("q", query);
    const search = nextParams.toString();
    return search ? `/services?${search}` : "/services";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/70 px-5 py-8 shadow-sm backdrop-blur sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-56 rounded-full bg-sky-100/70 blur-3xl" />

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-white px-3 py-1 text-xs font-semibold text-blue-700">
            <SparklesIcon className="size-4" />
            แค็ตตาล็อกบริการ
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            บริการทั้งหมด
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            เลือกบริการที่ต้องการ แล้วนัดหมายช่างมืออาชีพให้ไปถึงบ้านคุณได้ทันที
          </p>

          <form
            key={query}
            action="/services"
            method="get"
            className="mt-5 flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm focus-within:border-blue-300"
          >
            {activeCategory ? (
              <input type="hidden" name="category" value={activeCategory} />
            ) : null}
            <span className="pl-2 text-slate-400">
              <SearchIcon className="size-5" />
            </span>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="ค้นหาบริการ เช่น ล้างแอร์ ซ่อมท่อ"
              className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              aria-label="ค้นหาบริการ"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:from-blue-700 hover:to-sky-700"
            >
              ค้นหา
            </button>
          </form>
        </div>
      </div>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        <Link
          href={categoryHref()}
          aria-current={!activeCategory ? "page" : undefined}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
            !activeCategory
              ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/25"
              : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
          }`}
        >
          ทั้งหมด
        </Link>
        {categoryMeta.map((item) => (
          <Link
            key={item.name}
            href={categoryHref(item.name)}
            aria-current={activeCategory === item.name ? "page" : undefined}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition ${
              activeCategory === item.name
                ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
            }`}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <ShieldIcon className="size-3.5 text-blue-500" />
          ช่างผ่านการตรวจสอบ
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckIcon className="size-3.5 text-blue-500" />
          ราคาชัดเจน ไม่มีบวกเพิ่ม
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ClockIcon className="size-3.5 text-blue-500" />
          นัดหมายวันเวลาได้เอง
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {query ? (
            <>
              ผลลัพธ์สำหรับ{" "}
              <span className="font-semibold text-slate-700">“{query}”</span>
            </>
          ) : activeCategory ? (
            <>
              หมวด{" "}
              <span className="font-semibold text-slate-700">
                {activeCategory}
              </span>
            </>
          ) : (
            "บริการแนะนำทั้งหมด"
          )}
        </p>
        <div className="flex shrink-0 items-center gap-3">
          {query || activeCategory ? (
            <Link
              href="/services"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              ล้างตัวกรอง
            </Link>
          ) : null}
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
            {filtered.length} บริการ
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={query ? `ไม่พบบริการที่ตรงกับ "${query}"` : "ไม่พบบริการในหมวดนี้"}
            description="ลองค้นหาด้วยคำอื่น เลือกหมวดอื่น หรือดูบริการทั้งหมด"
            action={
              query || activeCategory ? (
                <Link
                  href="/services"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  ดูบริการทั้งหมด
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        <ViewTransition
          key={`${activeCategory ?? ""}-${query}`}
          name="catalog-content"
          share="catalog-swap"
          enter="catalog-swap"
          default="none"
        >
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </ViewTransition>
      )}
    </div>
  );
}
