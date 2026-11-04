import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarIcon, MapPinIcon, PlusIcon } from "@/components/icons";
import { EmptyState, PaymentBadge, StatusBadge } from "@/components/ui";
import { getAuthContext, getCustomerBookings } from "@/lib/data";
import { formatDateTime, formatTHB } from "@/lib/format";

export const metadata: Metadata = { title: "การจองของฉัน" };

export default async function BookingsPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login?next=/bookings");
  if (auth.profile?.role === "provider") redirect("/provider");

  const bookings = await getCustomerBookings(auth.user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">การจองของฉัน</h1>
          <p className="mt-1 text-sm text-slate-500">
            ติดตามสถานะงานและชำระเงินได้ที่นี่
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          <PlusIcon className="size-4" />
          จองใหม่
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<CalendarIcon className="size-6" />}
            title="ยังไม่มีการจอง"
            description="เลือกบริการที่ต้องการ แล้วนัดหมายช่างได้เลย"
            action={
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                ดูบริการทั้งหมด
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/bookings/${booking.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-teal-50 text-2xl">
                  {booking.service?.icon ?? "🛠️"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">
                      {booking.service?.name ?? "บริการ"}
                    </h2>
                    <StatusBadge status={booking.status} />
                    <PaymentBadge status={booking.payment_status} />
                  </div>
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                    <CalendarIcon className="size-4" />
                    {formatDateTime(booking.scheduled_at)}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPinIcon className="size-4 shrink-0" />
                    <span className="truncate">{booking.address}</span>
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {booking.provider?.full_name
                        ? `ช่าง: ${booking.provider.full_name}`
                        : "รอช่างรับงาน"}
                    </span>
                    <span className="font-bold text-teal-700">
                      {formatTHB(booking.price)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
