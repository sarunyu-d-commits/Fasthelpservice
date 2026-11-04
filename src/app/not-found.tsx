import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <p className="text-6xl font-extrabold text-teal-600">404</p>
      <h1 className="mt-3 text-xl font-bold text-slate-900">ไม่พบหน้าที่ต้องการ</h1>
      <p className="mt-1 text-sm text-slate-500">
        หน้านี้อาจถูกลบ เปลี่ยนชื่อ หรือไม่มีอยู่จริง
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
      >
        กลับหน้าแรก
      </Link>
    </div>
  );
}
