import type { Metadata } from "next";
import Link from "next/link";
import { ServiceCard } from "@/components/service-card";
import { EmptyState } from "@/components/ui";
import { getServices } from "@/lib/data";

export const metadata: Metadata = { title: "บริการทั้งหมด" };

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const query = (q ?? "").trim();
  const services = await getServices();
  const categories = Array.from(new Set(services.map((s) => s.category)));
  const activeCategory =
    category && categories.includes(category) ? category : undefined;

  const needle = query.toLowerCase();
  const filtered = services.filter((service) => {
    const matchesCategory =
      !activeCategory || service.category === activeCategory;
    const matchesQuery =
      !needle ||
      [service.name, service.description ?? "", service.category].some((value) =>
        value.toLowerCase().includes(needle),
      );
    return matchesCategory && matchesQuery;
  });

  const categoryHref = (value?: string) => {
    const params = new URLSearchParams();
    if (value) params.set("category", value);
    if (query) params.set("q", query);
    const search = params.toString();
    return search ? `/services?${search}` : "/services";
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">บริการทั้งหมด</h1>
        <p className="mt-1 text-sm text-slate-500">
          เลือกบริการที่ต้องการ แล้วนัดหมายช่างได้ทันที
        </p>
      </div>

      <form action="/services" method="get" className="mt-5 flex gap-2">
        {activeCategory ? (
          <input type="hidden" name="category" value={activeCategory} />
        ) : null}
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="ค้นหาบริการ เช่น ล้างแอร์ ซ่อมท่อ"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          ค้นหา
        </button>
      </form>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        <Link
          href={categoryHref()}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
            !activeCategory
              ? "border-teal-600 bg-teal-600 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-teal-300"
          }`}
        >
          ทั้งหมด
        </Link>
        {categories.map((item) => (
          <Link
            key={item}
            href={categoryHref(item)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              activeCategory === item
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-teal-300"
            }`}
          >
            {item}
          </Link>
        ))}
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
                  className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  ดูบริการทั้งหมด
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {filtered.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
