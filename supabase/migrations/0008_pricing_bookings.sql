-- Kifaru Car Hire — optional vehicle details, pricing, and calendar bookings.
-- Run after 0001-0007.

-- ─────────────────────────────────────────────────────────────────────────
-- Every vehicle detail is now optional, both when staff add a vehicle and
-- when a car owner applies. Text columns keep their not-null '' defaults;
-- the numeric ones become nullable so "not provided" isn't stored as 0.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.vehicles
  alter column name set default '',
  alter column make set default '',
  alter column year drop not null,
  alter column seats drop not null;

alter table public.vehicle_applications
  alter column name set default '',
  alter column make set default '',
  alter column year drop not null,
  alter column seats drop not null,
  alter column fuel_type set default '',
  alter column luggage_capacity set default '';

-- ─────────────────────────────────────────────────────────────────────────
-- Pricing: an amount plus what it's charged per. 'custom' uses
-- price_custom_label for the unit (e.g. "per week", "per weekend") —
-- shown on its own when no amount is set (e.g. "Price on request").
-- ─────────────────────────────────────────────────────────────────────────
alter table public.vehicles
  add column if not exists price numeric(12, 2) check (price is null or price >= 0),
  add column if not exists price_unit text check (price_unit in ('day', 'month', 'custom')),
  add column if not exists price_custom_label text;

-- ─────────────────────────────────────────────────────────────────────────
-- bookings: date-range requests from the calendar on /fleet/<id>. Anyone
-- can submit a pending request (public form, like enquiries); only staff
-- can read/manage them. Confirmed bookings block those dates on the
-- public calendar.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text,
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  estimated_total numeric(12, 2),
  notes text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

create policy "Anyone can submit a booking request"
  on public.bookings for insert
  to anon, authenticated
  with check (status = 'pending');

create policy "Authenticated staff can manage bookings"
  on public.bookings for all
  to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid()));

create index if not exists bookings_vehicle_id_idx on public.bookings (vehicle_id);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);

-- ─────────────────────────────────────────────────────────────────────────
-- get_vehicle_unavailable_ranges: the date ranges the public calendar
-- greys out for one vehicle — confirmed bookings plus active leases that
-- haven't ended. security definer because anon has no read access to
-- bookings/leases; returns dates only, never who booked.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.get_vehicle_unavailable_ranges(p_vehicle_id uuid)
returns table (start_date date, end_date date)
language sql
security definer
set search_path = ''
stable
as $$
  select b.start_date, b.end_date
  from public.bookings b
  where b.vehicle_id = p_vehicle_id
    and b.status = 'confirmed'
    and b.end_date >= current_date
  union all
  select l.start_date, l.end_date
  from public.leases l
  where l.vehicle_id = p_vehicle_id
    and l.status = 'active'
    and l.end_date >= current_date
  order by 1;
$$;

revoke all on function public.get_vehicle_unavailable_ranges(uuid) from public;
grant execute on function public.get_vehicle_unavailable_ranges(uuid) to anon, authenticated;
