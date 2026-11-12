import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateBookingStatus } from "@/app/actions/bookings";
import { Alert } from "@/components/form";
import { ChatBox } from "@/components/chat-box";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  MapPinIcon,
  UserIcon,
} from "@/components/icons";
import { PaymentBadge, StatusBadge } from "@/components/ui";
import { getAuthContext, getBookingById, getMessages } from "@/lib/data";
import { formatDateTime, formatTHB } from "@/lib/format";

export const metadata: Metadata = { title: "รายละเอียดงาน" };

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: "คุณไม่มีสิทธิ์ดำเนินการนี้",
  "invalid-status": "สถานะไม่ถูกต้อง",
  supabase: "ยังไม่ได้ตั้งค่า Supabase",
};

export default async function ProviderJobPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const auth = await getAuthContext();
  if (!auth) redirect(`/login?next=/provider/jobs/${id}`);
  if (auth.profile?.role !== "provider") redirect("/bookings");

  const booking = await getBookingById(id);
  if (!booking) notFound();
  if (booking.provider_id !== auth.user.id) redirect("/provider");

  const messages = await getMessages(id);
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? decodeURIComponent(error))
    : null;
  const returnTo = `/provider/jobs/${id}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/provider"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeftIcon className="size-4" />
        กลับไปแดชบอร์ด
      </Link>

      {errorMessage ? (
        <div className="mt-4">
          <Alert>{errorMessage}</Alert>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card">
            <div className="flex items-start gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 text-3xl ring-1 ring-blue-100/70">
                {booking.service?.icon ?? "🛠️"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-xl font-bold tracking-tight text-ink">
                    {booking.service?.name ?? "บริการ"}
                  </h1>
                  <StatusBadge status={booking.status} />
                  <PaymentBadge status={booking.payment_status} />
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  รหัสงาน: {booking.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
              <div className="flex items-start gap-2.5">
                <CalendarIcon className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="text-slate-500">วันและเวลานัดหมาย</dt>
                  <dd className="font-medium text-slate-900">
                    {formatDateTime(booking.scheduled_at)}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="text-slate-500">ที่อยู่</dt>
                  <dd className="font-medium text-slate-900">
                    {booking.address}
                  </dd>
                </div>
              </div>
              {booking.notes ? (
                <div className="flex items-start gap-2.5">
                  <UserIcon className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div>
                    <dt className="text-slate-500">รายละเอียดเพิ่มเติม</dt>
                    <dd className="font-medium text-slate-900">
                      {booking.notes}
                    </dd>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-slate-500">ยอดที่ลูกค้าชำระ</span>
                <span className="font-display text-lg font-bold text-blue-700">
                  {formatTHB(booking.price)}
                </span>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card">
            <h2 className="mb-3 font-display text-lg font-bold text-ink">
              แชทกับลูกค้า
            </h2>
            <ChatBox
              bookingId={booking.id}
              currentUserId={auth.user.id}
              initialMessages={messages}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card">
            <h2 className="font-display text-lg font-bold text-ink">ข้อมูลลูกค้า</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-slate-50 font-semibold text-slate-600 ring-1 ring-slate-100">
                {booking.customer?.full_name.charAt(0) || "ล"}
              </span>
              <div>
                <p className="font-medium text-slate-900">
                  {booking.customer?.full_name || "ลูกค้า"}
                </p>
                <p className="text-xs text-slate-500">
                  {booking.customer?.phone || "ไม่ระบุเบอร์โทร"}
                </p>
              </div>
            </div>
            {booking.customer?.phone ? (
              <a
                href={`tel:${booking.customer.phone}`}
                className="mt-4 flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                โทรหาลูกค้า
              </a>
            ) : null}
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card">
            <h2 className="font-display text-lg font-bold text-ink">อัปเดตสถานะงาน</h2>

            {booking.status === "accepted" ? (
              <form action={updateBookingStatus} className="mt-3">
                <input type="hidden" name="booking_id" value={booking.id} />
                <input type="hidden" name="status" value="in_progress" />
                <input type="hidden" name="return_to" value={returnTo} />
                <button
                  type="submit"
                  className="w-full rounded-full bg-gradient-to-r from-blue-600 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-sky-700"
                >
                  เริ่มให้บริการ
                </button>
              </form>
            ) : booking.status === "in_progress" ? (
              <form action={updateBookingStatus} className="mt-3">
                <input type="hidden" name="booking_id" value={booking.id} />
                <input type="hidden" name="status" value="completed" />
                <input type="hidden" name="return_to" value={returnTo} />
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700"
                >
                  <CheckIcon className="size-4" />
                  งานเสร็จสิ้น
                </button>
              </form>
            ) : booking.status === "completed" ? (
              <p className="mt-2 rounded-xl bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700">
                งานนี้เสร็จสิ้นแล้ว ขอบคุณสำหรับการให้บริการ
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                สถานะปัจจุบัน: {booking.status === "cancelled" ? "ยกเลิก" : "รอดำเนินการ"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
