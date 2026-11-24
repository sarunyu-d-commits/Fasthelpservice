-- FastHelp database schema
-- Run this in Supabase SQL Editor (or `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,
  role text not null default 'customer' check (role in ('customer', 'provider', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  category text not null,
  icon text,
  base_price integer not null check (base_price >= 0),
  unit text not null default 'ครั้ง',
  duration_minutes integer not null default 60,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.provider_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  bio text,
  service_area text,
  years_experience integer not null default 0,
  is_verified boolean not null default false,
  is_available boolean not null default true,
  rating_avg numeric(3, 2) not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.provider_services (
  provider_id uuid not null references public.profiles (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  primary key (provider_id, service_id)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  provider_id uuid references public.profiles (id) on delete set null,
  service_id uuid not null references public.services (id),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  scheduled_at timestamptz not null,
  address text not null,
  notes text,
  price integer not null check (price >= 0),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'pending', 'paid', 'refunded')),
  payment_method text not null default 'promptpay',
  latitude double precision,
  longitude double precision,
  location_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_latitude_check check (latitude between -90 and 90),
  constraint bookings_longitude_check check (longitude between -180 and 180),
  constraint bookings_coordinates_pair check ((latitude is null) = (longitude is null))
);

create index if not exists bookings_customer_idx on public.bookings (customer_id, created_at desc);
create index if not exists bookings_provider_idx on public.bookings (provider_id, created_at desc);
create index if not exists bookings_status_idx on public.bookings (status);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null default '' check (
    message_type <> 'text' or length(btrim(body)) > 0
  ),
  message_type text not null default 'text'
    check (message_type in ('text', 'location', 'image')),
  latitude double precision,
  longitude double precision,
  location_label text,
  image_path text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint messages_latitude_check check (latitude between -90 and 90),
  constraint messages_longitude_check check (longitude between -180 and 180)
);

create index if not exists messages_booking_idx on public.messages (booking_id, created_at);

create table if not exists public.booking_reads (
  booking_id uuid not null references public.bookings (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (booking_id, user_id)
);

-- Migration สำหรับฐานข้อมูลที่สร้างก่อนมีระบบตำแหน่ง/รูปภาพ/read receipt
alter table public.bookings add column if not exists latitude double precision;
alter table public.bookings add column if not exists longitude double precision;
alter table public.bookings add column if not exists location_label text;
alter table public.messages add column if not exists message_type text not null default 'text';
alter table public.messages add column if not exists latitude double precision;
alter table public.messages add column if not exists longitude double precision;
alter table public.messages add column if not exists location_label text;
alter table public.messages add column if not exists image_path text;
alter table public.messages add column if not exists expires_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.bookings'::regclass and conname = 'bookings_latitude_check'
  ) then
    alter table public.bookings add constraint bookings_latitude_check
      check (latitude between -90 and 90) not valid;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.bookings'::regclass and conname = 'bookings_longitude_check'
  ) then
    alter table public.bookings add constraint bookings_longitude_check
      check (longitude between -180 and 180) not valid;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.bookings'::regclass and conname = 'bookings_coordinates_pair'
  ) then
    alter table public.bookings add constraint bookings_coordinates_pair
      check ((latitude is null) = (longitude is null)) not valid;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.messages'::regclass and conname = 'messages_latitude_check'
  ) then
    alter table public.messages add constraint messages_latitude_check
      check (latitude between -90 and 90) not valid;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.messages'::regclass and conname = 'messages_longitude_check'
  ) then
    alter table public.messages add constraint messages_longitude_check
      check (longitude between -180 and 180) not valid;
  end if;
end;
$$;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique not null references public.bookings (id) on delete cascade,
  customer_id uuid not null references public.profiles (id) on delete cascade,
  provider_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists reviews_provider_idx on public.reviews (provider_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Helpers / triggers
-- ---------------------------------------------------------------------------

create or replace function public.is_provider()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'provider'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ช่างคนนี้เปิดรับงานและให้บริการประเภทนี้อยู่หรือไม่
create or replace function public.provider_matches_service(p_service_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.provider_profiles pp
    join public.provider_services ps on ps.provider_id = pp.id
    where pp.id = auth.uid()
      and pp.is_available = true
      and ps.service_id = p_service_id
  );
$$;

create or replace function public.is_booking_participant(p_booking_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.bookings
    where id = p_booking_id
      and (customer_id = auth.uid() or provider_id = auth.uid())
  );
$$;

create or replace function public.shares_booking_with(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.bookings b
    where (b.customer_id = auth.uid() and b.provider_id = p_profile_id)
       or (b.provider_id = auth.uid() and b.customer_id = p_profile_id)
  );
$$;

-- ป้องกันการเปลี่ยน role ของตัวเองผ่าน API โดยตรง
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- ล็อกฟิลด์สำคัญของการจองไม่ให้ถูกแก้ผ่าน API โดยตรง
create or replace function public.guard_booking_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  new.customer_id := old.customer_id;
  new.service_id := old.service_id;
  new.price := old.price;

  if auth.uid() = old.customer_id then
    new.provider_id := old.provider_id;
    if new.status is distinct from old.status then
      if new.status <> 'cancelled' then
        raise exception 'ไม่สามารถเปลี่ยนสถานะงานนี้ได้' using errcode = '42501';
      end if;
      if old.status not in ('pending', 'accepted') then
        raise exception 'ไม่สามารถยกเลิกงานที่เริ่มดำเนินการแล้ว' using errcode = '42501';
      end if;
    end if;
  elsif auth.uid() = old.provider_id then
    new.provider_id := old.provider_id;
    new.payment_status := old.payment_status;
    new.scheduled_at := old.scheduled_at;
    new.address := old.address;
    new.notes := old.notes;
    new.latitude := old.latitude;
    new.longitude := old.longitude;
    new.location_label := old.location_label;
    if new.status is distinct from old.status then
      if new.status not in ('in_progress', 'completed') then
        raise exception 'ไม่สามารถเปลี่ยนสถานะงานนี้ได้' using errcode = '42501';
      end if;
      if new.status = 'in_progress' and old.status <> 'accepted' then
        raise exception 'ต้องรับงานก่อนเริ่มให้บริการ' using errcode = '42501';
      end if;
      if new.status = 'completed' and old.status <> 'in_progress' then
        raise exception 'ต้องเริ่มให้บริการก่อนปิดงาน' using errcode = '42501';
      end if;
    end if;
  else
    new.payment_status := old.payment_status;
    new.scheduled_at := old.scheduled_at;
    new.address := old.address;
    new.notes := old.notes;
    new.latitude := old.latitude;
    new.longitude := old.longitude;
    new.location_label := old.location_label;
    if not (
      old.provider_id is null
      and old.status = 'pending'
      and new.provider_id = auth.uid()
      and new.status = 'accepted'
    ) then
      raise exception 'ไม่ได้รับอนุญาตให้แก้ไขข้อมูลการจองนี้' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_guard_update on public.bookings;
create trigger bookings_guard_update
  before update on public.bookings
  for each row execute function public.guard_booking_update();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_touch_updated_at on public.bookings;
create trigger bookings_touch_updated_at
  before update on public.bookings
  for each row execute function public.touch_updated_at();

-- สร้างโปรไฟล์อัตโนมัติเมื่อสมัครสมาชิก
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data ->> 'role', 'customer');
  if v_role not in ('customer', 'provider') then
    v_role := 'customer';
  end if;

  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone',
    v_role
  )
  on conflict (id) do nothing;

  if v_role = 'provider' then
    insert into public.provider_profiles (id)
    values (new.id)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- อัปเดตคะแนนเฉลี่ยของผู้ให้บริการเมื่อมีรีวิวใหม่
create or replace function public.refresh_provider_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.provider_profiles p
  set rating_avg = coalesce((
        select round(avg(r.rating)::numeric, 2) from public.reviews r where r.provider_id = p.id
      ), 0),
      rating_count = (
        select count(*) from public.reviews r where r.provider_id = p.id
      )
  where p.id = coalesce(new.provider_id, old.provider_id);
  return null;
end;
$$;

drop trigger if exists reviews_refresh_provider_rating on public.reviews;
create trigger reviews_refresh_provider_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_provider_rating();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.provider_services enable row level security;
alter table public.bookings enable row level security;
alter table public.messages enable row level security;
alter table public.booking_reads enable row level security;
alter table public.reviews enable row level security;

-- profiles
-- ข้อมูลส่วนตัว (รวมเบอร์โทร) เห็นได้เฉพาะเจ้าของ ผู้ที่มีการจองร่วมกัน และแอดมิน
drop policy if exists "profiles are readable" on public.profiles;
create policy "profiles are readable" on public.profiles
  for select using (
    id = auth.uid()
    or public.shares_booking_with(id)
    or public.is_admin()
  );

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile" on public.profiles
  for insert with check (id = auth.uid() and role in ('customer', 'provider'));

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- services
drop policy if exists "services are readable" on public.services;
create policy "services are readable" on public.services
  for select using (is_active or public.is_provider() or public.is_admin());

drop policy if exists "admins manage services" on public.services;
create policy "admins manage services" on public.services
  for all using (public.is_admin()) with check (public.is_admin());

-- provider_profiles
drop policy if exists "provider profiles are readable" on public.provider_profiles;
create policy "provider profiles are readable" on public.provider_profiles
  for select using (true);

drop policy if exists "providers manage own profile" on public.provider_profiles;
create policy "providers manage own profile" on public.provider_profiles
  for insert with check (id = auth.uid() and public.is_provider());

drop policy if exists "providers update own profile" on public.provider_profiles;
create policy "providers update own profile" on public.provider_profiles
  for update using (id = auth.uid() and public.is_provider())
  with check (id = auth.uid() and public.is_provider());

drop policy if exists "admins manage provider profiles" on public.provider_profiles;
create policy "admins manage provider profiles" on public.provider_profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- provider_services
drop policy if exists "provider services are readable" on public.provider_services;
create policy "provider services are readable" on public.provider_services
  for select using (true);

drop policy if exists "providers manage own services" on public.provider_services;
create policy "providers manage own services" on public.provider_services
  for all using (provider_id = auth.uid() and public.is_provider())
  with check (provider_id = auth.uid() and public.is_provider());

-- bookings
drop policy if exists "participants can read bookings" on public.bookings;
create policy "participants can read bookings" on public.bookings
  for select using (
    customer_id = auth.uid()
    or provider_id = auth.uid()
    or (provider_id is null and status = 'pending' and public.provider_matches_service(service_id))
    or public.is_admin()
  );

drop policy if exists "customers create bookings" on public.bookings;
create policy "customers create bookings" on public.bookings
  for insert with check (
    customer_id = auth.uid()
    and provider_id is null
    and status = 'pending'
    and payment_status = 'unpaid'
  );

drop policy if exists "participants update bookings" on public.bookings;
create policy "participants update bookings" on public.bookings
  for update using (
    customer_id = auth.uid()
    or provider_id = auth.uid()
    or (provider_id is null and status = 'pending' and public.provider_matches_service(service_id))
    or public.is_admin()
  ) with check (
    customer_id = auth.uid()
    or provider_id = auth.uid()
    or public.is_admin()
  );

-- messages
drop policy if exists "participants read messages" on public.messages;
create policy "participants read messages" on public.messages
  for select using (public.is_booking_participant(booking_id));

drop policy if exists "participants send messages" on public.messages;
create policy "participants send messages" on public.messages
  for insert with check (
    sender_id = auth.uid() and public.is_booking_participant(booking_id)
  );

-- booking_reads (read receipt / unread count)
drop policy if exists "participants read booking reads" on public.booking_reads;
create policy "participants read booking reads" on public.booking_reads
  for select using (public.is_booking_participant(booking_id));

drop policy if exists "participants upsert own read state" on public.booking_reads;
create policy "participants upsert own read state" on public.booking_reads
  for insert with check (
    user_id = auth.uid() and public.is_booking_participant(booking_id)
  );

drop policy if exists "participants update own read state" on public.booking_reads;
create policy "participants update own read state" on public.booking_reads
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.is_booking_participant(booking_id));

-- reviews
drop policy if exists "reviews are readable" on public.reviews;
create policy "reviews are readable" on public.reviews
  for select using (true);

drop policy if exists "customers review completed bookings" on public.reviews;
create policy "customers review completed bookings" on public.reviews
  for insert with check (
    customer_id = auth.uid()
    and exists (
      select 1 from public.bookings b
      where b.id = reviews.booking_id
        and b.customer_id = auth.uid()
        and b.status = 'completed'
        and b.provider_id = reviews.provider_id
    )
  );

-- ---------------------------------------------------------------------------
-- Privileges (RLS still restricts row access)
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
-- ไม่ grant select บน profiles ให้ anon เพื่อไม่ให้เบอร์โทรช่างรั่วไหลแบบสาธารณะ
grant select on public.services, public.provider_profiles,
  public.provider_services, public.reviews to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.provider_profiles to authenticated;
grant select, insert, delete on public.provider_services to authenticated;
grant select, insert, update on public.bookings to authenticated;
grant select, insert on public.messages to authenticated;
grant select, insert, update on public.booking_reads to authenticated;
grant insert on public.reviews to authenticated;
grant update on public.services to authenticated;

-- ---------------------------------------------------------------------------
-- Admin bootstrap
-- ---------------------------------------------------------------------------
-- สร้างแอดมินคนแรกด้วยการรันใน SQL Editor (auth.uid() เป็น null จึงไม่ติด trigger):
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'admin@example.com');

-- ---------------------------------------------------------------------------
-- Realtime (chat)
-- ---------------------------------------------------------------------------

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end;
$$;

-- read receipt ต้องเป็น realtime ด้วย เพื่อให้สถานะ "อ่านแล้ว" อัปเดตทันที
do $$
begin
  alter publication supabase_realtime add table public.booking_reads;
exception
  when duplicate_object then null;
end;
$$;

-- ---------------------------------------------------------------------------
-- Chat images (private Supabase Storage)
-- path: {booking_id}/{sender_id}/{uuid}.{ext}
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-images', 'chat-images', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.is_chat_image_path_allowed(
  p_path text,
  p_owner uuid default auth.uid()
)
returns boolean
language plpgsql
stable
security definer
set search_path = public, storage
as $$
declare
  v_booking uuid;
  v_owner uuid;
begin
  v_booking := nullif((storage.foldername(p_path))[1], '')::uuid;
  v_owner := nullif((storage.foldername(p_path))[2], '')::uuid;
  return v_booking is not null
    and v_owner is not null
    and (p_owner is null or v_owner = p_owner)
    and public.is_booking_participant(v_booking);
exception
  when others then return false;
end;
$$;

-- อ่านภาพ: participant ทุกคนใน booking อ่านได้ (ไม่จำกัดว่าต้องเป็นเจ้าของ path)
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

drop policy if exists "participants upload chat images" on storage.objects;
create policy "participants upload chat images" on storage.objects
  for insert with check (
    bucket_id = 'chat-images'
    and public.is_chat_image_path_allowed(name, auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Seed: service catalog
-- ---------------------------------------------------------------------------

insert into public.services (slug, name, description, category, icon, base_price, unit, duration_minutes, sort_order)
values
  ('aircon-cleaning', 'ล้างแอร์', 'ล้างแอร์บ้าน/คอนโด ครบทั้งคอยล์เย็น-ร้อน ตรวจน้ำยา', 'แอร์และเครื่องใช้ไฟฟ้า', '❄️', 600, 'เครื่อง', 90, 1),
  ('house-cleaning', 'ทำความสะอาดบ้าน/ห้อง', 'ทำความสะอาดทั่วไป ดูดฝุ่น ถูพื้น ห้องน้ำ', 'ทำความสะอาด', '🧹', 500, 'ครั้ง', 120, 2),
  ('car-battery', 'เปลี่ยนแบตเตอรี่รถยนต์', 'บริการเปลี่ยนแบตถึงที่ พร้อมตรวจระบบชาร์จ', 'ยานพาหนะ', '🔋', 2500, 'คัน', 45, 3),
  ('electrical-repair', 'ซ่อมไฟฟ้า', 'ซ่อมปลั๊ก ไฟส่องสว่าง เบรกเกอร์ ตรวจระบบไฟ', 'ช่างซ่อม', '💡', 450, 'จุด', 60, 4),
  ('plumbing', 'ตรวจ/ซ่อมท่อน้ำ', 'แก้ท่อตัน น้ำรั่ว ก๊อกน้ำ ประปา', 'ช่างซ่อม', '🔧', 500, 'จุด', 60, 5),
  ('gardening', 'ตัดหญ้า/จัดสวน', 'ตัดหญ้า แต่งกิ่ง เก็บกวาดสวน', 'สวนและภายนอก', '🌿', 800, 'ครั้ง', 120, 6),
  ('moving', 'ย้ายของ/ขนย้าย', 'ขนย้ายเฟอร์นิเจอร์ ของใช้ พร้อมทีมงาน', 'ขนย้าย', '📦', 1500, 'เที่ยว', 180, 7),
  ('car-wash', 'ล้างรถนอกสถานที่', 'ล้างรถยนต์นอกสถานที่ ดูดฝุ่น เคลือบสี', 'ยานพาหนะ', '🚗', 350, 'คัน', 60, 8),
  ('pet-care', 'ดูแลสัตว์เลี้ยง', 'รับฝาก/พาเดิน/ให้อาหารสัตว์เลี้ยงที่บ้าน', 'บริการอื่นๆ', '🐾', 300, 'ครั้ง', 60, 9),
  ('it-support', 'ช่างคอม/ไอที', 'ติดตั้ง/ซ่อมคอม ตั้งค่าเน็ตเวิร์ก อัปเกรดเครื่อง', 'ช่างซ่อม', '💻', 600, 'ครั้ง', 90, 10)
on conflict (slug) do nothing;
