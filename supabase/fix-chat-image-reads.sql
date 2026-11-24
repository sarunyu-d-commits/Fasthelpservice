-- แก้ปัญหา: อีกฝ่ายในแชทเปิดภาพไม่ได้ (RLS บังคับให้ owner ของ path เป็นคนอ่านเท่านั้น)
-- รันใน Supabase SQL Editor ของโปรเจกต์ oaowgicupetabfdxburr แล้วกด Run

-- อ่านภาพ: อนุญาตให้ participant ของ booking นั้นอ่านได้ ทุกคน ไม่จำเป็นต้องเป็นเจ้าของ path
create or replace function public.is_chat_image_booking_allowed(p_path text)
returns boolean
language plpgsql
stable
security definer
set search_path = public, storage
as $$
declare
  v_booking uuid;
begin
  v_booking := nullif((storage.foldername(p_path))[1], '')::uuid;
  return v_booking is not null
    and public.is_booking_participant(v_booking);
exception
  when others then return false;
end;
$$;

drop policy if exists "participants read chat images" on storage.objects;
create policy "participants read chat images" on storage.objects
  for select using (
    bucket_id = 'chat-images'
    and public.is_chat_image_booking_allowed(name)
  );

-- ทดสอบ: ควรได้ true สำหรับทั้ง customer และ provider ของ booking เดียวกัน
-- select public.is_chat_image_booking_allowed(
--   '3d129fe2-ca28-4d33-ba3e-89e8aebd8bd3/92865e7b-e280-4cfd-bc65-4ec11bb77b69/test.png'
-- );
