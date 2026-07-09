create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  event_name text not null,
  screen_name text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  device text,
  app_version text,
  created_at timestamptz not null default now()
);

create index if not exists events_created_at_idx
  on public.events (created_at desc);

create index if not exists events_event_name_idx
  on public.events (event_name);

create index if not exists events_user_id_idx
  on public.events (user_id);

alter table public.events enable row level security;

drop policy if exists "Allow public read events" on public.events;
create policy "Allow public read events"
on public.events
for select
to anon
using (true);

drop policy if exists "Allow public insert android events" on public.events;
create policy "Allow public insert android events"
on public.events
for insert
to anon
with check (
  user_id is not null
  and event_name is not null
  and coalesce(device, 'android') = 'android'
);
