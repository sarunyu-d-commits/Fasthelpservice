import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarIcon, MapPinIcon, PlusIcon } from "@/components/icons";
import { EmptyState, PaymentBadge, StatusBadge } from "@/components/ui";
import {
  getAuthContext,
  getCustomerBookings,
  getUnreadCountsForUser,
} from "@/lib/data";
import { formatDateTime, formatTHB } from "@/lib/format";

export const metadata: Metadata = { title: "การจองของฉัน" };

export default async function BookingsPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login?next=/bookings");
  if (auth.profile?.role === "provider") redirect("/provider");

  // RLS กรอง messages ให้เอง → unread รันคู่กับ bookings ได้ ไม่ต้องรอกัน
  const [bookings, unread] = await Promise.all([
    getCustomerBookings(auth.user.id),
    getUnreadCountsForUser(auth.user.id),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            การจองของฉัน
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">
            ติดตามงานของคุณ
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ดูสถานะงาน ชำระเงิน และพูดคุยกับช่างได้ที่นี่
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-sky-700"
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
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
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
              className="group block rounded-3xl border border-slate-200/70 bg-white p-4 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_24px_50px_-24px_rgba(37,99,235,0.45)]"
            >
              <div className="flex items-start gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 text-2xl ring-1 ring-blue-100/70">
                  {booking.service?.icon ?? "🛠️"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display font-bold text-ink">
                      {booking.service?.name ?? "บริการ"}
                    </h2>
                    <StatusBadge status={booking.status} />
                    <PaymentBadge status={booking.payment_status} />
                  </div>
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                    <CalendarIcon className="size-4 text-slate-400" />
                    {formatDateTime(booking.scheduled_at)}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPinIcon className="size-4 shrink-0 text-slate-400" />
                    <span className="truncate">{booking.address}</span>
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-dashed border-slate-100 pt-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-400">
                        {booking.provider?.full_name
                          ? `ช่าง: ${booking.provider.full_name}`
                          : "รอช่างรับงาน"}
                      </span>
                      {unread[booking.id] ? (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                          {unread[booking.id]} ข้อความใหม่
                        </span>
                      ) : null}
                    </div>
                    <span className="font-display font-bold text-blue-700">
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
