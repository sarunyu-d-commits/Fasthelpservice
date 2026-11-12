import type { ReactNode, SVGProps } from "react";
import { BadgeCheckIcon, CalendarIcon } from "./icons";

type ArtProps = SVGProps<SVGSVGElement>;

function StepBase({ children, ...props }: ArtProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 200" fill="none" aria-hidden="true" {...props}>
      <circle cx="120" cy="100" r="94" fill="#eff6ff" />
      <circle cx="196" cy="42" r="8" fill="#bae6fd" />
      <circle cx="44" cy="150" r="6" fill="#bfdbfe" />
      {children}
    </svg>
  );
}

export function StepChooseArt(props: ArtProps) {
  return (
    <StepBase {...props}>
      <rect x="76" y="26" width="88" height="148" rx="20" fill="#0f172a" />
      <rect x="82" y="34" width="76" height="128" rx="14" fill="#ffffff" />
      <rect x="102" y="39" width="36" height="5" rx="2.5" fill="#e2e8f0" />
      <rect x="91" y="54" width="27" height="24" rx="7" fill="#dbeafe" />
      <rect x="122" y="54" width="27" height="24" rx="7" fill="#dbeafe" />
      <rect x="91" y="84" width="27" height="24" rx="7" fill="#fef3c7" />
      <rect x="122" y="84" width="27" height="24" rx="7" fill="#ede9fe" />
      <rect x="91" y="116" width="58" height="10" rx="5" fill="#e2e8f0" />
      <rect x="91" y="132" width="42" height="8" rx="4" fill="#eef2f6" />
      <circle cx="156" cy="134" r="18" fill="#ffffff" stroke="#2563eb" strokeWidth="6" />
      <path d="M169 147l12 12" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
      <path d="M151 128l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z" fill="#f59e0b" />
      <path d="M60 66l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z" fill="#7dd3fc" />
    </StepBase>
  );
}

export function StepScheduleArt(props: ArtProps) {
  return (
    <StepBase {...props}>
      <rect x="56" y="46" width="128" height="116" rx="16" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
      <path d="M56 62a16 16 0 0116-16h96a16 16 0 0116 16v8H56v-8z" fill="#2563eb" />
      <rect x="82" y="36" width="8" height="20" rx="4" fill="#1d4ed8" />
      <rect x="150" y="36" width="8" height="20" rx="4" fill="#1d4ed8" />
      <circle cx="82" cy="92" r="6" fill="#cbd5e1" />
      <circle cx="106" cy="92" r="6" fill="#cbd5e1" />
      <circle cx="130" cy="92" r="6" fill="#2563eb" />
      <circle cx="154" cy="92" r="6" fill="#cbd5e1" />
      <circle cx="82" cy="116" r="6" fill="#cbd5e1" />
      <circle cx="106" cy="116" r="6" fill="#cbd5e1" />
      <circle cx="130" cy="116" r="6" fill="#cbd5e1" />
      <circle cx="154" cy="116" r="6" fill="#cbd5e1" />
      <circle cx="82" cy="140" r="6" fill="#cbd5e1" />
      <circle cx="106" cy="140" r="6" fill="#cbd5e1" />
      <circle cx="174" cy="150" r="30" fill="#ffffff" stroke="#3b82f6" strokeWidth="7" />
      <path d="M174 134v16l10 6" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M52 96l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z" fill="#7dd3fc" />
    </StepBase>
  );
}

export function StepDoneArt(props: ArtProps) {
  return (
    <StepBase {...props}>
      <path d="M70 108l50-40 50 40v58a8 8 0 01-8 8H78a8 8 0 01-8-8v-58z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
      <path d="M62 112l58-46 58 46" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="112" y="126" width="22" height="40" rx="4" fill="#1d4ed8" />
      <circle cx="129" cy="146" r="2.5" fill="#fbbf24" />
      <rect x="84" y="126" width="20" height="18" rx="4" fill="#bae6fd" />
      <rect x="142" y="126" width="20" height="18" rx="4" fill="#bae6fd" />
      <circle cx="176" cy="70" r="26" fill="#10b981" />
      <path d="M164 70l8 8 16-17" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M64 58l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8z" fill="#7dd3fc" />
      <path d="M190 120l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" fill="#fcd34d" />
    </StepBase>
  );
}

const previewServices = [
  { emoji: "❄️", name: "ล้างแอร์", price: "฿600", tone: "bg-sky-50" },
  { emoji: "🧹", name: "ทำความสะอาดบ้าน", price: "฿500", tone: "bg-amber-50" },
];

/**
 * Decorative in-app preview used in the marketing hero.
 * Purely presentational — no real data.
 */
