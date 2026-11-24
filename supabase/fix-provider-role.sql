-- แก้ role ของ provider.demo@example.com จาก customer -> provider
-- รันใน Supabase SQL Editor ของโปรเจกต์ oaowgicupetabfdxburr

update public.profiles
set role = 'provider',
    full_name = 'ช่างทดสอบ',
    phone = '0811111111'
where id = (select id from auth.users where email = 'provider.demo@example.com');

insert into public.provider_profiles (id)
select id from auth.users where email = 'provider.demo@example.com'
on conflict (id) do nothing;

update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) ||
  '{"role":"provider","full_name":"ช่างทดสอบ","phone":"0811111111"}'::jsonb
where email = 'provider.demo@example.com';

-- ตรวจผล
select
  u.email,
  p.role,
  p.full_name,
  pp.id is not null as has_provider_profile
from auth.users u
join public.profiles p on p.id = u.id
left join public.provider_profiles pp on pp.id = u.id
where u.email in ('provider.demo@example.com', 'customer.demo@example.com');
