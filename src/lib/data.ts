import { createClient, isSupabaseConfigured } from "./supabase/server";
import { createPublicClient } from "./supabase/public";
import { SEED_SERVICES } from "./seed-services";
import type {
  AuthContext,
  Booking,
  BookingRead,
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

export async function getAuthContext(): Promise<AuthContext | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return {
      user: { id: user.id, email: user.email },
      profile: (profile as Profile | null) ?? null,
    };
  } catch {
    return null;
  }
}

export async function getServices(): Promise<Service[]> {
  const supabase = createPublicClient();
  if (!supabase) return SEED_SERVICES;

  try {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) return SEED_SERVICES;
    return data as Service[];
  } catch {
    return SEED_SERVICES;
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  if (!isSupabaseConfigured()) {
    return SEED_SERVICES.find((service) => service.slug === slug) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) return SEED_SERVICES.find((s) => s.slug === slug) ?? null;
    return (data as Service | null) ?? null;
  } catch {
    return SEED_SERVICES.find((s) => s.slug === slug) ?? null;
  }
}

export async function getCustomerBookings(
  customerId: string,
): Promise<BookingWithRelations[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(BOOKING_SELECT)
      .eq("customer_id", customerId)
      .order("scheduled_at", { ascending: false });

    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map(normalizeBooking);
  } catch {
    return [];
  }
}

export async function getProviderJobs(
  providerId: string,
): Promise<BookingWithRelations[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(BOOKING_SELECT)
      .eq("provider_id", providerId)
      .order("scheduled_at", { ascending: false });

    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map(normalizeBooking);
  } catch {
    return [];
  }
}

export async function getOpenBookings(
  providerId: string,
): Promise<OpenJob[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();

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
  } catch {
    return [];
  }
}

export async function getAllServices(): Promise<Service[]> {
  if (!isSupabaseConfigured()) return SEED_SERVICES;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data) return SEED_SERVICES;
    return data as Service[];
  } catch {
    return SEED_SERVICES;
  }
}

export async function getAllProviders(): Promise<ProviderWithProfile[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("provider_profiles")
      .select("*, profile:profiles!provider_profiles_id_fkey(*)")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as unknown as ProviderWithProfile[];
  } catch {
    return [];
  }
}

export async function getRecentBookings(
  limit = 20,
): Promise<BookingWithRelations[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(BOOKING_SELECT)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map(normalizeBooking);
  } catch {
    return [];
  }
}

export async function getBookingById(
  id: string,
): Promise<BookingWithRelations | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(BOOKING_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return normalizeBooking(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

export function normalizeMessage(row: Record<string, unknown>): Message {
  return {
    ...(row as unknown as Message),
    message_type: (row.message_type as Message["message_type"]) ?? "text",
    body: typeof row.body === "string" ? row.body : "",
    latitude: (row.latitude as number | null) ?? null,
    longitude: (row.longitude as number | null) ?? null,
    location_label: (row.location_label as string | null) ?? null,
    image_path: (row.image_path as string | null) ?? null,
    expires_at: (row.expires_at as string | null) ?? null,
  };
}

export async function getMessages(bookingId: string): Promise<Message[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
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
  } catch {
    return [];
  }
}

export async function getBookingReads(
  bookingId: string,
): Promise<BookingRead[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("booking_reads")
      .select("*")
      .eq("booking_id", bookingId);
    return error || !data ? [] : (data as BookingRead[]);
  } catch {
    return [];
  }
}

export async function getUnreadCounts(
  bookingIds: string[],
  userId: string,
): Promise<Record<string, number>> {
  if (!isSupabaseConfigured() || bookingIds.length === 0) return {};

  try {
    const supabase = await createClient();
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
  } catch {
    return {};
  }
}

export async function getProviderProfile(
  id: string,
): Promise<ProviderProfile | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("provider_profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return null;
    return (data as ProviderProfile | null) ?? null;
  } catch {
    return null;
  }
}

export async function getProviderServiceIds(
  providerId: string,
): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("provider_services")
      .select("service_id")
      .eq("provider_id", providerId);

    if (error || !data) return [];
    return data.map((row) => row.service_id as string);
  } catch {
    return [];
  }
}
