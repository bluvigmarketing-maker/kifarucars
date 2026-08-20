-- Kifaru Car Hire — client portal for registered lessees (Milestone 11).
-- Adds: clients, leases, extension_requests, and the token-based portal
-- read/write RPCs. Run after 0001-0005.

-- ─────────────────────────────────────────────────────────────────────────
-- clients: contact info for a registered lessee. Created only as a side
-- effect of the admin "register as active client" flow (src/lib/actions/
-- leases.ts) — there is no public insert path, unlike enquiries/
-- applications, so no anon policy at all.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "Authenticated staff can manage clients"
  on public.clients for all
  to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────
-- leases: one lease of one vehicle to one client. The client's only access
-- is the token in /portal/<token> — not a Postgres role, so it can't be
-- expressed as an RLS predicate. portal_token_hash stores the sha256 (hex)
-- of that token; the raw token itself is never stored. Deliberately no
-- anon policy at all: every token-based read/write goes through the
-- security-definer functions below instead.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.leases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete restrict,
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  cost numeric(12, 2) not null check (cost >= 0),
  status text not null default 'active' check (status in ('active', 'ended')),
  portal_token_hash text not null unique,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leases enable row level security;

create policy "Authenticated staff can manage leases"
  on public.leases for all
  to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────
-- extension_requests: a client's request (submitted via the portal) to
-- push out a lease's end_date. Inserted only through
-- request_lease_extension() below — a direct anon insert policy would
-- require anon to supply a lease_id with no RLS-checkable way to verify
-- "does this caller actually hold that lease's token."
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.extension_requests (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references public.leases (id) on delete cascade,
  requested_end_date date not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  admin_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.extension_requests enable row level security;

create policy "Authenticated staff can manage extension requests"
  on public.extension_requests for all
  to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid()));

create index if not exists leases_client_id_idx on public.leases (client_id);
create index if not exists leases_vehicle_id_idx on public.leases (vehicle_id);
create index if not exists leases_status_idx on public.leases (status);
create index if not exists extension_requests_lease_id_idx on public.extension_requests (lease_id);
create index if not exists extension_requests_status_idx on public.extension_requests (status);

-- ─────────────────────────────────────────────────────────────────────────
-- get_portal_view: the ONLY read path for /portal/<token>. security
-- definer deliberately bypasses RLS — this function IS the token-auth
-- mechanism, called with the sha256 hash of the token in the URL (never
-- the raw token or table rows) from src/lib/client-portal/dal.ts. Returns
-- an explicit column allowlist: no client phone/email, no admin_notes, no
-- token hash. Also reports whether a pending extension request already
-- exists so the portal can disable duplicate submissions.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.get_portal_view(p_token_hash text)
returns table (
  lease_id uuid,
  client_first_name text,
  vehicle_name text,
  vehicle_make text,
  vehicle_year integer,
  vehicle_image_url text,
  start_date date,
  end_date date,
  cost numeric,
  status text,
  has_pending_extension_request boolean
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    l.id,
    split_part(c.full_name, ' ', 1),
    v.name,
    v.make,
    v.year,
    v.image_url,
    l.start_date,
    l.end_date,
    l.cost,
    l.status,
    exists (
      select 1 from public.extension_requests er
      where er.lease_id = l.id and er.status = 'pending'
    )
  from public.leases l
  join public.clients c on c.id = l.client_id
  join public.vehicles v on v.id = l.vehicle_id
  where l.portal_token_hash = p_token_hash;
$$;

revoke all on function public.get_portal_view(text) from public;
grant execute on function public.get_portal_view(text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- request_lease_extension: the ONLY write path available to a portal
-- visitor. Validates the token itself (never trusts a client-supplied
-- lease_id), and blocks a non-active lease, a non-forward requested date,
-- or a second pending request on the same lease.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.request_lease_extension(
  p_token_hash text,
  p_requested_end_date date,
  p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lease_id uuid;
  v_current_end_date date;
  v_status text;
  v_request_id uuid;
begin
  select l.id, l.end_date, l.status into v_lease_id, v_current_end_date, v_status
  from public.leases l
  where l.portal_token_hash = p_token_hash;

  if v_lease_id is null then
    raise exception 'Invalid token';
  end if;

  if v_status <> 'active' then
    raise exception 'Lease is not active';
  end if;

  if p_requested_end_date <= v_current_end_date then
    raise exception 'Requested date must be after the current end date';
  end if;

  if exists (
    select 1 from public.extension_requests er
    where er.lease_id = v_lease_id and er.status = 'pending'
  ) then
    raise exception 'A request is already pending';
  end if;

  insert into public.extension_requests (lease_id, requested_end_date, reason)
  values (v_lease_id, p_requested_end_date, p_reason)
  returning id into v_request_id;

  return v_request_id;
end;
$$;

revoke all on function public.request_lease_extension(text, date, text) from public;
grant execute on function public.request_lease_extension(text, date, text) to anon, authenticated;
