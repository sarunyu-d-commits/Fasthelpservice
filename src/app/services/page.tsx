import type { Metadata } from "next";
import { Suspense } from "react";
import { ServiceCatalog } from "@/components/service-catalog";
import { getServices } from "@/lib/data";

export const metadata: Metadata = { title: "บริการทั้งหมด" };

// ข้อมูลบริการเป็นของสาธารณะ → เก็บที่ edge แล้ว rebuild ใหม่ทุก 60 วินาที
export const revalidate = 60;

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <Suspense fallback={null}>
      <ServiceCatalog services={services} />
    </Suspense>
  );
}
