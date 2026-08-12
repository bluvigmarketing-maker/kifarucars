-- Optional starter content so the site has real Supabase-backed data to
-- look at immediately. Safe to skip or edit before running — none of this
-- is real business data (see src/lib/placeholder-data.ts for the labels).

insert into public.vehicles (name, make, year, category, transmission, seats, fuel_type, luggage_capacity, image_url, sort_order)
values
  ('Land Cruiser Prado', 'Toyota', 2022, 'Large Size SUV', 'Automatic', 7, 'Diesel', '3 Big, 2 Small', '/vehicles/placeholder-suv.svg', 1),
  ('RAV4', 'Toyota', 2021, 'Crossover', 'Automatic', 5, 'Petrol', '2 Big, 2 Small', '/vehicles/placeholder-crossover.svg', 2),
  ('Alphard', 'Toyota', 2020, 'Mini Van', 'Automatic', 7, 'Hybrid', '1 Big, 3 Small', '/vehicles/placeholder-van.svg', 3),
  ('Axio', 'Toyota', 2019, 'Saloon', 'Automatic', 5, 'Petrol', '1 Big, 1 Small', '/vehicles/placeholder-saloon.svg', 4)
on conflict do nothing;

insert into public.reviews (author_name, rating, body, days_ago_label, sort_order)
values
  ('Jane W.', 5, 'Excellent service and very well-maintained vehicles. The driver was professional and on time.', '2 weeks ago', 1),
  ('David K.', 5, 'Kifaru has been our go-to for corporate car hire for over a year now. Reliable every time.', '1 month ago', 2),
  ('Amina H.', 4, 'Great fleet selection and friendly staff. Booking process was smooth from start to finish.', '1 month ago', 3)
on conflict do nothing;
