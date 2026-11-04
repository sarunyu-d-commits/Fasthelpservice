import type { Metadata } from "next";
import Link from "next/link";
import { ServiceCard } from "@/components/service-card";
import { EmptyState } from "@/components/ui";
import { getServices } from "@/lib/data";

export const metadata: Metadata = { title: "บริการทั้งหมด" };

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const services = await getServices();
  const categories = Array.from(new Set(services.map((s) => s.category)));
  const activeCategory =
    category && categories.includes(category) ? category : undefined;
  const filtered = activeCategory
    ? services.filter((service) => service.category === activeCategory)
    : services;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">บริการทั้งหมด</h1>
        <p className="mt-1 text-sm text-slate-500">
          เลือกบริการที่ต้องการ แล้วนัดหมายช่างได้ทันที
        </p>
      </div>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/services"
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
            href={`/services?category=${encodeURIComponent(item)}`}
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
            title="ไม่พบบริการในหมวดนี้"
            description="ลองเลือกหมวดอื่นหรือดูบริการทั้งหมด"
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
