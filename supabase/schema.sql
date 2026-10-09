-- PKFX lead funnel tables. Run this once in the Supabase SQL editor
-- (Dashboard → SQL → New query). The Next.js app uses the service role
-- key on the server, so these tables stay closed to the public.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  whatsapp text not null default '',
  country text not null,
  trading_experience text not null,
  previously_purchased boolean not null default false,
  previous_products jsonb not null default '[]'::jsonb,
  deposit_range text not null,
  deposit_rank integer not null default 0,
  status text not null default 'new',
  status_rank integer not null default 0,
  notes text not null default '',
  call_booked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_email on public.leads (email);
create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_leads_status on public.leads (status);
create index if not exists idx_leads_country on public.leads (country);
create index if not exists idx_leads_status_rank on public.leads (status_rank, created_at desc);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  path text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_created_at on public.analytics_events (created_at desc);
create index if not exists idx_analytics_event_name on public.analytics_events (event_name);

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null,
  window_start bigint not null
);

alter table public.leads enable row level security;
alter table public.analytics_events enable row level security;
alter table public.rate_limits enable row level security;

create or replace function public.consume_rate_limit(p_key text, p_limit integer, p_window_ms bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.rate_limits%rowtype;
  now_ms bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
begin
  if p_key is null or length(p_key) = 0 or p_limit < 1 or p_window_ms < 1 then
    return false;
  end if;

  select * into rec from public.rate_limits where key = p_key for update;
  if not found or now_ms - rec.window_start >= p_window_ms then
    insert into public.rate_limits (key, count, window_start)
    values (p_key, 1, now_ms)
    on conflict (key) do update set count = 1, window_start = excluded.window_start;
    return true;
  end if;

  if rec.count >= p_limit then
    return false;
  end if;

  update public.rate_limits set count = count + 1 where key = p_key;
  return true;
end;
$$;

revoke all on public.leads from anon, authenticated;
revoke all on public.analytics_events from anon, authenticated;
revoke all on public.rate_limits from anon, authenticated;
revoke all on function public.consume_rate_limit(text, integer, bigint) from anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, bigint) to service_role;
