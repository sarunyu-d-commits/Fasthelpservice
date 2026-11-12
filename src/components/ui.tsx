import type { ReactNode } from "react";
import {
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_STYLE,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_STYLE,
} from "@/lib/constants";
import type { BookingStatus, PaymentStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${BOOKING_STATUS_STYLE[status]}`}
    >
      {BOOKING_STATUS_LABEL[status]}
    </span>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${PAYMENT_STATUS_STYLE[status]}`}
    >
      {PAYMENT_STATUS_LABEL[status]}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-12 text-center">
      {icon ? (
        <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 text-blue-500 ring-1 ring-blue-100/70">
          {icon}
        </div>
      ) : null}
      <p className="font-display font-bold text-ink">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
