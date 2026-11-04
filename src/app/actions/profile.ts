"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface ProfileFormState {
  error?: string;
  message?: string;
}

export async function updateProviderProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  if (!isSupabaseConfigured()) {
    return { error: "ยังไม่ได้ตั้งค่า Supabase" };
  }

  const auth = await getAuthContext();
  if (!auth || auth.profile?.role !== "provider") {
    return { error: "เฉพาะผู้ให้บริการเท่านั้น" };
  }

  const bio = String(formData.get("bio") ?? "").trim();
  const serviceArea = String(formData.get("service_area") ?? "").trim();
  const years = Number(formData.get("years_experience") ?? 0);
  const isAvailable = formData.get("is_available") === "on";
  const serviceIds = formData
    .getAll("service_ids")
    .map((value) => String(value))
    .filter(Boolean);

  const supabase = await createClient();

  const { error: profileError } = await supabase
    .from("provider_profiles")
    .upsert({
      id: auth.user.id,
      bio: bio || null,
      service_area: serviceArea || null,
      years_experience: Number.isFinite(years) ? Math.max(0, years) : 0,
      is_available: isAvailable,
    });

  if (profileError) return { error: profileError.message };

  const { error: deleteError } = await supabase
    .from("provider_services")
    .delete()
    .eq("provider_id", auth.user.id);

  if (deleteError) return { error: deleteError.message };

  if (serviceIds.length > 0) {
    const { error: insertError } = await supabase
      .from("provider_services")
      .insert(
        serviceIds.map((serviceId) => ({
          provider_id: auth.user.id,
          service_id: serviceId,
        })),
      );
    if (insertError) return { error: insertError.message };
  }

  revalidatePath("/provider/profile");
  revalidatePath("/provider");
  return { message: "บันทึกโปรไฟล์เรียบร้อยแล้ว" };
}

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  if (!isSupabaseConfigured()) {
    return { error: "ยังไม่ได้ตั้งค่า Supabase" };
  }

  const auth = await getAuthContext();
  if (!auth) return { error: "กรุณาเข้าสู่ระบบ" };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!fullName) return { error: "กรุณากรอกชื่อ" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null })
    .eq("id", auth.user.id);

  if (error) return { error: error.message };

  revalidatePath("/account");
  return { message: "บันทึกข้อมูลเรียบร้อยแล้ว" };
}
