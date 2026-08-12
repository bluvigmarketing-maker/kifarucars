-- Kifaru Car Hire — Prado-only pivot
-- Removes the multi-body-type `category` concept now that the fleet is a
-- single model (Toyota Land Cruiser Prado, multiple units/years).
-- Safe to run once against the live project via the Supabase SQL Editor.

-- 1. Remove any non-Prado placeholder rows left over from
--    0002_seed_optional.sql. No-op if they were never inserted or already
--    removed via the admin dashboard.
delete from public.vehicles
where name in ('RAV4', 'Alphard', 'Axio');

-- 2. Drop the category column. Postgres automatically drops the column's
--    CHECK constraint and the `vehicles_category_idx` index that depend on
--    it — no separate DROP INDEX / DROP CONSTRAINT statement is needed.
alter table public.vehicles drop column if exists category;
