"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

async function requireAdmin() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login?next=/admin");
  if (auth.profile?.role !== "admin") redirect("/account");

  const supabase = await createClient();
  return supabase;
}

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/provider");
  revalidatePath("/services");
  // หน้าแรกและหน้าบริการเป็น ISR → ต้อง invalidate ด้วยตอน admin เปลี่ยนข้อมูล
  revalidatePath("/");
}

export async function setProviderVerified(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/admin?error=supabase");

  const providerId = String(formData.get("provider_id") ?? "");
  const verified = String(formData.get("verified") ?? "") === "true";
  if (!providerId) redirect("/admin?error=invalid");

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("provider_profiles")
    .update({ is_verified: verified })
    .eq("id", providerId);

  if (error) redirect("/admin?error=update");

  revalidateAdmin();
  redirect("/admin?message=provider-updated");
}

export async function setServiceActive(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/admin?error=supabase");

  const serviceId = String(formData.get("service_id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!serviceId) redirect("/admin?error=invalid");

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("services")
    .update({ is_active: active })
    .eq("id", serviceId);

  if (error) redirect("/admin?error=update");

  revalidateAdmin();
  redirect("/admin?message=service-updated");
}
