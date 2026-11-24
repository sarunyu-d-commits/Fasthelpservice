"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type AuthError = {
  code: string;
  description?: string;
};

type AuthErrorInfo = {
  title: string;
  detail: string;
  href: string;
  label: string;
};

const ERROR_MESSAGES: Record<string, AuthErrorInfo> = {
  otp_expired: {
    title: "ลิงก์หมดอายุหรือถูกใช้แล้ว",
    detail:
      "ลิงก์ในอีเมลใช้ได้ครั้งเดียวและมีอายุจำกัด กรุณากลับไปขอลิงก์ใหม่ แล้วกดจากอีเมลฉบับล่าสุด",
    href: "/forgot-password",
    label: "ขอลิงก์ใหม่",
  },
  access_denied: {
    title: "การยืนยันไม่สำเร็จ",
    detail:
      "ระบบปฏิเสธการยืนยันตัวตนนี้อาจเกิดจากลิงก์เก่าหรือการตั้งค่าที่ไม่ตรงกัน กรุณาลองใหม่",
    href: "/login",
    label: "ไปหน้าเข้าสู่ระบบ",
  },
  invalid_request: {
    title: "ลิงก์ไม่ถูกต้อง",
    detail: "ลิงก์ที่คุณกดไม่สมบูรณ์ กรุณาขอใหม่จากหน้าเว็บเท่านั้น",
    href: "/forgot-password",
    label: "ขอลิงก์ใหม่",
  },
  email_not_confirmed: {
    title: "ยังไม่ได้ยืนยันอีเมล",
    detail:
      "กรุณากดลิงก์ยืนยันในกล่องจดหมายก่อนเข้าสู่ระบบ ถ้าไม่พบอีเมลให้ตรวจสอบโฟลเดอร์สแปม",
    href: "/login",
    label: "ไปหน้าเข้าสู่ระบบ",
  },
};

const GENERIC_INFO: AuthErrorInfo = {
  title: "พบปัญหาในการยืนยันตัวตน",
  detail: "เกิดข้อผิดพลาดระหว่างยืนยันลิงก์ กรุณาลองใหม่อีกครั้ง",
  href: "/login",
  label: "ไปหน้าเข้าสู่ระบบ",
};

function cleanAuthHash() {
  if (!window.location.hash) return;
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

export function AuthErrorNotice() {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const code = searchParams.get("error_code") ?? searchParams.get("error");

  useEffect(() => {
    if (code) cleanAuthHash();
  }, [code]);

  if (dismissed || !code) return null;

  const error: AuthError = {
    code,
    description: searchParams.get("error_description") ?? undefined,
  };

  const info = ERROR_MESSAGES[error.code] ?? GENERIC_INFO;

  return (
    <div
      role="alert"
      className="mx-auto mt-3 w-[calc(100%-1.5rem)] max-w-3xl rounded-[1.25rem] border border-amber-200 bg-amber-50/95 px-4 py-3 text-amber-900 shadow-[0_18px_40px_-24px_rgba(180,83,9,0.5)]"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-0.5 text-lg">
          ⚠️
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm">{info.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-800/90">
            {info.detail}
          </p>
          {error.description && error.description !== info.detail ? (
            <p className="mt-1 truncate text-[11px] text-amber-700/70">
              {error.description}
            </p>
          ) : null}
          <Link
            href={info.href}
            className="mt-2 inline-flex rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700"
          >
            {info.label}
          </Link>
        </div>
        <button
          type="button"
          aria-label="ปิดการแจ้งเตือน"
          onClick={() => setDismissed(true)}
          className="rounded-full px-2 py-1 text-lg leading-none text-amber-700/70 transition hover:bg-amber-100 hover:text-amber-900"
        >
          ×
        </button>
      </div>
    </div>
  );
}
