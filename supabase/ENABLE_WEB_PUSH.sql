-- Web Push subscriptions for FastHelp
-- Run this in Supabase SQL Editor after schema.sql.

create table if not exists public.push_subscriptions (
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

-- Users may save/remove only their own subscriptions.
drop policy if exists "users manage own push subscriptions" on public.push_subscriptions;
create policy "users manage own push subscriptions" on public.push_subscriptions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- A booking participant may read the other participant's subscription
-- so a server action can deliver "new message" / "status changed" pushes.
drop policy if exists "booking participants read push subscriptions" on public.push_subscriptions;
create policy "booking participants read push subscriptions" on public.push_subscriptions
  for select to authenticated
  using (public.shares_booking_with(user_id));

grant select, insert, update, delete on public.push_subscriptions to authenticated;
