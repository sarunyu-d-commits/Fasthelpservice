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
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <p className="text-5xl font-extrabold text-rose-500">!</p>
      <h1 className="mt-3 text-xl font-bold text-slate-900">เกิดข้อผิดพลาด</h1>
      <p className="mt-1 text-sm text-slate-500">
        ขออภัย ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
      >
        ลองอีกครั้ง
      </button>
    </div>
  );
}
