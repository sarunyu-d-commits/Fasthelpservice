import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { confirmPayment, updateBookingStatus } from "@/app/actions/bookings";
import { BookingMap } from "@/components/booking-map";
import { ChatBox } from "@/components/chat-box";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
  UserIcon,
} from "@/components/icons";
import { Alert } from "@/components/form";
import { PromptPayQR } from "@/components/promptpay-qr";
import { ReviewForm } from "@/components/review-form";
import { PaymentBadge, StatusBadge } from "@/components/ui";
import {
  getBookingById,
  getBookingReads,
  getMessages,
  getProviderProfile,
  getSessionUser,
} from "@/lib/data";
import { formatDateTime, formatTHB } from "@/lib/format";
import { isValidCoordinate } from "@/lib/location";
import type { BookingStatus } from "@/lib/types";

export const metadata: Metadata = { title: "รายละเอียดการจอง" };

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: "คุณไม่มีสิทธิ์ดำเนินการนี้",
  "not-found": "ไม่พบงานที่ต้องการ",
  "cannot-cancel": "ไม่สามารถยกเลิกงานที่เริ่มดำเนินการแล้ว",
  "cannot-pay": "ไม่สามารถชำระเงินงานที่ถูกยกเลิกแล้ว",
  "invalid-status": "สถานะไม่ถูกต้อง",
  supabase: "ยังไม่ได้ตั้งค่า Supabase",
};

const TIMELINE: { status: BookingStatus; label: string }[] = [
  { status: "pending", label: "รอช่างรับงาน" },
  { status: "accepted", label: "ช่างรับงาน" },
  { status: "in_progress", label: "กำลังให้บริการ" },
  { status: "completed", label: "เสร็จสิ้น" },
];

