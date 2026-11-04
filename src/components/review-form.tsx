"use client";

import { useActionState, useState } from "react";
import { submitReview, type ReviewFormState } from "@/app/actions/reviews";
import { Alert, SubmitButton, inputClass, labelClass } from "./form";
import { StarIcon } from "./icons";

const initialState: ReviewFormState = {};

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [state, action] = useActionState(submitReview, initialState);
  const [rating, setRating] = useState(5);

  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Alert>{state.error}</Alert> : null}
      <input type="hidden" name="booking_id" value={bookingId} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <span className={labelClass}>ให้คะแนนการบริการ</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} ดาว`}
              className="rounded-md p-0.5 transition hover:scale-110"
            >
              <StarIcon
                className={`size-8 ${
                  value <= rating ? "text-amber-400" : "text-slate-200"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className={labelClass}>
          ความคิดเห็น (ไม่บังคับ)
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          maxLength={1000}
          placeholder="เล่าประสบการณ์การใช้งาน..."
          className={inputClass}
        />
      </div>

      <SubmitButton pendingText="กำลังส่งรีวิว...">ส่งรีวิว</SubmitButton>
    </form>
  );
}
