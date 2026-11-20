-- Kifaru Car Hire — booking extras (drinks, snacks, accessories) the client
-- adds when booking and pays for at pickup. Run after 0001-0012.
--
-- `extras` is the menu staff manage at /kifaruadmin/extras.
-- `booking_extras` is what a client picked on a booking. Name and price are
-- copied onto the booking when it's made, so later menu edits (or deleting
-- an item) never change what an existing booking says is owed.
-- Extras are NOT part of the M-Pesa booking payment — they're collected
-- at pickup.

create table if not exists public.extras (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  description text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.extras enable row level security;

-- The booking panel reads the menu with the public (anon) key.
create policy "Active extras are publicly readable"
  on public.extras for select
  to anon, authenticated
  using (is_active or exists (select 1 from public.profiles where profiles.id = auth.uid()));

create policy "Authenticated staff can manage extras"
  on public.extras for all
  to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid()));

create index if not exists extras_sort_order_idx on public.extras (sort_order);

create table if not exists public.booking_extras (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  extra_id uuid references public.extras (id) on delete set null,
  name text not null,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 50),
  created_at timestamptz not null default now()
);

-- Written only server-side (service role) together with the booking, like
-- bookings themselves since 0010 — so no public insert policy.
alter table public.booking_extras enable row level security;

create policy "Authenticated staff can manage booking extras"
  on public.booking_extras for all
  to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid()));

create index if not exists booking_extras_booking_id_idx on public.booking_extras (booking_id);
