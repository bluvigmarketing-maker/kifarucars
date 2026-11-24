-- Kifaru Car Hire — "extra options" at checkout. Run after 0014.
--
-- When a customer answers "Yes" to extras while booking, they can also order
-- from the Kifaru Liquor site (NEXT_PUBLIC_LIQUOR_SITE_URL), which is opened
-- with ?kifaru_booking=<booking id> so the drinks order can be matched to the
-- car booking. This flag tells staff to look for that order.

alter table public.bookings
  add column if not exists wants_liquor boolean not null default false;