function timelineIndex(status: BookingStatus) {
  return TIMELINE.findIndex((step) => step.status === status);
}

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; paid?: string; reviewed?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const { error, paid, reviewed } = query;

  // session อ่านจาก cookie + booking query รันพร้อมกัน (RLS ตรวจสิทธิ์ให้แล้ว)
  const [user, booking] = await Promise.all([
    getSessionUser(),
    getBookingById(id),
  ]);
  if (!user) redirect(`/login?next=/bookings/${id}`);
  if (!booking) notFound();

  const isCustomer = booking.customer_id === user.id;
  const isProvider = booking.provider_id === user.id;

  if (!isCustomer && !isProvider) notFound();
  if (isProvider && !isCustomer) redirect(`/provider/jobs/${id}`);

  const [messages, reads, providerProfile] = await Promise.all([
    getMessages(id),
    getBookingReads(id),
    booking.provider_id ? getProviderProfile(booking.provider_id) : null,
  ]);

  const bookingLocation =
    booking.latitude !== null &&
    booking.longitude !== null &&
    isValidCoordinate(booking.latitude, booking.longitude)
      ? { latitude: booking.latitude, longitude: booking.longitude }
      : null;
  const currentStep = timelineIndex(booking.status);
  const promptpayId = process.env.NEXT_PUBLIC_PROMPTPAY_ID ?? "";
  const receiverName = process.env.NEXT_PUBLIC_PROMPTPAY_NAME ?? "FastHelp";
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? decodeURIComponent(error))
    : null;
  const canCancel =
    booking.status === "pending" || booking.status === "accepted";
  const canReview = booking.status === "completed" && !booking.review;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/bookings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeftIcon className="size-4" />
        กลับไปหน้าการจอง
      </Link>

      <div className="mt-4 space-y-3">
        {errorMessage ? <Alert>{errorMessage}</Alert> : null}
        {paid ? (
          <Alert tone="success">ยืนยันการชำระเงินเรียบร้อยแล้ว</Alert>
        ) : null}
        {reviewed ? (
          <Alert tone="success">ขอบคุณสำหรับรีวิวของคุณ</Alert>
        ) : null}
      </div>

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
                  รหัสการจอง: {booking.id.slice(0, 8).toUpperCase()}
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
                <span className="text-slate-500">ยอดชำระ</span>
                <span className="font-display text-lg font-bold text-blue-700">
                  {formatTHB(booking.price)}
                </span>
              </div>
            </dl>
          </div>

          {bookingLocation ? (
            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card">
              <h2 className="font-display text-lg font-bold text-ink">
                แผนที่จุดนัดหมาย
              </h2>
              <div className="mt-3">
                <BookingMap
                  latitude={bookingLocation.latitude}
                  longitude={bookingLocation.longitude}
                  label={booking.location_label}
                />
              </div>
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card">
            <h2 className="font-display text-lg font-bold text-ink">ชำระเงิน</h2>

            {booking.status === "cancelled" ? (
              <p className="mt-3 rounded-xl bg-slate-100 px-3.5 py-3 text-sm text-slate-600">
                งานนี้ถูกยกเลิกแล้ว จึงไม่ต้องชำระเงิน
              </p>
            ) : booking.payment_status === "paid" ? (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700">
                <CheckIcon className="size-5" />
                ชำระเงินเรียบร้อยแล้ว เมื่อ {formatDateTime(booking.updated_at)}
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                <p className="text-sm text-slate-600">
                  สแกน QR ด้านล่างด้วยแอปธนาคารเพื่อชำระเงิน
                  แล้วกดยืนยันการชำระเงิน
                </p>
                <PromptPayQR
                  amount={booking.price}
                  promptpayId={promptpayId}
                  receiverName={receiverName}
                />
                <form action={confirmPayment}>
                  <input type="hidden" name="booking_id" value={booking.id} />
                  <input
                    type="hidden"
                    name="return_to"
                    value={`/bookings/${booking.id}`}
                  />
                  <button
                    type="submit"
                    className="w-full rounded-full bg-gradient-to-r from-blue-600 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-sky-700"
                  >
                    ฉันชำระเงินแล้ว (ยืนยัน)
                  </button>
                </form>
                <p className="text-center text-xs text-slate-400">
                  * เวอร์ชันเดโม: การชำระเงินเป็นการยืนยันด้วยตนเอง
                  ยังไม่เชื่อมต่อเกตเวย์จริง
                </p>
              </div>
            )}
          </div>

          {canReview ? (
            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card">
              <h2 className="font-display text-lg font-bold text-ink">
                ให้คะแนนผู้ให้บริการ
              </h2>
              <div className="mt-3">
                <ReviewForm bookingId={booking.id} />
              </div>
            </div>
          ) : null}

          {booking.review ? (
            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card">
              <h2 className="font-display text-lg font-bold text-ink">รีวิวของคุณ</h2>
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <StarIcon
                    key={value}
                    className={`size-5 ${
                      value <= booking.review!.rating
                        ? "text-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
              {booking.review.comment ? (
                <p className="mt-2 text-sm text-slate-600">
                  {booking.review.comment}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink">
              แชทกับผู้ให้บริการ
            </h2>
            <ChatBox
              bookingId={booking.id}
              currentUserId={user.id}
              otherUserId={booking.provider_id}
              initialMessages={messages}
              reads={reads}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card">
            <h2 className="font-display text-lg font-bold text-ink">ผู้ให้บริการ</h2>
            {booking.provider ? (
              <div className="mt-3 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 font-semibold text-blue-700 ring-1 ring-blue-100/70">
                  {booking.provider.full_name.charAt(0) || "ช"}
                </span>
                <div>
                  <p className="font-medium text-slate-900">
                    {booking.provider.full_name}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <StarIcon className="size-3.5 text-amber-400" />
                    {providerProfile?.rating_count
                      ? `${providerProfile.rating_avg.toFixed(1)} (${providerProfile.rating_count} รีวิว)`
                      : "ยังไม่มีรีวิว"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                กำลังรอช่างรับงาน เมื่อมีช่างรับงาน สถานะจะอัปเดตที่หน้านี้
              </p>
            )}

            {booking.provider?.phone ? (
              <a
                href={`tel:${booking.provider.phone}`}
                className="mt-4 flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                โทร {booking.provider.phone}
              </a>
            ) : null}
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card">
            <h2 className="font-display text-lg font-bold text-ink">สถานะงาน</h2>
            {booking.status === "cancelled" ? (
              <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                การจองนี้ถูกยกเลิกแล้ว
              </p>
            ) : (
            <ol className="mt-3 space-y-3">
              {TIMELINE.map((step, index) => {
                const done = currentStep >= index;
                const active = currentStep === index;
                return (
                  <li key={step.status} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                        done
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {done ? <CheckIcon className="size-3.5" /> : index + 1}
                    </span>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          active ? "text-blue-700" : "text-slate-700"
                        }`}
                      >
                        {step.label}
                      </p>
                      {active ? (
                        <p className="flex items-center gap-1 text-xs text-slate-400">
                          <ClockIcon className="size-3" />
                          สถานะปัจจุบัน
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
            )}

            {canCancel ? (
              <form action={updateBookingStatus} className="mt-4">
                <input type="hidden" name="booking_id" value={booking.id} />
                <input type="hidden" name="status" value="cancelled" />
                <input
                  type="hidden"
                  name="return_to"
                  value={`/bookings/${booking.id}`}
                />
                <button
                  type="submit"
                  className="w-full rounded-full border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  ยกเลิกการจอง
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
