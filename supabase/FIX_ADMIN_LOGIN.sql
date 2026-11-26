-- แก้บัญชี admin ที่ login แล้วขึ้น "Database error querying schema"
-- สาเหตุ: แถว auth.identities ขาด provider_id (NOT NULL) จึงไม่ถูกสร้าง
-- วิธีรัน: เปิดไฟล์นี้ใน Supabase SQL Editor -> Ctrl+A -> Run
-- ผลลัพธ์ที่ถูกต้อง: แถวสุดท้ายต้องขึ้น role = admin (1 แถว)

do $$
declare
  v_admin_id uuid;
  v_email text := 'admin.demo@example.com';
begin
  select id into v_admin_id from auth.users where email = v_email limit 1;

  -- ถ้ายังไม่มี user ให้สร้างแบบครบทุกคอลัมน์ที่ GoTrue ต้องการ
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
      crypt('FastHelp@1234', gen_salt('bf')),
      now(), '', '', '', '',
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('full_name', 'FastHelp Admin'),
      now(), now()
    )
    returning id into v_admin_id;
  else
    -- เผื่อรหัสผ่านเพี้ยนจากรอบก่อน ให้ตั้งใหม่ให้ตรงกับที่แจ้งไว้
    update auth.users
    set encrypted_password = crypt('FastHelp@1234', gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        confirmation_token = '',
        email_change = '',
        email_change_token_new = '',
        recovery_token = ''
    where id = v_admin_id;
  end if;

  -- ลบ identity ที่เสีย (ถ้ามี) แล้วสร้างใหม่ให้ถูกต้อง
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

-- ต้องขึ้น 1 แถว role = admin
select p.id, u.email, p.role
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'admin.demo@example.com';
