-- เปิด Realtime สำหรับแชท (ข้อความ + สถานะอ่านแล้ว)
-- รันใน Supabase SQL Editor ของโปรเจกต์ oaowgicupetabfdxburr
-- รันซ้ำได้ปลอดภัย (idempotent)

do $$
declare
  t text;
begin
  foreach t in array array['public.messages', 'public.booking_reads']
  loop
    begin
      execute format('alter publication supabase_realtime add table %s', t);
      raise notice 'added % to publication supabase_realtime', t;
    exception
      when duplicate_object then
        raise notice 'already in publication supabase_realtime: %', t;
    end;
  end loop;
end;
$$;

-- UPDATE/DELETE บนตารางที่มี RLS ต้องใช้ OLD row เพื่อเช็ค select policy
alter table public.messages replica identity full;
alter table public.booking_reads replica identity full;

-- ผลลัพธ์ที่ควรเห็น: messages, booking_reads
select tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
order by tablename;

-- ผลลัพธ์ที่ควรเห็น: f (full) ทั้งสองตาราง
select relname, relreplident
from pg_class
where relname in ('messages', 'booking_reads')
order by relname;
