-- Kifaru Car Hire — vehicle media gallery, hover video/sound, per-vehicle
-- reviews (Milestone 9/10). Run after 0001-0004.

-- ─────────────────────────────────────────────────────────────────────────
-- vehicles: gallery photos beyond the existing cover `image_url`, an
-- optional hover-autoplay video, and an optional custom hover sound.
-- `gallery_urls` is capped at 9 in the app layer so cover + gallery = 10
-- images total, matching the "up to 10 images" requirement.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.vehicles
  add column if not exists gallery_urls text[] not null default '{}',
  add column if not exists video_url text,
  add column if not exists hover_sound_url text;

-- ─────────────────────────────────────────────────────────────────────────
-- reviews: optionally tie a review to the specific vehicle it's about, so
-- a vehicle's detail page can show reviews from former users of that car.
-- Nullable — general reviews (not about one specific vehicle) still work.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.reviews
  add column if not exists vehicle_id uuid references public.vehicles (id) on delete set null;

create index if not exists reviews_vehicle_id_idx on public.reviews (vehicle_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Storage: public buckets for vehicle media, admin-write / public-read.
-- Split by type so each gets its own size limit (images small, video up to
-- 50MB). Bucket-level size/mime limits are a first line of defense — video
-- duration (60s max) can't be enforced by Storage config and is validated
-- client-side before upload (see src/lib/supabase/storage.ts); there is no
-- media-processing backend here to re-check duration server-side.
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('vehicle-images', 'vehicle-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('vehicle-videos', 'vehicle-videos', true, 52428800, array['video/mp4', 'video/webm']),
  ('vehicle-audio', 'vehicle-audio', true, 5242880, array['audio/mpeg', 'audio/wav', 'audio/ogg'])
on conflict (id) do nothing;

create policy "Anyone can view vehicle media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('vehicle-images', 'vehicle-videos', 'vehicle-audio'));

create policy "Authenticated staff can manage vehicle media"
  on storage.objects for all
  to authenticated
  using (
    bucket_id in ('vehicle-images', 'vehicle-videos', 'vehicle-audio')
    and exists (select 1 from public.profiles where profiles.id = auth.uid())
  )
  with check (
    bucket_id in ('vehicle-images', 'vehicle-videos', 'vehicle-audio')
    and exists (select 1 from public.profiles where profiles.id = auth.uid())
  );
