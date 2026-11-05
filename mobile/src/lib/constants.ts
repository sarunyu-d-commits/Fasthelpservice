import type { BookingStatus, PaymentStatus } from "./types";

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "รอช่างรับงาน",
  accepted: "ช่างรับงานแล้ว",
  in_progress: "กำลังให้บริการ",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
};

export const BOOKING_STATUS_COLOR: Record<
  BookingStatus,
  { background: string; text: string }
> = {
  pending: { background: "#fef3c7", text: "#92400e" },
  accepted: { background: "#e0f2fe", text: "#075985" },
  in_progress: { background: "#e0e7ff", text: "#3730a3" },
  completed: { background: "#ecfdf5", text: "#047857" },
  cancelled: { background: "#e2e8f0", text: "#475569" },
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "ยังไม่ชำระ",
  pending: "รอตรวจสอบ",
  paid: "ชำระแล้ว",
  refunded: "คืนเงินแล้ว",
};

export const PAYMENT_STATUS_COLOR: Record<
  PaymentStatus,
  { background: string; text: string }
> = {
  unpaid: { background: "#fff1f2", text: "#be123c" },
  pending: { background: "#fef3c7", text: "#92400e" },
  paid: { background: "#ecfdf5", text: "#047857" },
  refunded: { background: "#e2e8f0", text: "#475569" },
};

export const ROLE_LABEL: Record<string, string> = {
  customer: "ลูกค้า",
  provider: "ผู้ให้บริการ",
  admin: "ผู้ดูแลระบบ",
};
