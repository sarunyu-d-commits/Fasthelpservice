"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/data";
import { isValidCoordinate } from "@/lib/location";
import { sendPushToUser } from "@/lib/push";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { BookingStatus, Service } from "@/lib/types";

export interface BookingFormState {
  error?: string;
}

const NOT_CONFIGURED =
  "ยังไม่ได้ตั้งค่า Supabase กรุณาใส่ค่าใน .env.local ก่อนใช้งาน";

function safeReturnPath(value: FormDataEntryValue | null, fallback: string) {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : fallback;
}

export async function createBooking(
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };

  const auth = await getAuthContext();
  if (!auth) return { error: "กรุณาเข้าสู่ระบบก่อนจองบริการ" };

  const serviceId = String(formData.get("service_id") ?? "");
  const scheduledAtRaw = String(
    formData.get("scheduled_at_iso") || formData.get("scheduled_at") || "",
  );
  const address = String(formData.get("address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const latitudeRaw = String(formData.get("latitude") ?? "").trim();
  const longitudeRaw = String(formData.get("longitude") ?? "").trim();
  const locationLabel =
    String(formData.get("location_label") ?? "").trim().slice(0, 200) || null;

  if (!serviceId) return { error: "ไม่พบบริการที่เลือก" };
  if (!scheduledAtRaw) return { error: "กรุณาเลือกวันและเวลานัดหมาย" };
  if (!address) return { error: "กรุณากรอกที่อยู่สำหรับให้บริการ" };

  let latitude: number | null = null;
  let longitude: number | null = null;
  if (latitudeRaw || longitudeRaw) {
    latitude = Number(latitudeRaw);
    longitude = Number(longitudeRaw);
    if (!isValidCoordinate(latitude, longitude)) {
      return { error: "พิกัดจุดนัดหมายไม่ถูกต้อง" };
    }
  }

  const scheduledAt = new Date(scheduledAtRaw);
  if (Number.isNaN(scheduledAt.getTime())) {
    return { error: "วันและเวลาไม่ถูกต้อง" };
  }
  if (scheduledAt.getTime() < Date.now()) {
    return { error: "กรุณาเลือกวันและเวลาในอนาคต" };
  }

  const supabase = await createClient();
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .maybeSingle<Service>();

  if (serviceError || !service) {
    return { error: "ไม่พบบริการนี้ในระบบ" };
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: auth.user.id,
      service_id: service.id,
      scheduled_at: scheduledAt.toISOString(),
      address,
      notes: notes || null,
      latitude,
      longitude,
      location_label: latitude !== null ? locationLabel : null,
      price: service.base_price,
      status: "pending",
      payment_status: "unpaid",
    })
    .select("id")
    .single();

  if (error || !booking) {
    return { error: `สร้างการจองไม่สำเร็จ: ${error?.message ?? "unknown"}` };
  }

  revalidatePath("/bookings");
  redirect(`/bookings/${booking.id}`);
}

