import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { setProviderVerified, setServiceActive } from "@/app/actions/admin";
import { Alert } from "@/components/form";
import { CheckIcon, ShieldIcon, StarIcon } from "@/components/icons";
import { StatusBadge } from "@/components/ui";
import { getAllProviders, getAllServices, getAuthContext, getRecentBookings } from "@/lib/data";
import { formatDateTime, formatTHB } from "@/lib/format";

export const metadata: Metadata = { title: "ผู้ดูแลระบบ" };

const MESSAGES: Record<string, string> = {
  "provider-updated": "อัปเดตสถานะผู้ให้บริการแล้ว",
  "service-updated": "อัปเดตสถานะบริการแล้ว",
};

const ERRORS: Record<string, string> = {
  supabase: "ยังไม่ได้ตั้งค่า Supabase",
  invalid: "ข้อมูลไม่ถูกต้อง",
  update: "บันทึกไม่สำเร็จ กรุณาลองใหม่",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const auth = await getAuthContext();
  if (!auth) redirect("/login?next=/admin");
  if (auth.profile?.role !== "admin") redirect("/account");

  const [providers, services, bookings] = await Promise.all([
    getAllProviders(),
    getAllServices(),
    getRecentBookings(10),
  ]);

  const { message, error } = await searchParams;
  const verifiedCount = providers.filter((provider) => provider.is_verified).length;
  const activeServiceCount = services.filter((service) => service.is_active).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center gap-2">
        <ShieldIcon className="size-6 text-teal-600" />
        <h1 className="text-2xl font-bold text-slate-900">ผู้ดูแลระบบ</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        ตรวจสอบช่าง ยืนยันตัวตน และจัดการบริการในระบบ
      </p>

      {error ? (
        <div className="mt-4">
          <Alert>{ERRORS[error] ?? "เกิดข้อผิดพลาด"}</Alert>
        </div>
      ) : null}
      {message ? (
        <div className="mt-4">
          <Alert tone="success">{MESSAGES[message] ?? "บันทึกเรียบร้อยแล้ว"}</Alert>
        </div>
      ) : null}

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "ช่างทั้งหมด", value: providers.length },
          { label: "ยืนยันแล้ว", value: verifiedCount },
          { label: "บริการทั้งหมด", value: services.length },
          { label: "บริการเปิดใช้", value: activeServiceCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <dt className="text-sm text-slate-500">{stat.label}</dt>
            <dd className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">ผู้ให้บริการ</h2>
        {providers.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">ยังไม่มีผู้ให้บริการในระบบ</p>
        ) : (
          <div className="mt-3 space-y-3">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold text-slate-900">
                      {provider.profile?.full_name || "ไม่ระบุชื่อ"}
                      {provider.is_verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          <CheckIcon className="size-3.5" />
                          ยืนยันแล้ว
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          รอยืนยัน
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-slate-500">
                      {provider.profile?.phone || "ไม่มีเบอร์โทร"} ·{" "}
                      {provider.service_area || "ไม่ระบุพื้นที่"}
                    </p>
                    <p className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <StarIcon className="size-3.5 text-amber-400" />
                        {provider.rating_avg.toFixed(1)} ({provider.rating_count})
                      </span>
                      <span>
                        {provider.is_available ? "เปิดรับงาน" : "ปิดรับงาน"}
                      </span>
                    </p>
                  </div>

                  <form action={setProviderVerified}>
                    <input type="hidden" name="provider_id" value={provider.id} />
                    <input
                      type="hidden"
                      name="verified"
                      value={provider.is_verified ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                        provider.is_verified
                          ? "border border-slate-200 text-slate-600 hover:bg-slate-50"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      {provider.is_verified ? "ยกเลิกการยืนยัน" : "ยืนยันช่าง"}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">บริการ</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {service.icon ?? "🛠️"} {service.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {service.category} · {formatTHB(service.base_price)} / {service.unit}
                </p>
              </div>
              <form action={setServiceActive} className="shrink-0">
                <input type="hidden" name="service_id" value={service.id} />
                <input
                  type="hidden"
                  name="active"
                  value={service.is_active ? "false" : "true"}
                />
                <button
                  type="submit"
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    service.is_active
                      ? "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      : "bg-teal-600 text-white hover:bg-teal-700"
                  }`}
                >
                  {service.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">การจองล่าสุด</h2>
          <Link href="/bookings" className="text-sm font-medium text-teal-600">
            ดูทั้งหมด
          </Link>
        </div>
        {bookings.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">ยังไม่มีการจอง</p>
        ) : (
          <div className="mt-3 space-y-2">
            {bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition hover:border-teal-300"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {booking.service?.icon ?? "🛠️"} {booking.service?.name ?? "บริการ"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {booking.customer?.full_name || "ลูกค้า"} ·{" "}
                    {formatDateTime(booking.scheduled_at)} · {formatTHB(booking.price)}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
