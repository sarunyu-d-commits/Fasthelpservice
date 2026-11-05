import { isSupabaseConfigured, supabase } from "./supabase";
import { SEED_SERVICES } from "./seed-services";
import type {
  Booking,
  BookingStatus,
  BookingWithRelations,
  Message,
  OpenJob,
  Profile,
  ProviderProfile,
  ProviderWithProfile,
  Review,
  Service,
} from "./types";

const BOOKING_SELECT = `
  *,
  service:services(*),
  customer:profiles!bookings_customer_id_fkey(*),
  provider:profiles!bookings_provider_id_fkey(*),
  review:reviews(*)
`;

function normalizeBooking(row: Record<string, unknown>): BookingWithRelations {
  const rawReview = row.review as Review | Review[] | null;
  return {
    ...(row as unknown as Booking),
    service: (row.service as Service | null) ?? null,
    customer: (row.customer as Profile | null) ?? null,
    provider: (row.provider as Profile | null) ?? null,
    review: Array.isArray(rawReview) ? (rawReview[0] ?? null) : rawReview,
  };
}

export async function fetchServices(): Promise<Service[]> {
  if (!isSupabaseConfigured) return SEED_SERVICES;
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return SEED_SERVICES;
  return data as Service[];
}

export async function fetchServiceBySlug(slug: string): Promise<Service | null> {
  if (!isSupabaseConfigured) {
    return SEED_SERVICES.find((service) => service.slug === slug) ?? null;
  }
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return SEED_SERVICES.find((s) => s.slug === slug) ?? null;
  return (data as Service | null) ?? null;
}

export async function fetchCustomerBookings(
  customerId: string,
): Promise<BookingWithRelations[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("customer_id", customerId)
    .order("scheduled_at", { ascending: false });
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map(normalizeBooking);
}

export async function fetchProviderJobs(
  providerId: string,
): Promise<BookingWithRelations[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("provider_id", providerId)
    .order("scheduled_at", { ascending: false });
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map(normalizeBooking);
}

export async function fetchOpenJobs(providerId: string): Promise<OpenJob[]> {
  const { data: provider } = await supabase
    .from("provider_profiles")
    .select("is_available")
    .eq("id", providerId)
    .maybeSingle();
  if (!provider || provider.is_available === false) return [];

  const { data: links } = await supabase
    .from("provider_services")
    .select("service_id")
    .eq("provider_id", providerId);
  const serviceIds = (links ?? []).map((row) => row.service_id as string);
  if (serviceIds.length === 0) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, customer_id, service_id, status, scheduled_at, price, payment_status, created_at, service:services(*)",
    )
    .is("provider_id", null)
    .eq("status", "pending")
    .in("service_id", serviceIds)
    .order("scheduled_at", { ascending: true });
  if (error || !data) return [];
  return data as unknown as OpenJob[];
}

export async function fetchBookingById(
  id: string,
): Promise<BookingWithRelations | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return normalizeBooking(data as Record<string, unknown>);
}

export async function fetchMessages(bookingId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as Message[];
}

export async function fetchProviderProfile(
  id: string,
): Promise<ProviderProfile | null> {
  const { data, error } = await supabase
    .from("provider_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return (data as ProviderProfile | null) ?? null;
}

export async function fetchProviderServiceIds(
  providerId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("provider_services")
    .select("service_id")
    .eq("provider_id", providerId);
  if (error || !data) return [];
  return data.map((row) => row.service_id as string);
}

export async function fetchAllServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data) return SEED_SERVICES;
  return data as Service[];
}

export async function fetchAllProviders(): Promise<ProviderWithProfile[]> {
  const { data, error } = await supabase
    .from("provider_profiles")
    .select("*, profile:profiles!provider_profiles_id_fkey(*)")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as unknown as ProviderWithProfile[];
}

export async function fetchRecentBookings(
  limit = 20,
): Promise<BookingWithRelations[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map(normalizeBooking);
}

export async function createBooking(input: {
  customerId: string;
  serviceId: string;
  scheduledAt: string;
  address: string;
  notes: string;
  price: number;
}): Promise<{ id?: string; error?: string }> {
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: input.customerId,
      service_id: input.serviceId,
      scheduled_at: input.scheduledAt,
      address: input.address,
      notes: input.notes || null,
      price: input.price,
      status: "pending",
      payment_status: "unpaid",
      payment_method: "promptpay",
    })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "สร้างการจองไม่สำเร็จ" };
  return { id: data.id as string };
}

