-- ===========================================================================
-- FastHelp — แก้แชทช้า / ส่งภาพไม่ขึ้น / สถานะอ่านแล้วไม่อัปเดต
-- วิธี: เปิด Supabase Dashboard → SQL Editor → New query → วางทั้งไฟล์นี้ → Run
-- ===========================================================================

-- 1) ภาพในแชท: ให้ participant ทุกคนใน booking อ่านภาพได้ (ไม่จำกัดเจ้าของ path)
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
  return v_booking is not null and public.is_booking_participant(v_booking);
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

-- 2) read receipt: ให้ UPDATE ส่ง realtime event ได้ (RLS ต้องใช้ OLD row)
alter table public.booking_reads replica identity full;
alter table public.messages replica identity full;

-- ===========================================================================
-- ทดสอบหลังรัน (ควรได้ true / f):
-- select public.is_chat_image_booking_allowed(
--   '3d129fe2-ca28-4d33-ba3e-89e8aebd8bd3/92865e7b-e280-4cfd-bc65-4ec11bb77b69/test.png'
-- );
-- select relname, relreplident from pg_class
-- where relname in ('messages','booking_reads');
-- ===========================================================================
