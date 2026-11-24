import { isValidCoordinate, locationExpiresAt } from "./location";
import { isSupabaseConfigured, supabase } from "./supabase";
import { SEED_SERVICES } from "./seed-services";
import type {
  Booking,
  BookingRead,
  BookingStatus,
  BookingWithRelations,
  Message,
  MessageType,
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

export function normalizeMessage(row: Record<string, unknown>): Message {
  return {
    ...(row as unknown as Message),
    message_type: (row.message_type as MessageType) ?? "text",
    body: typeof row.body === "string" ? row.body : "",
    latitude: (row.latitude as number | null) ?? null,
    longitude: (row.longitude as number | null) ?? null,
    location_label: (row.location_label as string | null) ?? null,
    image_path: (row.image_path as string | null) ?? null,
    expires_at: (row.expires_at as string | null) ?? null,
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
  return (data as Record<string, unknown>[])
    .map(normalizeMessage)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
        a.id.localeCompare(b.id),
    );
}

export async function fetchBookingReads(
  bookingId: string,
): Promise<BookingRead[]> {
  const { data, error } = await supabase
    .from("booking_reads")
    .select("*")
    .eq("booking_id", bookingId);
  return error || !data ? [] : (data as BookingRead[]);
}

export async function fetchUnreadCounts(
  bookingIds: string[],
  userId: string,
): Promise<Record<string, number>> {
  if (bookingIds.length === 0) return {};

  const [messagesResult, readsResult] = await Promise.all([
    supabase
      .from("messages")
      .select("booking_id, sender_id, created_at")
      .in("booking_id", bookingIds),
    supabase
      .from("booking_reads")
      .select("booking_id, last_read_at")
      .eq("user_id", userId)
      .in("booking_id", bookingIds),
  ]);

  const reads = new Map(
    (readsResult.data ?? []).map((row) => [
      row.booking_id as string,
      new Date(row.last_read_at as string).getTime(),
    ]),
  );
  const counts: Record<string, number> = {};
  for (const row of messagesResult.data ?? []) {
    const bookingId = row.booking_id as string;
    if (row.sender_id === userId) continue;
    const sentAt = new Date(row.created_at as string).getTime();
    if (sentAt > (reads.get(bookingId) ?? 0)) {
      counts[bookingId] = (counts[bookingId] ?? 0) + 1;
    }
  }
  return counts;
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
  latitude?: number | null;
  longitude?: number | null;
  locationLabel?: string | null;
}): Promise<{ id?: string; error?: string }> {
  const latitude = input.latitude ?? null;
  const longitude = input.longitude ?? null;
  if ((latitude === null) !== (longitude === null)) {
    return { error: "พิกัดจุดนัดหมายไม่ครบถ้วน" };
  }
  if (latitude !== null && !isValidCoordinate(latitude, longitude)) {
    return { error: "พิกัดจุดนัดหมายไม่ถูกต้อง" };
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: input.customerId,
      service_id: input.serviceId,
      scheduled_at: input.scheduledAt,
      address: input.address,
      notes: input.notes || null,
      latitude,
      longitude,
      location_label: latitude !== null ? input.locationLabel ?? null : null,
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

export interface ChatMessageInput {
  bookingId: string;
  senderId: string;
  body?: string;
  type?: MessageType;
  latitude?: number | null;
  longitude?: number | null;
  imagePath?: string | null;
}

export async function sendMessage(
  input: ChatMessageInput,
): Promise<{ error?: string }> {
  const bookingId = String(input.bookingId ?? "");
  if (!bookingId) return { error: "ไม่พบรายการจอง" };

  const type = input.type ?? "text";
  const body = String(input.body ?? "").trim().slice(0, 2000);
  if (type === "text" && !body) return { error: "กรุณาพิมพ์ข้อความ" };

  let latitude: number | null = null;
  let longitude: number | null = null;
  let expiresAt: string | null = null;
  let imagePath: string | null = null;

  if (type === "location") {
    latitude = input.latitude ?? null;
    longitude = input.longitude ?? null;
    if (!isValidCoordinate(latitude, longitude)) {
      return { error: "พิกัดไม่ถูกต้อง" };
    }
    expiresAt = locationExpiresAt();
  }

  if (type === "image") {
    imagePath = input.imagePath ?? null;
    if (
      !imagePath ||
      !imagePath.startsWith(`${bookingId}/${input.senderId}/`) ||
      imagePath.includes("..")
    ) {
      return { error: "ไฟล์รูปภาพไม่ถูกต้อง" };
    }
  }

  const { error } = await supabase.from("messages").insert({
    booking_id: bookingId,
    sender_id: input.senderId,
    body,
    message_type: type,
    latitude,
    longitude,
    location_label: type === "location" ? body || null : null,
    image_path: imagePath,
    expires_at: expiresAt,
  });
  if (error) return { error: error.message };
  return {};
}

export async function markChatRead(
  bookingId: string,
  userId: string,
): Promise<{ error?: string }> {
  const { error } = await supabase.from("booking_reads").upsert(
    {
      booking_id: bookingId,
      user_id: userId,
      last_read_at: new Date().toISOString(),
    },
    { onConflict: "booking_id,user_id" },
  );
  return error ? { error: error.message } : {};
}

const CHAT_IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadChatImage(input: {
  bookingId: string;
  userId: string;
  uri: string;
  mimeType: string;
}): Promise<{ path?: string; error?: string }> {
  const extension = CHAT_IMAGE_EXTENSIONS[input.mimeType];
  if (!extension) return { error: "รองรับเฉพาะรูปภาพ JPG, PNG และ WEBP" };

  const blob = await fetch(input.uri).then((response) => response.blob());
  if (blob.size > 5 * 1024 * 1024) {
    return { error: "ขนาดรูปต้องไม่เกิน 5 MB" };
  }

  const path = `${input.bookingId}/${input.userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("chat-images")
    .upload(path, blob, { contentType: input.mimeType, upsert: false });
  if (error) return { error: error.message };
  return { path };
}

export async function fetchChatImageUrl(
  path: string,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("chat-images")
    .createSignedUrl(path, 60 * 60);
  return error ? null : (data?.signedUrl ?? null);
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
