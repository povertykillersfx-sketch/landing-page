-- PKFX lead funnel tables. Run this once in the Supabase SQL editor
-- (Dashboard → SQL → New query). The app uses the anon key with RLS:
-- visitors can insert new leads only; they cannot read or update rows.

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

create table if not exists public.admin_emails (
  email text primary key
);

insert into public.admin_emails (email)
values ('admin@povertykillersfx.com')
on conflict (email) do nothing;

alter table public.leads enable row level security;
alter table public.analytics_events enable row level security;
alter table public.rate_limits enable row level security;
alter table public.admin_emails enable row level security;

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

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_emails
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.mark_lead_call_booked(p_id uuid)
returns public.leads
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.leads%rowtype;
begin
  select * into rec from public.leads where id = p_id;
  if not found then
    return null;
  end if;
  if rec.status in ('new', 'contacted') then
    rec.status := 'call_booked';
    rec.status_rank := 2;
  end if;
  if rec.call_booked_at is null then
    rec.call_booked_at := timezone('utc', now());
  end if;
  rec.updated_at := timezone('utc', now());
  update public.leads
  set status = rec.status,
      status_rank = rec.status_rank,
      call_booked_at = rec.call_booked_at,
      updated_at = rec.updated_at
  where id = p_id;
  return rec;
end;
$$;

create or replace function public.mark_lead_call_booked_by_email(p_email text)
returns public.leads
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.leads%rowtype;
begin
  select * into rec
  from public.leads
  where email = lower(trim(p_email))
  order by created_at desc
  limit 1;
  if not found then
    return null;
  end if;
  return public.mark_lead_call_booked(rec.id);
end;
$$;

drop policy if exists anon_insert_leads on public.leads;
create policy anon_insert_leads on public.leads
  for insert to anon
  with check (
    status = 'new'
    and status_rank = 0
    and notes = ''
    and call_booked_at is null
  );

drop policy if exists admin_select_leads on public.leads;
create policy admin_select_leads on public.leads
  for select to authenticated
  using (public.is_admin());

drop policy if exists admin_update_leads on public.leads;
create policy admin_update_leads on public.leads
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists anon_insert_analytics on public.analytics_events;
create policy anon_insert_analytics on public.analytics_events
  for insert to anon
  with check (true);

revoke all on public.leads from anon, authenticated, public;
revoke all on public.analytics_events from anon, authenticated, public;
revoke all on public.rate_limits from anon, authenticated, public;
revoke all on public.admin_emails from anon, authenticated, public;
revoke all on function public.consume_rate_limit(text, integer, bigint) from anon, authenticated, public;
revoke all on function public.mark_lead_call_booked(uuid) from anon, authenticated, public;
revoke all on function public.mark_lead_call_booked_by_email(text) from anon, authenticated, public;
revoke all on function public.is_admin() from anon, authenticated, public;

grant insert on public.leads to anon;
grant select, update on public.leads to authenticated;
grant insert on public.analytics_events to anon;
grant execute on function public.consume_rate_limit(text, integer, bigint) to anon, authenticated;
grant execute on function public.mark_lead_call_booked(uuid) to anon, authenticated;
grant execute on function public.mark_lead_call_booked_by_email(text) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;
