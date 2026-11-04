"use client";

import { useActionState, useMemo, useState } from "react";
import {
  createBooking,
  type BookingFormState,
} from "@/app/actions/bookings";
import { formatTHB } from "@/lib/format";
import type { Service } from "@/lib/types";
import { Alert, SubmitButton, inputClass, labelClass } from "./form";

const initialState: BookingFormState = {};

function toLocalInput(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function BookingForm({
  service,
  defaultAddress = "",
}: {
  service: Service;
  defaultAddress?: string;
}) {
  const [state, action] = useActionState(createBooking, initialState);
  const [min] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 60);
    return toLocalInput(now);
  });
  const [scheduledAt, setScheduledAt] = useState(() => {
    const suggested = new Date();
    suggested.setDate(suggested.getDate() + 1);
    suggested.setHours(9, 0, 0, 0);
    return toLocalInput(suggested);
  });

  const total = useMemo(() => service.base_price, [service.base_price]);

  const scheduledAtIso = useMemo(() => {
    if (!scheduledAt) return "";
    const date = new Date(scheduledAt);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }, [scheduledAt]);

  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Alert>{state.error}</Alert> : null}

      <input type="hidden" name="service_id" value={service.id} />
      <input type="hidden" name="scheduled_at_iso" value={scheduledAtIso} />

      <div>
        <label htmlFor="scheduled_at" className={labelClass}>
          วันและเวลานัดหมาย
        </label>
        <input
          id="scheduled_at"
          name="scheduled_at"
          type="datetime-local"
          required
          min={min || undefined}
          value={scheduledAt}
          onChange={(event) => setScheduledAt(event.target.value)}
          suppressHydrationWarning
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="address" className={labelClass}>
          ที่อยู่สำหรับให้บริการ
        </label>
        <textarea
          id="address"
          name="address"
          required
          rows={3}
          defaultValue={defaultAddress}
          placeholder="บ้านเลขที่ / อาคาร / ห้อง / จุดสังเกต"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          รายละเอียดเพิ่มเติม (ไม่บังคับ)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="เช่น จำนวนเครื่องแอร์, ชั้นที่อยู่, เวลาที่สะดวก"
          className={inputClass}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>ค่าบริการ {service.name}</span>
          <span>{formatTHB(total)} / {service.unit}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-dashed border-slate-300 pt-2">
          <span className="font-semibold text-slate-900">ยอดรวม (ประมาณ)</span>
          <span className="text-lg font-bold text-teal-700">
            {formatTHB(total)}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          * ราคาจริงอาจปรับตามหน้างาน โดยช่างจะยืนยันก่อนเริ่มให้บริการ
        </p>
      </div>

      <SubmitButton pendingText="กำลังสร้างการจอง...">
        ยืนยันการจอง
      </SubmitButton>
    </form>
  );
}
