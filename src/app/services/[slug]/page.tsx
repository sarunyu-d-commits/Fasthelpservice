import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import {
  ArrowLeftIcon,
  BadgeCheckIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  ShieldIcon,
  StarIcon,
} from "@/components/icons";
import { getAuthContext, getServiceBySlug } from "@/lib/data";
import { formatTHB } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  return { title: service?.name ?? "ไม่พบบริการ" };
}

const perks = [
  {
    icon: ShieldIcon,
    title: "ช่างผ่านการตรวจสอบ",
    text: "คัดกรองประวัติและมีรีวิวจากลูกค้าจริงให้ตรวจสอบก่อนจอง",
  },
  {
    icon: ClockIcon,
    title: "นัดหมายได้ตามต้องการ",
    text: "เลือกวันและเวลาที่สะดวก พร้อมติดตามสถานะงานได้ในแอป",
  },
  {
    icon: MapPinIcon,
    title: "ให้บริการถึงที่",
    text: "ช่างเดินทางไปยังบ้านหรือสถานที่ที่คุณระบุ พร้อมแจ้งเวลาถึง",
  },
];

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, auth] = await Promise.all([
    getServiceBySlug(slug),
    getAuthContext(),
  ]);

  if (!service) notFound();

  const role = auth?.profile?.role;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-500 transition hover:border-blue-200 hover:text-blue-700"
      >
        <ArrowLeftIcon className="size-4" />
        กลับไปหน้าบริการ
      </Link>

      <div className="mt-4 grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-12 size-48 rounded-full bg-sky-100/60 blur-3xl" />

          <div className="relative flex flex-col items-start gap-5 sm:flex-row">
            <span className="grid size-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-blue-50 to-sky-50 text-5xl ring-1 ring-blue-100/70">
              {service.icon ?? "🛠️"}
            </span>
            <div>
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {service.category}
              </span>
              <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                {service.name}
              </h1>
              <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-slate-500">
                {service.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-600">
                  <StarIcon className="size-3.5" />
                  4.8 · รีวิวจากลูกค้าจริง
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 font-medium text-sky-700">
                  <BadgeCheckIcon className="size-3.5" />
                  ช่างผ่านการตรวจสอบ
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-sky-600 p-4 text-white shadow-lg shadow-blue-600/20">
              <p className="text-xs text-blue-50/90">ราคาเริ่มต้น</p>
              <p className="font-display text-xl font-bold">
                {formatTHB(service.base_price)}
              </p>
              <p className="text-[11px] text-blue-50/80">/ {service.unit}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">ระยะเวลาโดยประมาณ</p>
              <p className="font-display text-xl font-bold text-ink">
                {service.duration_minutes}{" "}
                <span className="text-sm font-medium text-slate-500">นาที</span>
              </p>
            </div>
            <div className="col-span-2 rounded-2xl bg-slate-50 p-4 sm:col-span-1">
              <p className="text-xs text-slate-500">ชำระเงิน</p>
              <p className="font-display text-xl font-bold text-ink">PromptPay</p>
              <p className="text-[11px] text-slate-400">สแกนจ่ายเมื่องานเสร็จ</p>
            </div>
          </div>

          <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <ShieldIcon className="size-3.5 text-blue-500" />
              รับประกันคุณภาพ 30 วัน
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckIcon className="size-3.5 text-blue-500" />
              ราคาชัดเจน ไม่มีบวกเพิ่ม
            </span>
          </div>
        </section>

        <div className="lg:sticky lg:top-24">
          <section
            id="booking"
            className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(37,99,235,0.5)]"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-ink">
                จองบริการนี้
              </h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                เริ่ม {formatTHB(service.base_price)}
              </span>
            </div>

            {!auth ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-slate-600">
                  เข้าสู่ระบบเพื่อเลือกวันเวลาและยืนยันการจอง
                </p>
                <Link
                  href={`/login?next=/services/${service.slug}`}
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:from-blue-700 hover:to-sky-700"
                >
                  เข้าสู่ระบบเพื่อจอง
                </Link>
                <Link
                  href="/register"
                  className="flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  สมัครสมาชิกใหม่
                </Link>
              </div>
            ) : role === "provider" ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-slate-600">
                  คุณเข้าสู่ระบบในฐานะผู้ให้บริการ หากต้องการรับงานนี้ไปที่แดชบอร์ดช่าง
                </p>
                <Link
                  href="/provider"
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:from-blue-700 hover:to-sky-700"
                >
                  ไปที่แดชบอร์ดช่าง
                </Link>
              </div>
            ) : (
              <div className="mt-4">
                <BookingForm service={service} />
              </div>
            )}

            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-[11px] text-slate-400">
              <p className="flex items-center gap-1.5">
                <ShieldIcon className="size-3.5 text-blue-500" />
                ข้อมูลการจองของคุณปลอดภัยและเข้ารหัส
              </p>
              <p className="flex items-center gap-1.5">
                <ClockIcon className="size-3.5 text-blue-500" />
                ยกเลิกหรือเลื่อนนัดได้ก่อนช่างออกเดินทาง
              </p>
            </div>
          </section>
        </div>
      </div>

      <section className="mt-5 rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-lg font-bold text-ink">
          สิ่งที่คุณจะได้รับ
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {perks.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl bg-slate-50/70 p-4 ring-1 ring-slate-100"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-ink">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-sky-50 px-4 py-3 text-xs text-sky-700">
          <CheckIcon className="mt-0.5 size-4 shrink-0" />
          ชำระเงินผ่าน PromptPay QR เมื่อช่างให้บริการเสร็จ
          พร้อมเก็บหลักฐานการชำระในแอป
        </div>
      </section>
    </div>
  );
}
