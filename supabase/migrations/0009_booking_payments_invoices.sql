-- Kifaru Car Hire — pay-at-booking via M-Pesa, emailed PDF invoices,
-- engine capacity, and corporate-leasing quote requests. Run after 0001-0008.

-- ─────────────────────────────────────────────────────────────────────────
-- Engine capacity (e.g. "2,800cc") replaces luggage capacity on the public
-- listing. luggage_capacity is kept so existing data isn't lost.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.vehicles
  add column if not exists engine_capacity text not null default '';

alter table public.vehicle_applications
  add column if not exists engine_capacity text not null default '';

-- ─────────────────────────────────────────────────────────────────────────
-- enquiries.service: which form an enquiry came from. 'corporate_leasing'
-- is the quote form on /corporate-leasing; null is the general contact form.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.enquiries
  add column if not exists service text,
  add column if not exists company text;

-- ─────────────────────────────────────────────────────────────────────────
-- bookings: the price breakdown the customer was charged. Bookings of
-- 5+ days get KES 1,000 off (see quoteBooking in src/lib/vehicle-display.ts).
-- estimated_total (0008) is the amount due after the discount.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.bookings
  add column if not exists subtotal numeric(12, 2),
  add column if not exists discount numeric(12, 2) not null default 0;

-- ─────────────────────────────────────────────────────────────────────────
-- payments: now either against a lease (client portal) or a booking (the
-- calendar on /fleet/<id>) — exactly one of the two. invoice_sent_at is
-- claimed with a conditional update before the PDF invoice is emailed, so
-- the callback and the status-poll fallback never both send one.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.payments
  alter column lease_id drop not null,
  add column if not exists booking_id uuid references public.bookings (id) on delete cascade,
  add column if not exists invoice_sent_at timestamptz;

alter table public.payments
  drop constraint if exists payments_lease_or_booking;
alter table public.payments
  add constraint payments_lease_or_booking check (num_nonnulls(lease_id, booking_id) = 1);

create index if not exists payments_booking_id_idx on public.payments (booking_id);
