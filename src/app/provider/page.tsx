import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { acceptBooking } from "@/app/actions/bookings";
import {
  CalendarIcon,
  CheckIcon,
  ChevronRightIcon,
  MapPinIcon,
  StarIcon,
  UserIcon,
} from "@/components/icons";
import { Alert } from "@/components/form";
import { EmptyState, PaymentBadge, StatusBadge } from "@/components/ui";
import {
  getAuthContext,
  getOpenBookings,
  getProviderJobs,
  getProviderProfile,
} from "@/lib/data";
import { formatDateTime, formatTHB } from "@/lib/format";

export const metadata: Metadata = { title: "แดชบอร์ดช่าง" };

const ERROR_MESSAGES: Record<string, string> = {
  supabase: "ยังไม่ได้ตั้งค่า Supabase",
  "job-unavailable": "งานนี้ถูกช่างท่านอื่นรับไปแล้ว",
  forbidden: "คุณไม่มีสิทธิ์ดำเนินการนี้",
};

export default async function ProviderDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const auth = await getAuthContext();
  if (!auth) redirect("/login?next=/provider");
  if (auth.profile?.role !== "provider") redirect("/bookings");

  const [openJobs, myJobs, provider] = await Promise.all([
    getOpenBookings(),
    getProviderJobs(auth.user.id),
    getProviderProfile(auth.user.id),
  ]);

  const { error } = await searchParams;
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? decodeURIComponent(error))
    : null;

  const activeJobs = myJobs.filter(
    (job) => job.status === "accepted" || job.status === "in_progress",
  );
  const completedJobs = myJobs.filter((job) => job.status === "completed");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {errorMessage ? (
        <div className="mb-4">
          <Alert>{errorMessage}</Alert>
        </div>
      ) : null}

      <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 p-5 text-white shadow-lg shadow-teal-900/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-teal-50">สวัสดี,</p>
            <h1 className="text-xl font-bold">
              {auth.profile?.full_name || "ผู้ให้บริการ"}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-teal-50">
              <span className="inline-flex items-center gap-1">
                <StarIcon className="size-3.5 text-amber-300" />
                {provider?.rating_count
                  ? `${provider.rating_avg.toFixed(1)} (${provider.rating_count} รีวิว)`
                  : "ยังไม่มีรีวิว"}
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckIcon className="size-3.5" />
                {provider?.is_available === false
                  ? "ปิดรับงาน"
                  : "เปิดรับงาน"}
              </span>
            </div>
          </div>
          <Link
            href="/provider/profile"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/25"
          >
            <UserIcon className="size-4" />
            โปรไฟล์
          </Link>
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur">
            <dt className="text-xs text-teal-50">งานรอรับ</dt>
            <dd className="text-xl font-bold">{openJobs.length}</dd>
          </div>
          <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur">
            <dt className="text-xs text-teal-50">กำลังทำ</dt>
            <dd className="text-xl font-bold">{activeJobs.length}</dd>
          </div>
          <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur">
            <dt className="text-xs text-teal-50">เสร็จแล้ว</dt>
            <dd className="text-xl font-bold">{completedJobs.length}</dd>
          </div>
        </dl>
      </div>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">งานที่รอรับ</h2>
          <span className="text-sm text-slate-500">{openJobs.length} งาน</span>
        </div>

        {openJobs.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="ยังไม่มีงานใหม่"
              description="เมื่อมีลูกค้าจองบริการ งานจะแสดงที่นี่"
            />
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {openJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-teal-50 text-2xl">
                    {job.service?.icon ?? "🛠️"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {job.service?.name ?? "บริการ"}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <CalendarIcon className="size-4" />
                      {formatDateTime(job.scheduled_at)}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <MapPinIcon className="size-4 shrink-0" />
                      <span className="truncate">{job.address}</span>
                    </p>
                    <p className="mt-2 text-sm font-bold text-teal-700">
                      {formatTHB(job.price)}
                    </p>
                  </div>
                </div>
                <form action={acceptBooking} className="mt-3">
                  <input type="hidden" name="booking_id" value={job.id} />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                  >
                    รับงานนี้
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">งานของฉัน</h2>

        {myJobs.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="ยังไม่มีงานที่รับไว้"
              description="กดรับงานจากรายการด้านบนเพื่อเริ่มให้บริการ"
            />
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {myJobs.map((job) => (
              <Link
                key={job.id}
                href={`/provider/jobs/${job.id}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300 hover:shadow-md"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-50 text-xl">
                  {job.service?.icon ?? "🛠️"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {job.service?.name ?? "บริการ"}
                    </h3>
                    <StatusBadge status={job.status} />
                    <PaymentBadge status={job.payment_status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {formatDateTime(job.scheduled_at)} · {job.address}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    ลูกค้า: {job.customer?.full_name || "-"}
                  </p>
                </div>
                <ChevronRightIcon className="size-5 shrink-0 text-slate-300" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
