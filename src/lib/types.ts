export type Role = "customer" | "provider" | "admin";

export type BookingStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "refunded";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: Role;
  avatar_url: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  base_price: number;
  unit: string;
  duration_minutes: number;
  is_active: boolean;
  sort_order: number;
}

export interface ProviderProfile {
  id: string;
  bio: string | null;
  service_area: string | null;
  years_experience: number;
  is_verified: boolean;
  is_available: boolean;
  rating_avg: number;
  rating_count: number;
}

export interface Booking {
  id: string;
  customer_id: string;
  provider_id: string | null;
  service_id: string;
  status: BookingStatus;
  scheduled_at: string;
  address: string;
  notes: string | null;
  price: number;
  payment_status: PaymentStatus;
  payment_method: string;
  latitude: number | null;
  longitude: number | null;
  location_label: string | null;
  created_at: string;
  updated_at: string;
}

export type MessageType = "text" | "location" | "image";

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  body: string;
  message_type: MessageType;
  latitude: number | null;
  longitude: number | null;
  location_label: string | null;
  image_path: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface BookingRead {
  booking_id: string;
  user_id: string;
  last_read_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export type BookingWithRelations = Booking & {
  service: Service | null;
  customer: Profile | null;
  provider: Profile | null;
  review: Review | null;
};

// งานที่ยังไม่มีช่างรับ: ไม่ส่งที่อยู่/รายละเอียดให้ช่างเห็นจนกว่าจะรับงาน
export type OpenJob = {
  id: string;
  customer_id: string;
  service_id: string;
  status: BookingStatus;
  scheduled_at: string;
  price: number;
  payment_status: PaymentStatus;
  created_at: string;
  service: Service | null;
};

export type ProviderWithProfile = ProviderProfile & {
  profile: Profile | null;
};

export interface AuthContext {
  user: { id: string; email?: string };
  profile: Profile | null;
}
