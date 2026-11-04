import Link from "next/link";
import { ServiceCard } from "@/components/service-card";
import {
  BoltIcon,
  CheckIcon,
  ClockIcon,
  ShieldIcon,
  StarIcon,
  WrenchIcon,
} from "@/components/icons";
import { getServices } from "@/lib/data";
import { formatTHB } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/server";

const steps = [
  {
    title: "เลือกบริการ",
    description: "เลือกงานที่ต้องการ เช่น ล้างแอร์ ทำความสะอาด หรือเปลี่ยนแบต",
  },
  {
    title: "ระบุวันเวลาและที่อยู่",
    description: "นัดหมายวันเวลาที่สะดวก พร้อมบอกจุดสังเกตให้ช่างไปถึงง่าย",
  },
  {
    title: "ช่างรับงานและให้บริการ",
    description: "ติดตามสถานะ แชทกับช่าง และชำระเงินเมื่องานเสร็จ",
  },
];

const highlights = [
  {
    icon: ShieldIcon,
    title: "ช่างผ่านการตรวจสอบ",
    description: "คัดสรรผู้ให้บริการที่มีประสบการณ์และคะแนนรีวิวที่ดี",
  },
  {
    icon: ClockIcon,
    title: "นัดหมายได้ตามต้องการ",
    description: "เลือกวันและเวลาที่สะดวก ช่างไปให้บริการถึงบ้าน",
  },
  {
    icon: StarIcon,
    title: "รีวิวจากลูกค้าจริง",
    description: "อ่านรีวิวก่อนตัดสินใจ และให้คะแนนหลังใช้บริการ",
  },
];

export default async function HomePage() {
  const services = await getServices();
  const popular = services.slice(0, 6);
  const cheapest = Math.min(...services.map((service) => service.base_price));

  return (
    <div>
      {!isSupabaseConfigured() ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs text-amber-800">
          โหมดตัวอย่าง: ยังไม่ได้ตั้งค่า Supabase — คัดลอก .env.example เป็น
          .env.local แล้วใส่ URL และ anon key เพื่อใช้งานจริง
        </div>
      ) : null}

      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50 via-white to-white">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 top-40 size-64 rounded-full bg-emerald-200/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-semibold text-teal-700 shadow-sm">
              <BoltIcon className="size-3.5" />
              บริการถึงบ้าน ภายใน 60 นาที
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              เรียกช่างที่ใช่
              <br />
              <span className="text-teal-600">ถึงบ้านคุณ</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
              ล้างแอร์ ทำความสะอาด เปลี่ยนแบตเตอรี่ ซ่อมไฟฟ้า และอีกหลากหลายบริการ
              จองง่าย ช่างมืออาชีพ ราคาชัดเจน
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700"
              >
                เลือกบริการเลย
                <WrenchIcon className="size-4" />
              </Link>
              <Link
                href="/register?role=provider"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-700"
              >
                สมัครเป็นผู้ให้บริการ
              </Link>
            </div>

            <dl className="mt-8 flex gap-8">
              <div>
                <dt className="text-xs text-slate-500">บริการเริ่มต้น</dt>
                <dd className="text-xl font-bold text-slate-900">
                  {formatTHB(cheapest)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">หมวดบริการ</dt>
                <dd className="text-xl font-bold text-slate-900">
                  {services.length}+
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">ให้คะแนนเฉลี่ย</dt>
                <dd className="flex items-center gap-1 text-xl font-bold text-slate-900">
                  4.8
                  <StarIcon className="size-4 text-amber-400" />
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/60 bg-white/80 p-3 shadow-2xl shadow-teal-900/10 backdrop-blur">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    บริการยอดนิยม
                  </p>
                  <Link
                    href="/services"
                    className="text-xs font-semibold text-teal-600"
                  >
                    ดูทั้งหมด
                  </Link>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {popular.slice(0, 4).map((service) => (
                    <Link
                      key={service.id}
                      href={`/services/${service.slug}`}
                      className="rounded-xl border border-slate-200 bg-white p-3 transition hover:border-teal-300 hover:shadow-sm"
                    >
                      <span className="text-2xl">{service.icon}</span>
                      <p className="mt-2 line-clamp-1 text-sm font-semibold text-slate-800">
                        {service.name}
                      </p>
                      <p className="text-xs text-teal-700">
                        เริ่ม {formatTHB(service.base_price)}
                      </p>
                    </Link>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
                  <CheckIcon className="size-4 shrink-0" />
                  ชำระเงินปลอดภัยด้วย PromptPay
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">บริการยอดนิยม</h2>
            <p className="mt-1 text-sm text-slate-500">
              เลือกบริการที่ต้องการ แล้วนัดช่างได้ทันที
            </p>
          </div>
          <Link
            href="/services"
            className="hidden text-sm font-semibold text-teal-600 sm:block"
          >
            ดูบริการทั้งหมด
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {popular.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            ใช้งานง่ายใน 3 ขั้นตอน
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
              >
                <span className="grid size-9 place-items-center rounded-full bg-teal-600 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-3 font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-600">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-700 px-6 py-10 text-center shadow-xl shadow-teal-900/20 sm:px-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            มีฝีมือ? มาหารายได้กับ FastHelp
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-teal-50">
            สมัครเป็นผู้ให้บริการ รับงานใกล้บ้าน เลือกเวลาทำงานเองได้
          </p>
          <Link
            href="/register?role=provider"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50"
          >
            สมัครเป็นช่างวันนี้
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} FastHelp</p>
          <div className="flex gap-4">
            <Link href="/services" className="hover:text-slate-800">
              บริการ
            </Link>
            <Link href="/login" className="hover:text-slate-800">
              เข้าสู่ระบบ
            </Link>
            <Link href="/register" className="hover:text-slate-800">
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
