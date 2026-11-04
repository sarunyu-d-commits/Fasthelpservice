"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileFormState } from "@/app/actions/profile";
import { Alert, SubmitButton, inputClass, labelClass } from "./form";

const initialState: ProfileFormState = {};

export function AccountForm({
  fullName,
  phone,
}: {
  fullName: string;
  phone: string;
}) {
  const [state, action] = useActionState(updateProfile, initialState);

  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Alert>{state.error}</Alert> : null}
      {state?.message ? <Alert tone="success">{state.message}</Alert> : null}

      <div>
        <label htmlFor="full_name" className={labelClass}>
          ชื่อ-นามสกุล
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          defaultValue={fullName}
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
          defaultValue={phone}
          placeholder="0812345678"
          className={inputClass}
        />
      </div>

      <SubmitButton pendingText="กำลังบันทึก...">บันทึกข้อมูล</SubmitButton>
    </form>
  );
}
