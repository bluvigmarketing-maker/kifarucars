-- Kifaru Car Hire — initial schema
-- Run via `supabase db push` or paste into the Supabase SQL editor.

-- ─────────────────────────────────────────────────────────────────────────
-- profiles: one row per admin/staff user, linked to auth.users.
-- A user only gets dashboard access once a matching row exists here.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are readable by authenticated staff"
  on public.profiles for select
  to authenticated
  using (true);

-- ─────────────────────────────────────────────────────────────────────────
-- vehicles: the public fleet listing, managed from /kifaruadmin.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  make text not null,
  year integer not null,
  category text not null check (
    category in ('Saloon', 'Crossover', 'Mid-Size SUV', 'Mini Van', 'Large Size SUV')
  ),
  transmission text not null default 'Automatic' check (transmission in ('Automatic', 'Manual')),
  seats integer not null default 5,
  fuel_type text not null default 'Petrol',
  luggage_capacity text not null default '',
  image_url text not null default '',
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.vehicles enable row level security;

create policy "Vehicles are publicly readable"
  on public.vehicles for select
  to anon, authenticated
  using (true);

create policy "Authenticated staff can manage vehicles"
  on public.vehicles for all
  to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────
-- enquiries: submissions from the public "Make an Enquiry" form.
-- Anyone can insert (it's a public form); only staff can read/manage.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  hear_about_us text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.enquiries enable row level security;

create policy "Anyone can submit an enquiry"
  on public.enquiries for insert
  to anon, authenticated
  with check (true);

create policy "Authenticated staff can manage enquiries"
  on public.enquiries for all
  to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────
-- reviews: curated Google Reviews shown in the homepage reviews section.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  body text not null,
  days_ago_label text not null default '',
  is_featured boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "Featured reviews are publicly readable"
  on public.reviews for select
  to anon, authenticated
  using (true);

create policy "Authenticated staff can manage reviews"
  on public.reviews for all
  to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────
-- Helpful indexes
-- ─────────────────────────────────────────────────────────────────────────
create index if not exists vehicles_category_idx on public.vehicles (category);
create index if not exists vehicles_sort_order_idx on public.vehicles (sort_order);
create index if not exists enquiries_status_idx on public.enquiries (status);
create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists reviews_sort_order_idx on public.reviews (sort_order);
