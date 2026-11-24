import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { ProviderProfileForm } from "@/components/provider-profile-form";
import {
  getProfile,
  getProviderProfile,
  getProviderServiceIds,
  getServices,
  getSessionUser,
} from "@/lib/data";

export const metadata: Metadata = { title: "โปรไฟล์ช่าง" };

export default async function ProviderProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/provider/profile");

  const [profile, services, provider, selectedServiceIds] = await Promise.all([
    getProfile(user.id),
    getServices(),
    getProviderProfile(user.id),
    getProviderServiceIds(user.id),
  ]);
  if (profile?.role !== "provider") redirect("/bookings");

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
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          โปรไฟล์ช่าง
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">
          โปรไฟล์ผู้ให้บริการ
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          ข้อมูลนี้จะแสดงให้ลูกค้าเห็นเมื่อคุณรับงาน
        </p>
      </div>

      <div className="mt-5 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card">
        <ProviderProfileForm
          services={services}
          selectedServiceIds={selectedServiceIds}
          provider={provider}
        />
      </div>
    </div>
  );
}
