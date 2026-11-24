-- เปิด realtime สำหรับสถานะอ่านแล้ว (read receipt)
-- รันใน Supabase SQL Editor ของโปรเจกต์ oaowgicupetabfdxburr

do $$
begin
  alter publication supabase_realtime add table public.booking_reads;
exception
  when duplicate_object then null;
end;
$$;

select tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
order by tablename;