async function loadBooking(supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function acceptBooking(formData: FormData) {
  const bookingId = String(formData.get("booking_id") ?? "");
  if (!isSupabaseConfigured()) redirect("/provider?error=supabase");

  const auth = await getAuthContext();
  if (!auth || auth.profile?.role !== "provider") {
    redirect(`/bookings/${bookingId}?error=forbidden`);
  }

  const supabase = await createClient();

  const { data: provider } = await supabase
    .from("provider_profiles")
    .select("is_available")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (!provider || provider.is_available === false) {
    redirect(`/provider?error=unavailable`);
  }

  const booking = await loadBooking(supabase, bookingId);

  if (!booking || booking.provider_id || booking.status !== "pending") {
    redirect(`/provider?error=job-unavailable`);
  }

  const { data: link } = await supabase
    .from("provider_services")
    .select("service_id")
    .eq("provider_id", auth.user.id)
    .eq("service_id", booking.service_id)
    .maybeSingle();

  if (!link) redirect(`/provider?error=service-mismatch`);

  const { error } = await supabase
    .from("bookings")
    .update({ provider_id: auth.user.id, status: "accepted" })
    .eq("id", bookingId)
    .is("provider_id", null);

  if (error) redirect(`/provider?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/provider");
  revalidatePath(`/provider/jobs/${bookingId}`);
  revalidatePath(`/bookings/${bookingId}`);
  redirect(`/provider/jobs/${bookingId}`);
}

const PROVIDER_STATUSES: BookingStatus[] = ["in_progress", "completed"];

export async function updateBookingStatus(formData: FormData) {
  const bookingId = String(formData.get("booking_id") ?? "");
  const status = String(formData.get("status") ?? "") as BookingStatus;
  const returnTo = safeReturnPath(
    formData.get("return_to"),
    `/bookings/${bookingId}`,
  );

  if (!isSupabaseConfigured()) redirect(`${returnTo}?error=supabase`);

  const auth = await getAuthContext();
  if (!auth) redirect(`/login?next=${encodeURIComponent(returnTo)}`);

  const supabase = await createClient();
  const booking = await loadBooking(supabase, bookingId);
  if (!booking) redirect(`${returnTo}?error=not-found`);

  const isCustomer = booking.customer_id === auth.user.id;
  const isProvider = booking.provider_id === auth.user.id;

  if (status === "cancelled") {
    if (!isCustomer) redirect(`${returnTo}?error=forbidden`);
    if (!["pending", "accepted"].includes(booking.status)) {
      redirect(`${returnTo}?error=cannot-cancel`);
    }
  } else if (PROVIDER_STATUSES.includes(status)) {
    if (!isProvider) redirect(`${returnTo}?error=forbidden`);
    if (status === "in_progress" && booking.status !== "accepted") {
      redirect(`${returnTo}?error=invalid-status`);
    }
    if (status === "completed" && booking.status !== "in_progress") {
      redirect(`${returnTo}?error=invalid-status`);
    }
  } else {
    redirect(`${returnTo}?error=invalid-status`);
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);

  const statusMessage: Record<BookingStatus, string> = {
    pending: "มีงานใหม่รอยืนยัน",
    accepted: "ช่างยืนยันรับงานแล้ว",
    in_progress: "ช่างเริ่มดำเนินงานแล้ว",
    completed: "งานเสร็จเรียบร้อยแล้ว",
    cancelled: "งานถูกยกเลิก",
  };
  await sendPushToUser(
    isProvider ? booking.customer_id : booking.provider_id,
    "อัปเดตสถานะงาน FastHelp",
    statusMessage[status],
    `/bookings/${bookingId}`,
  );

  revalidatePath(returnTo);
  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath(`/provider/jobs/${bookingId}`);
  revalidatePath("/provider");
  redirect(returnTo);
}

export async function confirmPayment(formData: FormData) {
  const bookingId = String(formData.get("booking_id") ?? "");
  const returnTo = safeReturnPath(
    formData.get("return_to"),
    `/bookings/${bookingId}`,
  );

  if (!isSupabaseConfigured()) redirect(`${returnTo}?error=supabase`);

  const auth = await getAuthContext();
  if (!auth) redirect(`/login?next=${encodeURIComponent(returnTo)}`);

  const supabase = await createClient();
  const booking = await loadBooking(supabase, bookingId);

  if (!booking || booking.customer_id !== auth.user.id) {
    redirect(`${returnTo}?error=forbidden`);
  }
  if (booking.status === "cancelled") {
    redirect(`${returnTo}?error=cannot-pay`);
  }
  if (booking.payment_status === "paid") {
    redirect(returnTo);
  }

  const { error } = await supabase
    .from("bookings")
    .update({ payment_status: "paid" })
    .eq("id", bookingId)
    .eq("customer_id", auth.user.id);

  if (error) redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);

  await sendPushToUser(
    booking.provider_id,
    "ชำระเงินแล้ว",
    "ลูกค้ายืนยันชำระเงินสำหรับงานนี้แล้ว",
    `/provider/jobs/${bookingId}`,
  );

  revalidatePath(returnTo);
  revalidatePath("/bookings");
  redirect(`${returnTo}?paid=1`);
}
