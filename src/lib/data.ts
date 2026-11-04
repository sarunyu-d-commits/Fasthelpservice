import { createClient, isSupabaseConfigured } from "./supabase/server";
import { SEED_SERVICES } from "./seed-services";
import type {
  AuthContext,
  Booking,
  BookingWithRelations,
  Message,
  Profile,
  ProviderProfile,
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
  if (!isSupabaseConfigured()) return SEED_SERVICES;

  try {
    const supabase = await createClient();
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

export async function getOpenBookings(): Promise<BookingWithRelations[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(BOOKING_SELECT)
      .is("provider_id", null)
      .eq("status", "pending")
      .order("scheduled_at", { ascending: true });

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
    return data as Message[];
  } catch {
    return [];
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
