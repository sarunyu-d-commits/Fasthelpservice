import Link from "next/link";
import { ServiceCard } from "@/components/service-card";
import { Logo } from "@/components/logo";
import {
  AppPreview,
  StepChooseArt,
  StepDoneArt,
  StepScheduleArt,
} from "@/components/illustrations";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BoltIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  QuoteIcon,
  SearchIcon,
  ShieldIcon,
  SparklesIcon,
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
    Art: StepChooseArt,
  },
  {
    title: "ระบุวันเวลาและที่อยู่",
    description: "นัดหมายวันเวลาที่สะดวก พร้อมบอกจุดสังเกตให้ช่างไปถึงง่าย",
    Art: StepScheduleArt,
  },
  {
    title: "ช่างรับงานและให้บริการ",
    description: "ติดตามสถานะ แชทกับช่าง และชำระเงินเมื่องานเสร็จ",
    Art: StepDoneArt,
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

const testimonials = [
  {
    name: "คุณนัท",
    role: "คอนโด สุขุมวิท",
    service: "ล้างแอร์",
    text: "จองล้างแอร์ตอนเช้า ช่างมาถึงไวมาก ทำงานละเอียด ราคาตรงตามที่แจ้งในแอป",
    emoji: "❄️",
  },
  {
    name: "คุณปอ",
    role: "บ้านเดี่ยว นนทบุรี",
    service: "ทำความสะอาดบ้าน",
    text: "ชอบที่ติดตามสถานะได้แบบเรียลไทม์ แชทคุยกับช่างสะดวก จ่ายผ่าน PromptPay ได้เลย",
    emoji: "🧹",
  },
  {
    name: "คุณกี้",
    role: "ออฟฟิศ พระราม 9",
    service: "ตรวจระบบไฟฟ้า",
    text: "ระบบจองใช้ง่ายมาก เลือกวันเวลาได้เอง แถมมีรีวิวให้ดูก่อนตัดสินใจ",
    emoji: "💡",
  },
];

export default async function HomePage() {
  const services = await getServices();
  const popular = services.slice(0, 6);
  const cheapest = services.length
    ? Math.min(...services.map((service) => service.base_price))
    : 0;

  const categoryInfo = Array.from(new Set(services.map((s) => s.category))).map(
    (name) => {
      const items = services.filter((service) => service.category === name);
      return {
        name,
        icon: items[0]?.icon ?? "🛠️",
        count: items.length,
        from: Math.min(...items.map((item) => item.base_price)),
      };
    },
  );
  const featuredCategories = categoryInfo.slice(0, 6);
  const quickCategories = featuredCategories.slice(0, 4);

  return (
    <div>
      {!isSupabaseConfigured() ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs text-amber-800">
          โหมดตัวอย่าง: ยังไม่ได้ตั้งค่า Supabase — คัดลอก .env.example เป็น
          .env.local แล้วใส่ URL และ anon key เพื่อใช้งานจริง
        </div>
      ) : null}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-48 size-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="bg-dots pointer-events-none absolute inset-x-0 top-0 h-64 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur">
              <BoltIcon className="size-3.5" />
              บริการถึงบ้าน ภายใน 60 นาที
              <span className="ml-1 size-1.5 animate-pulse rounded-full bg-sky-500" />
            </span>

            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              เรียกช่างที่ใช่
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-blue-500 bg-clip-text text-transparent">
                ถึงบ้านคุณ
              </span>
            </h1>

            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
              ล้างแอร์ ทำความสะอาด เปลี่ยนแบตเตอรี่ ซ่อมไฟฟ้า และอีกหลากหลายบริการ
              จองง่าย ช่างมืออาชีพ ราคาชัดเจน
            </p>

            <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <MapPinIcon className="size-4 text-blue-500" />
              ให้บริการใน{" "}
              <span className="font-semibold text-slate-700">
                กรุงเทพฯ และปริมณฑล
              </span>
            </div>

            <form
              action="/services"
              method="get"
              className="mt-2.5 flex max-w-xl items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-blue-900/5 focus-within:border-blue-300"
            >
              <span className="pl-2 text-slate-400">
                <SearchIcon className="size-5" />
              </span>
              <input
                type="search"
                name="q"
                placeholder="ค้นหาบริการ เช่น ล้างแอร์ ซ่อมท่อ"
                className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                aria-label="ค้นหาบริการ"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                ค้นหา
              </button>
            </form>

            <div className="mt-3 flex flex-wrap gap-2">
              {quickCategories.map((category) => (
                <Link
                  key={category.name}
                  href={`/services?category=${encodeURIComponent(category.name)}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                >
                  <span>{category.icon}</span>
                  {category.name}
                </Link>
              ))}
              <Link
                href="/services"
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-blue-300 bg-blue-50/60 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100/60"
              >
                ดูทั้งหมด
                <ArrowRightIcon className="size-3" />
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  {["น", "ป", "ก"].map((initial, index) => (
                    <span
                      key={initial}
                      className={`grid size-8 place-items-center rounded-full border-2 border-white text-[11px] font-bold text-white ${
                        ["bg-blue-500", "bg-sky-500", "bg-sky-500"][index]
                      }`}
                    >
                      {initial}
                    </span>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <StarIcon key={index} className="size-3" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">4.9</span> จาก
                    2,100+ รีวิว
                  </p>
                </div>
              </div>
              <span className="hidden h-8 w-px bg-slate-200 sm:block" />
              <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheckIcon className="size-4 text-blue-500" />
                  ช่างผ่านการตรวจสอบ
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldIcon className="size-4 text-blue-500" />
                  ชำระเงินปลอดภัย
                </span>
              </div>
            </div>
          </div>

          <div className="animate-fade-up anim-delay-2">
            <AppPreview />
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-10">
          <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-4 backdrop-blur sm:p-5">
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "บริการเริ่มต้น", value: formatTHB(cheapest) },
              { label: "หมวดบริการ", value: `${services.length}+` },
              { label: "คะแนนเฉลี่ย", value: "4.9" },
              { label: "เวลาตอบรับเฉลี่ย", value: "15 นาที" },
            ].map((stat) => (
              <div key={stat.label} className="px-2 text-center sm:text-left">
                <dt className="text-xs text-slate-500">{stat.label}</dt>
                <dd className="font-display text-xl font-bold text-ink sm:text-2xl">
                  {stat.value}
                </dd>
              </div>
            ))}
            </dl>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-100 pt-3.5 text-[11px] font-medium text-slate-500 sm:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <ShieldIcon className="size-3.5 text-blue-500" />
                รับประกันงาน 30 วัน
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckIcon className="size-3.5 text-blue-500" />
                ราคาชัดเจน ไม่มีบวกเพิ่ม
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PhoneIcon className="size-3.5 text-blue-500" />
                ช่างติดต่อกลับภายใน 15 นาที
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600">
              <SparklesIcon className="size-4" />
              หมวดบริการ
            </span>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
              เลือกงานที่คุณต้องการ
            </h2>
          </div>
          <Link
            href="/services"
            className="hidden items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 sm:inline-flex"
          >
            ดูทั้งหมด
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {featuredCategories.map((category) => (
            <Link
              key={category.name}
              href={`/services?category=${encodeURIComponent(category.name)}`}
              className="group flex flex-col items-center gap-2 rounded-3xl border border-slate-200/70 bg-white px-3 py-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 text-2xl transition group-hover:scale-110">
                {category.icon}
              </span>
              <span className="line-clamp-2 text-xs font-semibold text-slate-700">
                {category.name}
              </span>
              <span className="text-[11px] text-slate-400">
                {category.count} บริการ
              </span>
              <span className="-mt-1 text-[11px] font-semibold text-blue-600">
                เริ่ม {formatTHB(category.from)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular services */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600">
              <StarIcon className="size-4" />
              ยอดนิยม
            </span>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
              บริการที่ลูกค้าเลือกบ่อย
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              เลือกบริการที่ต้องการ แล้วนัดช่างได้ทันที
            </p>
          </div>
          <Link
            href="/services"
            className="hidden items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 sm:inline-flex"
          >
            ดูบริการทั้งหมด
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        <div className="mt-5 sm:hidden">
          <Link
            href="/services"
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
          >
            ดูบริการทั้งหมด
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="relative mt-8 overflow-hidden bg-white py-16">
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-[0.06]" />
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <BoltIcon className="size-3.5" />
              ใช้งานง่าย
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
              จองช่างได้ใน 3 ขั้นตอน
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              ไม่ต้องโทรตาม ไม่ต้องต่อรองราคา จบทุกขั้นตอนในแอปเดียว
            </p>
          </div>

          <div className="relative mt-10 grid gap-5 sm:grid-cols-3">
            <div className="pointer-events-none absolute inset-x-[16%] top-9 hidden border-t-2 border-dashed border-blue-200/80 sm:block" />
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="group relative flex flex-col items-center rounded-3xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/70 p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="absolute left-5 top-5 grid size-7 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
                  {index + 1}
                </span>
                <step.Art className="h-36 w-full max-w-[200px] transition group-hover:scale-[1.04]" />
                <h3 className="mt-4 font-display text-lg font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              <ShieldIcon className="size-3.5" />
              ทำไมต้อง FastHelp
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
              มั่นใจได้ทุกครั้งที่เปิดประตูให้ช่าง
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              เราคัดสรรช่าง ตรวจสอบตัวตน และเก็บรีวิวจากลูกค้าจริง
              เพื่อให้ทุกงานที่บ้านคุณจบอย่างมืออาชีพ
            </p>

            <div className="mt-7 space-y-3">
              {highlights.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex items-start gap-3.5 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-blue-100 via-sky-50 to-sky-100 opacity-70 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-6 shadow-xl shadow-blue-900/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">ความพึงพอใจลูกค้า</p>
                  <p className="font-display text-3xl font-extrabold text-ink">
                    98<span className="text-lg text-blue-600">%</span>
                  </p>
                </div>
                <span className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-500">
                  <StarIcon className="size-6" />
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { label: "ช่างที่ตรวจสอบแล้ว", value: "500+" },
                  { label: "งานที่สำเร็จ", value: "12,000+" },
                  { label: "ตอบรับเฉลี่ย", value: "15 นาที" },
                  { label: "บริการครอบคลุม", value: "12 จังหวัด" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-slate-50/80 px-4 py-3"
                  >
                    <p className="font-display text-lg font-bold text-blue-700">
                      {item.value}
                    </p>
                    <p className="text-[11px] text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-sky-50 px-4 py-3 text-xs text-sky-700">
                <CheckIcon className="size-4 shrink-0" />
                ทุกงานมีระบบติดตามสถานะและแชทกับช่างได้ตลอด
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <StarIcon className="size-3.5" />
              รีวิวจากลูกค้า
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
              เสียงจากบ้านที่เราไปดูแล
            </h2>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {testimonials.map((item) => (
              <figure
                key={item.name}
                className="flex flex-col rounded-3xl border border-slate-200/70 bg-slate-50/60 p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <QuoteIcon className="size-7 text-blue-200" />
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 ring-1 ring-sky-100">
                    <BadgeCheckIcon className="size-3" />
                    ใช้บริการจริง
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <StarIcon key={index} className="size-3.5" />
                  ))}
                </div>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                  {item.text}
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-2.5">
                  <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-sky-100 text-lg">
                    {item.emoji}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      {item.name}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {item.role} · {item.service}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Provider CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-sky-600 px-6 py-12 text-white shadow-xl shadow-blue-900/20 sm:px-12">
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-sky-300/20 blur-2xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-blue-50">
                <WrenchIcon className="size-3.5" />
                สำหรับผู้ให้บริการ
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
                มีฝีมือ? มาหารายได้กับ FastHelp
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-blue-50">
                สมัครเป็นผู้ให้บริการ รับงานใกล้บ้าน เลือกเวลาทำงานเองได้
                พร้อมระบบจัดการงานและลูกค้าในที่เดียว
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register?role=provider"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
                >
                  สมัครเป็นช่างวันนี้
                  <ArrowRightIcon className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  เข้าสู่ระบบผู้ให้บริการ
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: ClockIcon, label: "เลือกเวลาทำงานเอง" },
                { icon: MapPinIcon, label: "รับงานใกล้บ้าน" },
                { icon: PhoneIcon, label: "แชทลูกค้าในแอป" },
                { icon: BadgeCheckIcon, label: "โปรไฟล์น่าเชื่อถือ" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-2xl bg-white/10 px-3.5 py-3 text-xs font-medium text-blue-50 backdrop-blur"
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Logo />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
                แพลตฟอร์มเรียกช่างและบริการถึงบ้าน จองง่าย ช่างมืออาชีพ
                ราคาชัดเจน
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <PhoneIcon className="size-4 text-blue-500" />
                  02-000-0000
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPinIcon className="size-4 text-blue-500" />
                  กรุงเทพฯ และปริมณฑล
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">บริการ</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li>
                  <Link href="/services" className="hover:text-blue-700">
                    บริการทั้งหมด
                  </Link>
                </li>
                {categoryInfo.slice(0, 4).map((category) => (
                  <li key={category.name}>
                    <Link
                      href={`/services?category=${encodeURIComponent(category.name)}`}
                      className="hover:text-blue-700"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">บัญชี</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li>
                  <Link href="/login" className="hover:text-blue-700">
                    เข้าสู่ระบบ
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-blue-700">
                    สมัครสมาชิก
                  </Link>
                </li>
                <li>
                  <Link href="/account" className="hover:text-blue-700">
                    บัญชีของฉัน
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?role=provider"
                    className="hover:text-blue-700"
                  >
                    สมัครเป็นช่าง
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">ช่วยเหลือ</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li>
                  <Link href="/terms" className="hover:text-blue-700">
                    ข้อกำหนดการใช้งาน
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-blue-700">
                    นโยบายความเป็นส่วนตัว
                  </Link>
                </li>
                <li>
                  <Link href="/bookings" className="hover:text-blue-700">
                    ติดตามการจอง
                  </Link>
                </li>
                <li>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-sky-500" />
                    เปิดให้บริการทุกวัน 08:00–20:00
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row">
            <p>© {new Date().getFullYear()} FastHelp. สงวนลิขสิทธิ์</p>
            <p className="inline-flex items-center gap-1.5">
              <SparklesIcon className="size-3.5 text-blue-400" />
              สร้างด้วยความใส่ใจสำหรับบ้านทุกหลัง
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