export function AppPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div className="absolute -right-8 -top-8 size-40 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="absolute -bottom-10 -left-8 size-40 rounded-full bg-sky-200/50 blur-3xl" />

      <div className="relative rounded-[2.6rem] border border-white/70 bg-slate-900/95 p-2.5 shadow-[0_40px_80px_-30px_rgba(37,99,235,0.55)]">
        <div className="relative overflow-hidden rounded-[2.15rem] bg-cream">
          <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-900" />

          <div className="flex items-center justify-between px-5 pt-3 text-[10px] font-semibold text-slate-500">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span className="h-1.5 w-3 rounded-sm bg-slate-400" />
              <span className="h-1.5 w-4 rounded-sm bg-slate-400" />
            </span>
          </div>

          <div className="flex items-center justify-between px-5 pt-4">
            <div>
              <p className="text-[10px] text-slate-400">สวัสดีตอนเช้า</p>
              <p className="font-display text-sm font-bold text-ink">คุณลูกค้า 👋</p>
            </div>
            <div className="relative grid size-9 place-items-center rounded-full bg-blue-600 text-white">
              <CalendarIcon className="size-4" />
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white bg-amber-400" />
            </div>
          </div>

          <div className="mx-5 mt-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-[11px] text-slate-400 shadow-sm ring-1 ring-slate-100">
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" strokeLinecap="round" />
            </svg>
            ค้นหาบริการ เช่น ล้างแอร์
          </div>

          <div className="mt-4 flex gap-2 overflow-hidden px-5">
            {["แอร์", "ทำความสะอาด", "ไฟฟ้า", "รถ"].map((item, index) => (
              <span
                key={item}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold ${
                  index === 0
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-500 ring-1 ring-slate-100"
                }`}
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mx-5 mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-sky-600 p-3.5 text-white">
            <p className="text-[9px] text-blue-50/90">โปรโมชันวันนี้</p>
            <p className="mt-0.5 font-display text-sm font-bold leading-snug">
              ล้างแอร์ 2 เครื่อง ลด 15%
            </p>
            <span className="mt-2 inline-flex rounded-full bg-white/20 px-2.5 py-1 text-[9px] font-semibold">
              จองเลย →
            </span>
          </div>

          <div className="mt-4 px-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-800">บริการยอดนิยม</p>
              <p className="text-[10px] font-medium text-blue-600">ดูทั้งหมด</p>
            </div>
            <div className="mt-2 space-y-2">
              {previewServices.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center gap-2.5 rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-100"
                >
                  <span className={`grid size-8 place-items-center rounded-lg text-sm ${service.tone}`}>
                    {service.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold text-slate-800">
                      {service.name}
                    </p>
                    <p className="text-[9px] text-blue-600">เริ่ม {service.price}</p>
                  </div>
                  <span className="grid size-6 place-items-center rounded-full bg-blue-50 text-blue-600">
                    <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-around border-t border-slate-100 bg-white px-4 py-2.5">
            {[
              { icon: "M3 11l9-8 9 8v9a2 2 0 01-2 2h-4v-6H9v6H5a2 2 0 01-2-2v-9z", active: true },
              { icon: "M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v7H4zM13 14h7v7h-7z", active: false },
              { icon: "M7 3v3M17 3v3M4 8h16M4 6a2 2 0 012-2h12a2 2 0 012 2v13a2 2 0 01-2 2H6a2 2 0 01-2-2V6z", active: false },
              { icon: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0", active: false },
            ].map((item, index) => (
              <span
                key={index}
                className={index === 0 ? "text-blue-600" : "text-slate-300"}
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="animate-float absolute -left-8 top-24 hidden items-center gap-2 rounded-2xl border border-white/60 bg-white/95 px-3 py-2.5 shadow-xl shadow-blue-900/10 backdrop-blur sm:flex">
        <span className="grid size-9 place-items-center rounded-xl bg-amber-100 text-amber-500">
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
            <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" />
          </svg>
        </span>
        <span>
          <span className="block text-[10px] text-slate-400">คะแนนเฉลี่ย</span>
          <span className="block text-xs font-bold text-ink">4.9 · 2,100+ รีวิว</span>
        </span>
      </div>

      <div className="animate-float-slow absolute -right-6 top-44 hidden items-center gap-2 rounded-2xl border border-white/60 bg-white/95 px-3 py-2.5 shadow-xl shadow-blue-900/10 backdrop-blur sm:flex">
        <BadgeCheckIcon className="size-8 text-blue-500" />
        <span>
          <span className="block text-[10px] text-slate-400">ตรวจสอบแล้ว</span>
          <span className="block text-xs font-bold text-ink">ช่างมืออาชีพ</span>
        </span>
      </div>

      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
        <div className="animate-pop-in flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-white shadow-lg shadow-sky-600/30">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={3}>
            <path d="M5 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-semibold">ยืนยันการจองแล้ว</span>
        </div>
      </div>
    </div>
  );
}
