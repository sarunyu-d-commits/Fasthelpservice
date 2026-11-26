-- FastHelp: Web Push + first admin
-- Run ONCE in Supabase SQL Editor of project: oaowgicupetabfdxburr
-- ตรวจว่าขึ้น "Success" สีเขียว และไม่มี error สีแดงก่อนปิดหน้า

-- ---------------------------------------------------------------------------
-- 1) Web Push subscriptions
-- ---------------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "users manage own push subscriptions" on public.push_subscriptions;
create policy "users manage own push subscriptions" on public.push_subscriptions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "booking participants read push subscriptions" on public.push_subscriptions;
create policy "booking participants read push subscriptions" on public.push_subscriptions
  for select to authenticated
  using (public.shares_booking_with(user_id));

grant select, insert, update, delete on public.push_subscriptions to authenticated;

-- ---------------------------------------------------------------------------
-- 2) Admin account
-- ---------------------------------------------------------------------------
do $$
declare
  v_admin_id uuid;
  v_email text := 'admin.demo@example.com';
  v_password text := 'FastHelp@1234';
begin
  select id into v_admin_id from auth.users where email = v_email limit 1;

  if v_admin_id is null then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, confirmation_token, email_change,
      email_change_token_new, recovery_token,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    values (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
      'authenticated', 'authenticated', v_email,
      crypt(v_password, gen_salt('bf')),
      now(), '', '', '', '',
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('full_name', 'FastHelp Admin'),
      now(), now()
    )
    returning id into v_admin_id;
  else
    update auth.users
    set encrypted_password = crypt(v_password, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        confirmation_token = '',
        email_change = '',
        email_change_token_new = '',
        recovery_token = ''
    where id = v_admin_id;
  end if;

  -- provider_id is NOT NULL on auth.identities (required for email login).
  delete from auth.identities
  where user_id = v_admin_id and provider = 'email' and provider_id is null;

  insert into auth.identities (
    id, user_id, provider, provider_id, identity_data,
    last_sign_in_at, created_at, updated_at
  )
  select
    gen_random_uuid(), v_admin_id, 'email', v_admin_id::text,
    jsonb_build_object(
      'sub', v_admin_id::text,
      'email', v_email,
      'email_verified', true,
      'phone_verified', false
    ),
    now(), now(), now()
  where not exists (
    select 1 from auth.identities
    where user_id = v_admin_id and provider = 'email'
  );

  update public.profiles
  set role = 'admin', full_name = 'FastHelp Admin'
  where id = v_admin_id;
end $$;

select p.id, u.email, p.role
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'admin.demo@example.com';
