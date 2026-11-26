-- ปิดช่องโหว่: ช่างกดยืนยันตัวตนตัวเองผ่าน REST ได้
-- วิธีรัน: SQL Editor -> Ctrl+A -> Run
-- หลังรัน ให้ provider.demo@example.com พยายาม PATCH is_verified=true ต้องถูกปฏิเสธ

create or replace function public.guard_provider_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- อนุญาตเฉพาะ admin (ผ่าน JWT) หรือบริบทไม่มี user (SQL Editor / service_role)
  if new.is_verified is distinct from old.is_verified
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'ไม่มีสิทธิ์ยืนยันตัวตนช่าง';
  end if;
  return new;
end $$;

drop trigger if exists provider_profiles_guard_verification on public.provider_profiles;
create trigger provider_profiles_guard_verification
  before update on public.provider_profiles
  for each row execute function public.guard_provider_verification();

-- ทดสอบ: ควรขึ้น error ว่า "ไม่มีสิทธิ์ยืนยันตัวตนช่าง"
-- update public.provider_profiles set is_verified = true where id = '...';
