-- Kifaru Car Hire — OPTIONAL: add the vehicles from the rate card
-- ("Kifaru_Car_Hire Rates.pdf") with their daily rates and photos.
-- Run after 0011. Safe to re-run: a vehicle is skipped if one with the same
-- make + name already exists, so check /kifaruadmin/fleet afterwards for
-- older Prado rows that describe the same cars and delete or merge them.
--
-- Only what the rate card states is filled in (rate, fuel where listed);
-- add seats, year, engine etc. from the admin dashboard.
--
-- Photos are served from the site itself (public/vehicles/*.jpg); staff can
-- replace them with uploads from the admin dashboard at any time.

insert into public.vehicles
  (make, name, fuel_type, transmission, price, price_unit, image_url, category_id, sort_order, is_available)
select
  v.make, v.name, v.fuel_type, 'Automatic', v.price, 'day', v.image_url,
  (select id from public.vehicle_categories c where c.name = v.category),
  v.sort_order, true
from (
  values
    ('Lexus',  'LX 570',                '',       22500, '/vehicles/lexus-lx-570.jpg',            'Luxury SUV',         1),
    ('Toyota', 'Prado VXL (Diesel)',    'Diesel', 15000, '/vehicles/toyota-prado-vxl-diesel.jpg', 'Land Cruiser Prado', 2),
    ('Toyota', 'Prado VXL (Petrol)',    'Petrol', 14000, '/vehicles/toyota-prado-vxl-petrol.jpg', 'Land Cruiser Prado', 3),
    ('Toyota', 'Land Cruiser Prado TX', '',       13000, '/vehicles/toyota-prado-tx.jpg',         'Land Cruiser Prado', 4),
    ('Toyota', 'Fortuner',              '',       13000, '/vehicles/toyota-fortuner.jpg',         'Mid-Size SUV',       5),
    ('Mazda',  'CX-5',                  '',        8500, '/vehicles/mazda-cx-5.jpg',              'Crossover',          6)
) as v (make, name, fuel_type, price, image_url, category, sort_order)
where not exists (
  select 1 from public.vehicles existing
  where existing.make = v.make and existing.name = v.name
);
