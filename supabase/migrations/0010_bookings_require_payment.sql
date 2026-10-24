-- Kifaru Car Hire — to book, the customer has to pay. Run after 0001-0009.
--
-- Bookings are now created only server-side (service role) together with
-- their M-Pesa payment, in src/lib/actions/bookings.ts. The public insert
-- policy from 0008 would let anyone add an unpaid booking straight through
-- the API, so it's removed.
drop policy if exists "Anyone can submit a booking request" on public.bookings;
