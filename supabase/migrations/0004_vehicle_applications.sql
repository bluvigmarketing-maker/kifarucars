-- Kifaru Car Hire — car-owner leasing applications (Milestone 8)
-- Adds: extended vehicle fields, a public application intake table, and a
-- private Storage bucket for logbook uploads. Run via `supabase db push` or
-- paste into the Supabase SQL editor, after 0001-0003.

-- ─────────────────────────────────────────────────────────────────────────
-- Extend vehicles with ownership/spec detail collected from applications.
-- These are nullable: existing rows and admin-created vehicles don't
-- require them. chassis_number/registration_number/owner_* are treated as
-- staff-only in the app layer (never selected on the public homepage query).
-- ─────────────────────────────────────────────────────────────────────────
alter table public.vehicles
  add column if not exists mileage integer,
  add column if not exists chassis_number text,
  add column if not exists registration_number text,
  add column if not exists owner_name text,
  add column if not exists owner_phone text,
  add column if not exists owner_email text,
  add column if not exists logbook_path text,
  add column if not exists additional_features text[] not null default '{}';

-- ─────────────────────────────────────────────────────────────────────────
-- vehicle_applications: submissions from car owners applying to have their
-- vehicle leased through the fleet. Anyone can submit (public form); only
-- staff can read/manage. Approving one (in the app layer) copies it into
-- `vehicles` and marks status = 'approved'.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.vehicle_applications (
  id uuid primary key default gen_random_uuid(),
  -- vehicle details
  name text not null,
  make text not null,
  year integer not null,
  transmission text not null check (transmission in ('Automatic', 'Manual')),
  seats integer not null,
  fuel_type text not null,
  luggage_capacity text not null default '',
  mileage integer,
  chassis_number text,
  registration_number text,
  additional_features text[] not null default '{}',
  logbook_path text,
  -- owner details
  owner_name text not null,
  owner_phone text not null,
  owner_email text not null,
  -- review workflow
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.vehicle_applications enable row level security;

create policy "Anyone can submit a vehicle application"
  on public.vehicle_applications for insert
  to anon, authenticated
  with check (true);

create policy "Authenticated staff can manage vehicle applications"
  on public.vehicle_applications for all
  to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid()));

create index if not exists vehicle_applications_status_idx on public.vehicle_applications (status);
create index if not exists vehicle_applications_created_at_idx on public.vehicle_applications (created_at desc);

-- ─────────────────────────────────────────────────────────────────────────
-- Storage: private bucket for logbook uploads (photo or PDF). Applicants
-- (anon) can only INSERT — not list or read back other files — so a
-- submitted logbook can't be enumerated by other visitors. Staff get full
-- access so they can review it and generate signed URLs from the admin UI.
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'logbooks',
  'logbooks',
  false,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

create policy "Anyone can upload a logbook"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'logbooks');

create policy "Authenticated staff can manage logbooks"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'logbooks'
    and exists (select 1 from public.profiles where profiles.id = auth.uid())
  )
  with check (
    bucket_id = 'logbooks'
    and exists (select 1 from public.profiles where profiles.id = auth.uid())
  );
