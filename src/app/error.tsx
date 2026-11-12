"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="pointer-events-none absolute top-16 size-56 rounded-full bg-rose-100/60 blur-3xl" />
      <div className="relative grid size-24 place-items-center rounded-[2rem] bg-gradient-to-br from-rose-50 to-orange-50 ring-1 ring-rose-100">
        <span className="font-display text-4xl font-extrabold text-rose-500">
          !
        </span>
      </div>
      <h1 className="relative mt-6 font-display text-2xl font-extrabold tracking-tight text-ink">
        เกิดข้อผิดพลาด
      </h1>
      <p className="relative mt-1.5 text-sm text-slate-500">
        ขออภัย ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง
      </p>
      <button
        type="button"
        onClick={reset}
        className="relative mt-7 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-sky-700"
      >
        ลองอีกครั้ง
      </button>
    </div>
  );
}
