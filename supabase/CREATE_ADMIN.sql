-- Create (or repair) the first FastHelp admin account.
-- Run in Supabase SQL Editor. auth.uid() is NULL here, so the
-- prevent_role_change trigger does not revert the role update.

do $$
declare
  v_admin_id uuid;
  v_email text := 'admin.demo@example.com';
  v_password text := 'FastHelp@1234';
begin
  select id into v_admin_id from auth.users where email = v_email limit 1;

  if v_admin_id is null then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('full_name', 'FastHelp Admin'),
      now(),
      now()
    )
    returning id into v_admin_id;

    -- Some Supabase versions require an identity row for email login.
    begin
      insert into auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      )
      values (
        gen_random_uuid(),
        v_admin_id,
        jsonb_build_object('sub', v_admin_id::text, 'email', v_email),
        'email',
        now(),
        now(),
        now()
      )
      on conflict (provider, user_id) do nothing;
    exception when others then
      null;
    end;
  end if;

  -- handle_new_user() only creates 'customer'/'provider', so set admin here.
  update public.profiles
  set role = 'admin', full_name = 'FastHelp Admin'
  where id = v_admin_id;
end $$;

-- Verify: should return exactly one row with role = admin.
select p.id, u.email, p.role
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'admin.demo@example.com';
