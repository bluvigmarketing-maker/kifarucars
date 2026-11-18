-- Kifaru Car Hire — vehicle categories, managed from /kifaruadmin/categories.
-- Run after 0001-0010.
--
-- The fleet is no longer Prado-only (see the rate card: Lexus LX 570, Prados,
-- Fortuner, Mazda CX-5), so vehicles can be grouped into categories again.
-- Unlike the fixed CHECK list dropped in 0003, categories are now rows staff
-- can add, rename, reorder and delete. Deleting a category leaves its
-- vehicles uncategorised rather than deleting them.

create table if not exists public.vehicle_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) > 0),
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.vehicle_categories enable row level security;

create policy "Vehicle categories are publicly readable"
  on public.vehicle_categories for select
  to anon, authenticated
  using (true);

create policy "Authenticated staff can manage vehicle categories"
  on public.vehicle_categories for all
  to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid()));

create index if not exists vehicle_categories_sort_order_idx on public.vehicle_categories (sort_order);

alter table public.vehicles
  add column if not exists category_id uuid references public.vehicle_categories (id) on delete set null;

create index if not exists vehicles_category_id_idx on public.vehicles (category_id);

-- Starter categories matching the rate card. Edit or remove them from the
-- admin dashboard; re-running this file won't duplicate them.
insert into public.vehicle_categories (name, description, sort_order)
values
  ('Luxury SUV', 'Top-of-the-range comfort for VIP and executive travel.', 1),
  ('Land Cruiser Prado', 'Our signature Prado fleet — rugged, comfortable, built for Kenyan roads.', 2),
  ('Mid-Size SUV', 'Capable seven-seaters for families and upcountry trips.', 3),
  ('Crossover', 'Economical, easy-to-drive SUVs for town and highway.', 4)
on conflict (name) do nothing;
