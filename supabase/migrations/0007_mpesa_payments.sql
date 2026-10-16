-- Kifaru Car Hire — M-Pesa STK Push payments to Buy Goods till 8999944
-- (Top Dollars Ltd). Adds: a charge amount on approved extension requests,
-- the payments table, and balance fields on get_portal_view. Run after
-- 0001-0006.

-- ─────────────────────────────────────────────────────────────────────────
-- extension_requests.amount: what the client owes for an approved
-- extension, entered by the admin at approval time. A lease's total due is
-- leases.cost + the sum of approved extension amounts.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.extension_requests
  add column if not exists amount numeric(12, 2) check (amount >= 0);

-- ─────────────────────────────────────────────────────────────────────────
-- payments: one STK Push attempt against a lease balance. Rows are written
-- only server-side with the service-role key (src/lib/supabase/admin.ts) —
-- on initiation from the portal and on Safaricom's callback — so there is
-- deliberately no anon policy. Staff read them in /kifaruadmin/payments.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references public.leases (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  phone text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  merchant_request_id text,
  checkout_request_id text unique,
  mpesa_receipt text unique,
  result_code integer,
  result_desc text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

drop policy if exists "Authenticated staff can read payments" on public.payments;
create policy "Authenticated staff can read payments"
  on public.payments for select
  to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid()));

create index if not exists payments_lease_id_idx on public.payments (lease_id);
create index if not exists payments_status_idx on public.payments (status);
create index if not exists payments_created_at_idx on public.payments (created_at desc);

-- ─────────────────────────────────────────────────────────────────────────
-- get_portal_view: same contract as 0006, plus the balance inputs the
-- portal's payment panel needs. The return type changes, so the function
-- has to be dropped rather than replaced.
-- ─────────────────────────────────────────────────────────────────────────
drop function if exists public.get_portal_view(text);

create function public.get_portal_view(p_token_hash text)
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
  has_pending_extension_request boolean,
  extension_charges numeric,
  amount_paid numeric
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
    ),
    coalesce((
      select sum(er.amount) from public.extension_requests er
      where er.lease_id = l.id and er.status = 'approved'
    ), 0),
    coalesce((
      select sum(p.amount) from public.payments p
      where p.lease_id = l.id and p.status = 'paid'
    ), 0)
  from public.leases l
  join public.clients c on c.id = l.client_id
  join public.vehicles v on v.id = l.vehicle_id
  where l.portal_token_hash = p_token_hash;
$$;

revoke all on function public.get_portal_view(text) from public;
grant execute on function public.get_portal_view(text) to anon, authenticated;
