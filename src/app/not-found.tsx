import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="pointer-events-none absolute top-16 size-56 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="relative grid size-32 place-items-center rounded-[2rem] bg-gradient-to-br from-blue-50 to-sky-50 ring-1 ring-blue-100">
        <span className="font-display text-5xl font-extrabold text-blue-600">
          404
        </span>
        <span className="absolute -right-2 -top-2 grid size-10 animate-float place-items-center rounded-2xl bg-white text-lg shadow-lg ring-1 ring-slate-100">
          🧭
        </span>
      </div>
      <h1 className="relative mt-6 font-display text-2xl font-extrabold tracking-tight text-ink">
        ไม่พบหน้าที่ต้องการ
      </h1>
      <p className="relative mt-1.5 text-sm text-slate-500">
        หน้านี้อาจถูกลบ เปลี่ยนชื่อ หรือไม่มีอยู่จริง
      </p>
      <div className="relative mt-7 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-sky-700"
        >
          กลับหน้าแรก
        </Link>
        <Link
          href="/services"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ดูบริการทั้งหมด
        </Link>
      </div>
    </div>
  );
}
