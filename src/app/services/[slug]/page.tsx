import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import {
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  ShieldIcon,
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
  { icon: ShieldIcon, text: "ช่างผ่านการตรวจสอบและมีรีวิวจากลูกค้า" },
  { icon: ClockIcon, text: "นัดหมายวันและเวลาที่สะดวกได้เอง" },
  { icon: MapPinIcon, text: "ให้บริการถึงบ้านหรือสถานที่ที่ระบุ" },
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
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeftIcon className="size-4" />
        กลับไปหน้าบริการ
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-teal-50 text-4xl">
                {service.icon ?? "🛠️"}
              </span>
              <div>
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {service.category}
                </span>
                <h1 className="mt-1.5 text-2xl font-bold text-slate-900">
                  {service.name}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  {service.description}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">ราคาเริ่มต้น</p>
                <p className="mt-0.5 text-lg font-bold text-teal-700">
                  {formatTHB(service.base_price)}
                  <span className="text-xs font-normal text-slate-500">
                    {" "}
                    / {service.unit}
                  </span>
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">ระยะเวลาโดยประมาณ</p>
                <p className="mt-0.5 text-lg font-bold text-slate-900">
                  {service.duration_minutes} นาที
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">สิ่งที่คุณจะได้รับ</h2>
            <ul className="mt-3 space-y-2.5">
              {perks.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-start gap-2.5 text-sm text-slate-600"
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-teal-600" />
                  {text}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
              <CheckIcon className="mt-0.5 size-4 shrink-0" />
              ชำระเงินผ่าน PromptPay QR เมื่อช่างให้บริการเสร็จ
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-20">
            <h2 className="text-lg font-bold text-slate-900">จองบริการนี้</h2>

            {!auth ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-slate-600">
                  เข้าสู่ระบบเพื่อเลือกวันเวลาและยืนยันการจอง
                </p>
                <Link
                  href={`/login?next=/services/${service.slug}`}
                  className="flex w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
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
                  className="flex w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  ไปที่แดชบอร์ดช่าง
                </Link>
              </div>
            ) : (
              <div className="mt-4">
                <BookingForm service={service} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
