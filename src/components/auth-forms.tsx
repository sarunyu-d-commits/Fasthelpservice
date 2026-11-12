"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  requestPasswordReset,
  signIn,
  signUp,
  updatePassword,
  type AuthFormState,
} from "@/app/actions/auth";
import { Alert, SubmitButton, inputClass, labelClass } from "./form";

const initialState: AuthFormState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signIn, initialState);

  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Alert>{state.error}</Alert> : null}

      <div>
        <label htmlFor="email" className={labelClass}>
          อีเมล
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          รหัสผ่าน
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      <div className="-mt-1 text-right">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ลืมรหัสผ่าน?
        </Link>
      </div>

      <input type="hidden" name="next" value={next ?? ""} />

      <SubmitButton pendingText="กำลังเข้าสู่ระบบ...">
        เข้าสู่ระบบ
      </SubmitButton>

      <p className="text-center text-sm text-slate-500">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="font-semibold text-blue-600">
          สมัครสมาชิก
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, initialState);

  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Alert>{state.error}</Alert> : null}
      {state?.message ? <Alert tone="success">{state.message}</Alert> : null}

      <div>
        <label htmlFor="email" className={labelClass}>
          อีเมลที่ใช้สมัคร
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      <SubmitButton pendingText="กำลังส่งลิงก์...">
        ส่งลิงก์รีเซ็ตรหัสผ่าน
      </SubmitButton>

      <p className="text-center text-sm text-slate-500">
        จำรหัสผ่านได้แล้ว?{" "}
        <Link href="/login" className="font-semibold text-blue-600">
          กลับไปเข้าสู่ระบบ
        </Link>
      </p>
    </form>
  );
}

export function PasswordForm({
  submitLabel = "บันทึกรหัสผ่านใหม่",
  pendingText = "กำลังบันทึก...",
  successHref,
}: {
  submitLabel?: string;
  pendingText?: string;
  successHref?: string;
}) {
  const [state, action] = useActionState(updatePassword, initialState);

  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Alert>{state.error}</Alert> : null}
      {state?.message ? (
        <Alert tone="success">
          {state.message}
          {successHref ? (
            <>
              {" "}
              <Link href={successHref} className="font-semibold underline">
                ไปที่บัญชีของฉัน
              </Link>
            </>
          ) : null}
        </Alert>
      ) : null}

      <div>
        <label htmlFor="password" className={labelClass}>
          รหัสผ่านใหม่
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="อย่างน้อย 6 ตัวอักษร"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="confirm_password" className={labelClass}>
          ยืนยันรหัสผ่านใหม่
        </label>
        <input
          id="confirm_password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="กรอกรหัสผ่านอีกครั้ง"
          className={inputClass}
        />
      </div>

      <SubmitButton pendingText={pendingText}>{submitLabel}</SubmitButton>
    </form>
  );
}

export function RegisterForm({
  defaultRole = "customer",
}: {
  defaultRole?: "customer" | "provider";
}) {
  const [state, action] = useActionState(signUp, initialState);

  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Alert>{state.error}</Alert> : null}
      {state?.message ? <Alert tone="success">{state.message}</Alert> : null}

      <fieldset>
        <legend className={labelClass}>สมัครในฐานะ</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="role"
              value="customer"
              defaultChecked={defaultRole === "customer"}
              className="peer sr-only"
            />
            <span className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm transition peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:ring-4 peer-checked:ring-blue-500/10">
              <span className="font-semibold text-slate-900">ลูกค้า</span>
              <span className="text-xs text-slate-500">เรียกใช้บริการ</span>
            </span>
          </label>
          <label className="cursor-pointer">
            <input
              type="radio"
              name="role"
              value="provider"
              defaultChecked={defaultRole === "provider"}
              className="peer sr-only"
            />
            <span className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm transition peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:ring-4 peer-checked:ring-blue-500/10">
              <span className="font-semibold text-slate-900">ผู้ให้บริการ</span>
              <span className="text-xs text-slate-500">รับงาน/เป็นช่าง</span>
            </span>
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="full_name" className={labelClass}>
          ชื่อ-นามสกุล
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          placeholder="สมชาย ใจดี"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          เบอร์โทรศัพท์
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="0812345678"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          อีเมล
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          รหัสผ่าน
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="อย่างน้อย 6 ตัวอักษร"
          className={inputClass}
        />
      </div>

      <SubmitButton pendingText="กำลังสมัคร...">สมัครสมาชิก</SubmitButton>

      <p className="text-center text-sm text-slate-500">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/login" className="font-semibold text-blue-600">
          เข้าสู่ระบบ
        </Link>
      </p>
    </form>
  );
}
