-- สร้าง user ทดสอบ 2 คนโดยไม่ต้องส่งอีเมล (เลี่ยง email rate limit)
-- รันใน Supabase SQL Editor ของโปรเจกต์ oaowgicupetabfdxburr

create extension if not exists pgcrypto;

-- 1) ช่าง (provider)
do $$
declare
  v_id uuid;
  v_email text := 'provider.demo@example.com';
begin
  if not exists (select 1 from auth.users where email = v_email) then
    v_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_id,
      'authenticated',
      'authenticated',
      v_email,
      crypt('FastHelp@1234', gen_salt('bf', 10)),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'full_name', 'ช่างทดสอบ',
        'phone', '0811111111',
        'role', 'provider'
      ),
      now(),
      now()
    );

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      v_id,
      v_email,
      jsonb_build_object(
        'sub', v_id::text,
        'email', v_email,
        'email_verified', true
      ),
      'email',
      now(), now(), now()
    );
  end if;
end $$;

-- 2) ผู้ใช้บริการ (customer)
do $$
declare
  v_id uuid;
  v_email text := 'customer.demo@example.com';
begin
  if not exists (select 1 from auth.users where email = v_email) then
    v_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_id,
      'authenticated',
      'authenticated',
      v_email,
      crypt('FastHelp@1234', gen_salt('bf', 10)),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'full_name', 'ผู้ใช้ทดสอบ',
        'phone', '0822222222',
        'role', 'customer'
      ),
      now(),
      now()
    );

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      v_id,
      v_email,
      jsonb_build_object(
        'sub', v_id::text,
        'email', v_email,
        'email_verified', true
      ),
      'email',
      now(), now(), now()
    );
  end if;
end $$;

-- ตรวจผล
select
  u.email,
  u.raw_user_meta_data ->> 'role' as role,
  u.email_confirmed_at is not null as confirmed,
  p.id is not null as has_profile
from auth.users u
left join public.profiles p on p.id = u.id
where u.email in ('provider.demo@example.com', 'customer.demo@example.com');
