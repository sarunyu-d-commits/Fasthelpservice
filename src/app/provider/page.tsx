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
  getOpenBookings,
  getProfile,
  getProviderJobs,
  getProviderProfile,
  getProviderServiceIds,
  getSessionUser,
  getUnreadCountsForUser,
} from "@/lib/data";
import { formatDateTime, formatTHB } from "@/lib/format";

export const metadata: Metadata = { title: "แดชบอร์ดช่าง" };

const ERROR_MESSAGES: Record<string, string> = {
  supabase: "ยังไม่ได้ตั้งค่า Supabase",
  "job-unavailable": "งานนี้ถูกช่างท่านอื่นรับไปแล้ว",
  forbidden: "คุณไม่มีสิทธิ์ดำเนินการนี้",
  unavailable: "คุณปิดรับงานอยู่ กรุณาเปิดรับงานก่อน",
  "service-mismatch": "งานนี้ไม่ตรงกับบริการที่คุณให้บริการ",
};

export default async function ProviderDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/provider");

  // ทุก query รันพร้อมกัน รวม profile ที่ใช้เช็ค role ด้วย
  const [profile, openJobs, myJobs, provider, serviceIds, unread] =
    await Promise.all([
      getProfile(user.id),
      getOpenBookings(user.id),
      getProviderJobs(user.id),
      getProviderProfile(user.id),
      getProviderServiceIds(user.id),
      getUnreadCountsForUser(user.id),
    ]);
  if (profile?.role !== "provider") redirect("/bookings");

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

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-sky-700 p-5 text-white shadow-lg shadow-blue-900/20">
        <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-blue-50">สวัสดี,</p>
            <h1 className="font-display text-xl font-bold">
              {profile?.full_name || "ผู้ให้บริการ"}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-blue-50">
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
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/25"
          >
            <UserIcon className="size-4" />
            โปรไฟล์
          </Link>
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/10 p-3 text-center backdrop-blur">
            <dt className="text-xs text-blue-50">งานรอรับ</dt>
            <dd className="font-display text-xl font-bold">{openJobs.length}</dd>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-center backdrop-blur">
            <dt className="text-xs text-blue-50">กำลังทำ</dt>
            <dd className="font-display text-xl font-bold">{activeJobs.length}</dd>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-center backdrop-blur">
            <dt className="text-xs text-blue-50">เสร็จแล้ว</dt>
            <dd className="font-display text-xl font-bold">{completedJobs.length}</dd>
          </div>
        </dl>
      </div>

      {provider?.is_available === false ? (
        <div className="mt-4">
          <Alert tone="info">
            คุณปิดรับงานอยู่ เปิดรับงานได้ที่หน้า{" "}
            <Link href="/provider/profile" className="font-semibold underline">
              โปรไฟล์ช่าง
            </Link>
          </Alert>
        </div>
      ) : serviceIds.length === 0 ? (
        <div className="mt-4">
          <Alert tone="info">
            ยังไม่ได้เลือกบริการที่ให้ เลือกบริการได้ที่หน้า{" "}
            <Link href="/provider/profile" className="font-semibold underline">
              โปรไฟล์ช่าง
            </Link>{" "}
            เพื่อเริ่มรับงาน
          </Alert>
        </div>
      ) : null}

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">งานที่รอรับ</h2>
          <span className="text-sm text-slate-500">{openJobs.length} งาน</span>
        </div>

        {openJobs.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="ยังไม่มีงานใหม่"
              description="เมื่อมีลูกค้าจองบริการที่ตรงกับคุณ งานจะแสดงที่นี่"
            />
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {openJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-3xl border border-slate-200/70 bg-white p-4 shadow-card"
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 text-2xl ring-1 ring-blue-100/70">
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
                      <span>ที่อยู่จะแสดงหลังคุณรับงาน</span>
                    </p>
                    <p className="mt-2 text-sm font-bold text-blue-700">
                      {formatTHB(job.price)}
                    </p>
                  </div>
                </div>
                <form action={acceptBooking} className="mt-3">
                  <input type="hidden" name="booking_id" value={job.id} />
                  <button
                    type="submit"
                    className="w-full rounded-full bg-gradient-to-r from-blue-600 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-sky-700"
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
        <h2 className="text-lg font-bold text-ink">งานของฉัน</h2>

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
                className="group flex items-center gap-3 rounded-3xl border border-slate-200/70 bg-white p-4 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_24px_50px_-24px_rgba(37,99,235,0.45)]"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 text-xl ring-1 ring-blue-100/70">
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
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-xs text-slate-400">
                      ลูกค้า: {job.customer?.full_name || "-"}
                    </p>
                    {unread[job.id] ? (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                        {unread[job.id]} ข้อความใหม่
                      </span>
                    ) : null}
                  </div>
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