export async function acceptBooking(
  bookingId: string,
  providerId: string,
): Promise<{ error?: string }> {
  const { data: provider } = await supabase
    .from("provider_profiles")
    .select("is_available")
    .eq("id", providerId)
    .maybeSingle();
  if (!provider || provider.is_available === false) {
    return { error: "คุณปิดรับงานอยู่ กรุณาเปิดรับงานก่อน" };
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, provider_id, status, service_id")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking || booking.provider_id || booking.status !== "pending") {
    return { error: "งานนี้ถูกรับไปแล้วหรือไม่พร้อมให้รับ" };
  }

  const { data: link } = await supabase
    .from("provider_services")
    .select("service_id")
    .eq("provider_id", providerId)
    .eq("service_id", booking.service_id)
    .maybeSingle();
  if (!link) return { error: "บริการนี้ไม่อยู่ในความเชี่ยวชาญของคุณ" };

  const { error } = await supabase
    .from("bookings")
    .update({ provider_id: providerId, status: "accepted" })
    .eq("id", bookingId)
    .is("provider_id", null);
  if (error) return { error: error.message };
  return {};
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);
  if (error) return { error: error.message };
  return {};
}

export async function confirmPayment(
  bookingId: string,
  customerId: string,
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("bookings")
    .update({ payment_status: "paid" })
    .eq("id", bookingId)
    .eq("customer_id", customerId);
  if (error) return { error: error.message };
  return {};
}

export async function sendMessage(
  bookingId: string,
  senderId: string,
  body: string,
): Promise<{ error?: string }> {
  const trimmed = body.trim();
  if (!trimmed) return { error: "กรุณาพิมพ์ข้อความ" };
  const { error } = await supabase.from("messages").insert({
    booking_id: bookingId,
    sender_id: senderId,
    body: trimmed.slice(0, 2000),
  });
  if (error) return { error: error.message };
  return {};
}

export async function submitReview(input: {
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment: string;
}): Promise<{ error?: string }> {
  if (input.rating < 1 || input.rating > 5) {
    return { error: "กรุณาให้คะแนน 1-5 ดาว" };
  }
  const { error } = await supabase.from("reviews").insert({
    booking_id: input.bookingId,
    customer_id: input.customerId,
    provider_id: input.providerId,
    rating: input.rating,
    comment: input.comment.trim() || null,
  });
  if (error) {
    if (error.code === "23505") return { error: "คุณรีวิวงานนี้ไปแล้ว" };
    return { error: error.message };
  }
  return {};
}

export async function updateProfile(
  userId: string,
  fullName: string,
  phone: string,
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName.trim(), phone: phone.trim() || null })
    .eq("id", userId);
  if (error) return { error: error.message };
  return {};
}

export async function saveProviderProfile(input: {
  id: string;
  bio: string;
  serviceArea: string;
  yearsExperience: number;
  isAvailable: boolean;
  serviceIds: string[];
}): Promise<{ error?: string }> {
  const { error } = await supabase.from("provider_profiles").upsert(
    {
      id: input.id,
      bio: input.bio.trim() || null,
      service_area: input.serviceArea.trim() || null,
      years_experience: input.yearsExperience,
      is_available: input.isAvailable,
    },
    { onConflict: "id" },
  );
  if (error) return { error: error.message };

  const { error: deleteError } = await supabase
    .from("provider_services")
    .delete()
    .eq("provider_id", input.id);
  if (deleteError) return { error: deleteError.message };

  if (input.serviceIds.length > 0) {
    const { error: insertError } = await supabase
      .from("provider_services")
      .insert(
        input.serviceIds.map((serviceId) => ({
          provider_id: input.id,
          service_id: serviceId,
        })),
      );
    if (insertError) return { error: insertError.message };
  }
  return {};
}

export async function setProviderVerified(
  providerId: string,
  isVerified: boolean,
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("provider_profiles")
    .update({ is_verified: isVerified })
    .eq("id", providerId);
  if (error) return { error: error.message };
  return {};
}

export async function setServiceActive(
  serviceId: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("services")
    .update({ is_active: isActive })
    .eq("id", serviceId);
  if (error) return { error: error.message };
  return {};
}
