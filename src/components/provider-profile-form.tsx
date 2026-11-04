"use client";

import { useActionState } from "react";
import {
  updateProviderProfile,
  type ProfileFormState,
} from "@/app/actions/profile";
import type { ProviderProfile, Service } from "@/lib/types";
import { Alert, SubmitButton, inputClass, labelClass } from "./form";

const initialState: ProfileFormState = {};

export function ProviderProfileForm({
  services,
  selectedServiceIds,
  provider,
}: {
  services: Service[];
  selectedServiceIds: string[];
  provider: ProviderProfile | null;
}) {
  const [state, action] = useActionState(updateProviderProfile, initialState);

  return (
    <form action={action} className="space-y-5">
      {state?.error ? <Alert>{state.error}</Alert> : null}
      {state?.message ? <Alert tone="success">{state.message}</Alert> : null}

      <div>
        <label htmlFor="bio" className={labelClass}>
          แนะนำตัว
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          maxLength={500}
          defaultValue={provider?.bio ?? ""}
          placeholder="เล่าประสบการณ์และความถนัดของคุณ"
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="service_area" className={labelClass}>
            พื้นที่ให้บริการ
          </label>
          <input
            id="service_area"
            name="service_area"
            defaultValue={provider?.service_area ?? ""}
            placeholder="เช่น กรุงเทพฯ, นนทบุรี"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="years_experience" className={labelClass}>
            ประสบการณ์ (ปี)
          </label>
          <input
            id="years_experience"
            name="years_experience"
            type="number"
            min={0}
            max={60}
            defaultValue={provider?.years_experience ?? 0}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3">
        <input
          type="checkbox"
          name="is_available"
          defaultChecked={provider?.is_available ?? true}
          className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
        />
        <span className="text-sm font-medium text-slate-700">
          เปิดรับงานใหม่
        </span>
      </label>

      <div>
        <span className={labelClass}>บริการที่ให้</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((service) => (
            <label
              key={service.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            >
              <input
                type="checkbox"
                name="service_ids"
                value={service.id}
                defaultChecked={selectedServiceIds.includes(service.id)}
                className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-lg">{service.icon}</span>
              <span className="text-slate-700">{service.name}</span>
            </label>
          ))}
        </div>
      </div>

      <SubmitButton pendingText="กำลังบันทึก...">บันทึกโปรไฟล์</SubmitButton>
    </form>
  );
}
