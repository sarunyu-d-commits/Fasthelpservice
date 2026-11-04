import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { ProviderProfileForm } from "@/components/provider-profile-form";
import {
  getAuthContext,
  getProviderProfile,
  getProviderServiceIds,
  getServices,
} from "@/lib/data";

export const metadata: Metadata = { title: "โปรไฟล์ช่าง" };

export default async function ProviderProfilePage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login?next=/provider/profile");
  if (auth.profile?.role !== "provider") redirect("/bookings");

  const [services, provider, selectedServiceIds] = await Promise.all([
    getServices(),
    getProviderProfile(auth.user.id),
    getProviderServiceIds(auth.user.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/provider"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeftIcon className="size-4" />
        กลับไปแดชบอร์ด
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-slate-900">โปรไฟล์ผู้ให้บริการ</h1>
        <p className="mt-1 text-sm text-slate-500">
          ข้อมูลนี้จะแสดงให้ลูกค้าเห็นเมื่อคุณรับงาน
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <ProviderProfileForm
          services={services}
          selectedServiceIds={selectedServiceIds}
          provider={provider}
        />
      </div>
    </div>
  );
}
