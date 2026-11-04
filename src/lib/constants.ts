import type { BookingStatus, PaymentStatus } from "./types";

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "รอช่างรับงาน",
  accepted: "ช่างรับงานแล้ว",
  in_progress: "กำลังให้บริการ",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
};

export const BOOKING_STATUS_STYLE: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-sky-100 text-sky-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-200 text-slate-600",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "ยังไม่ชำระ",
  pending: "รอตรวจสอบ",
  paid: "ชำระแล้ว",
  refunded: "คืนเงินแล้ว",
};

export const PAYMENT_STATUS_STYLE: Record<PaymentStatus, string> = {
  unpaid: "bg-rose-100 text-rose-700",
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  refunded: "bg-slate-200 text-slate-600",
};
