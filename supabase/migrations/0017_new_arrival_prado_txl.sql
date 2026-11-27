-- Kifaru Car Hire — new arrival: Toyota Land Cruiser Prado TXL (black,
-- diesel), KES 15,500 per day. Added 27 Nov 2026.
--
-- Already applied to production: the photos were uploaded to the
-- `vehicle-images` bucket and the row inserted directly. This file records
-- that change. Safe to re-run (skips if the vehicle already exists). On a
-- fresh database, upload the photos from the admin dashboard afterwards.
--
-- sort_order = -1 puts it first in the fleet. The popup advert and the
-- "New Arrival" card badge are set up in src/lib/promo.ts.

insert into public.vehicles
  (make, name, fuel_type, transmission, price, price_unit, image_url,
   category_id, sort_order, is_available)
select
  'Toyota', 'Land Cruiser Prado TXL', 'Diesel', 'Automatic', 15500, 'day',
  '/vehicles/placeholder-suv.svg',
  (select id from public.vehicle_categories c where c.name = 'Land Cruiser Prado'),
  -1, true
where not exists (
  select 1 from public.vehicles existing
  where existing.make = 'Toyota' and existing.name = 'Land Cruiser Prado TXL'
);
