-- แก้ปัญหา: สถานะ "อ่านแล้ว" ในแชทไม่อัปเดตแบบ realtime
-- สาเหตุ: ตาราง booking_reads เปิด RLS แต่ replica identity เป็น default
--   → Supabase Realtime ใช้ OLD row ตรวจ select policy ไม่ได้ → UPDATE event ถูกทิ้ง
-- รันใน Supabase SQL Editor ของโปรเจกต์ oaowgicupetabfdxburr แล้วกด Run

alter table public.booking_reads replica identity full;
alter table public.messages replica identity full;

-- ตรวจสอบ (ควรได้ 'f' = FULL):
-- select relname, relreplident from pg_class
-- where relname in ('messages', 'booking_reads');
