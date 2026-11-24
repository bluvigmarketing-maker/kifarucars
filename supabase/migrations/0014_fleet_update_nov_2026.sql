-- Kifaru Car Hire — fleet update (Nov 2026 edit list). Run after 0001-0013.
-- Safe to re-run.
--
-- 1. Lexus LX 570: fill in the specs (petrol, 2021, 8 seats, 5.7L V8).
-- 2. New vehicles, added HIDDEN (is_available = false) because their daily
--    rates and photos aren't confirmed yet. In /kifaruadmin/fleet: set the
--    rate, upload photos, then switch each one to available. Delete any
--    model that isn't actually in the fleet.
--      Crossover:     Mazda CX-8, Toyota Harrier (new model), Toyota Noah
--      Mid-Size SUV:  double cabs — Toyota Hilux, Isuzu D-Max, Nissan Navara
--                     (no Ford Ranger)

update public.vehicles
set fuel_type = 'Petrol',
    year = 2021,
    seats = 8,
    engine_capacity = '5.7L V8',
    transmission = 'Automatic',
    additional_features = array['Full-time 4WD', 'Leather seats', 'Third-row seating']
where make = 'Lexus' and name = 'LX 570';

insert into public.vehicles
  (make, name, year, seats, fuel_type, transmission, engine_capacity, image_url,
   price, price_unit, category_id, sort_order, is_available)
select
  v.make, v.name, null, v.seats, v.fuel_type, 'Automatic', '', v.image_url,
  null, null,
  (select id from public.vehicle_categories c where c.name = v.category),
  v.sort_order, false
from (
  values
    ('Mazda',  'CX-8',                   7, '',       '/vehicles/placeholder-crossover.svg', 'Crossover',    7),
    ('Toyota', 'Harrier (New Model)',    5, '',       '/vehicles/placeholder-crossover.svg', 'Crossover',    8),
    ('Toyota', 'Noah',                   8, '',       '/vehicles/placeholder-van.svg',       'Crossover',    9),
    ('Toyota', 'Hilux Double Cab',       5, 'Diesel', '/vehicles/placeholder-suv.svg',       'Mid-Size SUV', 10),
    ('Isuzu',  'D-Max Double Cab',       5, 'Diesel', '/vehicles/placeholder-suv.svg',       'Mid-Size SUV', 11),
    ('Nissan', 'Navara Double Cab',      5, 'Diesel', '/vehicles/placeholder-suv.svg',       'Mid-Size SUV', 12)
) as v (make, name, seats, fuel_type, image_url, category, sort_order)
where not exists (
  select 1 from public.vehicles existing
  where existing.make = v.make and existing.name = v.name
);
