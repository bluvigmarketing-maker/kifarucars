# Kifaru Car Hire — Build Milestones

Tracks progress on the site build. Stack: Next.js 16 (App Router) + Tailwind CSS v4 + Supabase + Vercel.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done

## Milestone 1 — Foundation
- [x] Scaffold Next.js app (TypeScript, Tailwind v4, App Router, `src/` dir)
- [x] Brand theme: burgundy / gray / white palette, Jost + Fraunces fonts
- [x] Core dependencies: Supabase, zod, lucide-react, framer-motion
- [x] Supabase client libs (browser + server) and shared TypeScript types
- [x] Supabase schema: `vehicles`, `enquiries`, `reviews`, `profiles` (admin roles) + RLS policies

## Milestone 2 — Public Homepage
- [x] Shared UI primitives (Button, Container, SectionHeading)
- [x] Header/nav + footer + floating WhatsApp button
- [x] Hero (stats, CTAs)
- [x] Fleet slider — category filters, vehicle cards, **hover-to-hear engine sound**
- [x] Services / About / Why Choose Us / CTA banner sections
- [x] Google Reviews section
- [x] FAQ accordion
- [x] Enquiry form → Supabase (server action)
- [x] Verified: builds clean (`npm run build`), homepage + login page load with zero console errors

## Milestone 3 — Admin Dashboard (`/kifaruadmin`)
- [x] Auth gating via `proxy.ts` (Next 16's renamed middleware) + Supabase Auth
- [x] Login page
- [x] Dashboard shell (sidebar/topbar) + overview
- [x] Fleet management (create/edit/delete vehicles, availability toggle)
- [x] Enquiries inbox (view, update status, delete)
- [x] Reviews management (add/edit/delete, feature on homepage)

## Milestone 4 — Content & Data
- [ ] Connect a real Supabase project (see README §2) — currently unconfigured, so the site runs on placeholder content
- [ ] Create the first real admin user (README §3)
- [ ] Replace placeholder business info (locations, phone/WhatsApp, email, stats) with real details in `src/lib/placeholder-data.ts`
- [ ] Add real fleet vehicles and reviews via `/kifaruadmin` (or edit `supabase/migrations/0002_seed_optional.sql`)
- [ ] Real logo / brand assets (currently a text wordmark + generated vehicle/rhino SVG placeholders)

## Milestone 5 — Launch readiness
- [ ] Responsive QA (mobile/tablet/desktop) across all sections — desktop viewport checked only so far
- [ ] Lighthouse/perf pass, image optimization
- [ ] Supabase RLS review once a real project is connected (policies are written in the migration but untested against a live project)
- [ ] Connect Vercel project + Supabase env vars, deploy preview
- [ ] Production domain + go-live

## Milestone 6 — Beyond the homepage (future, per "homepage first, iterate after")
- [ ] Dedicated Corporate Car Hire / Corporate Leasing / Expat Car Hire pages (nav currently anchors to homepage sections)
- [x] Dedicated vehicle detail pages — see Milestone 9 (currently "View Details" anchors to the enquiry form)
- [ ] About Us / Contact Us as standalone pages if needed beyond the homepage sections

## Milestone 7 — Legal & site copy
- [x] Terms of Service page (`/terms`) — covers fleet-partner applications, client portal/lease extensions, reviews
- [x] Privacy Policy page (`/privacy`) — covers logbook docs, vehicle media, portal access links
- [x] Footer: link both pages, credit "Website by Kifaru Websites"
- [x] Hero stats updated to 15 drivers / 20+ cars
- [ ] Legal review of Terms/Privacy by qualified counsel (both pages are flagged as templates, not legal advice)

## Milestone 8 — Car-owner leasing platform: extended vehicle data + application intake ✅
Goal: the site becomes a portal where **car owners apply to have their vehicle leased**, not just a fleet showcase.
- [x] Extended `vehicles` schema (`supabase/migrations/0004_vehicle_applications.sql`) + `Vehicle` type (`src/lib/types.ts`) with: `chassis_number`, `registration_number`, `mileage`, `owner_name`, `owner_phone`, `owner_email`, `logbook_path`, `additional_features` (`text[]`)
- [x] Private Supabase Storage bucket `logbooks` (photo or PDF, 10MB cap) — anon can insert-only (submit), staff can read/manage via RLS
- [x] Public route `/list-your-car` — car-owner application form (`VehicleApplicationForm.tsx`): vehicle details + owner details + logbook upload → writes to `vehicle_applications` (status: `pending`/`approved`/`rejected`), not directly into `vehicles`
- [x] Admin review screen (`/kifaruadmin/applications`, `ApplicationsTable.tsx`): view submitted details, open the logbook via a staff-only signed-URL route handler, approve (inserts into `vehicles` as hidden/`is_available=false` pending real photos) or reject
- [x] `VehicleForm.tsx` / `VehicleSchema` extended with the same staff-only fields so admins can edit them directly on any fleet vehicle
- [x] Chassis/registration number and owner contact info are staff-only — never selected on the public homepage query, only visible in `/kifaruadmin`
- [ ] Connect the real Supabase project + run `0004_vehicle_applications.sql` and `0005_vehicle_media.sql` before this is live (see Milestone 4)
- [x] Decided (Milestone 10): chassis/registration number and owner contact stay staff-only on the public vehicle detail page; mileage is shown publicly

## Milestone 9 — Vehicle media: multi-image gallery, video, per-car hover sound ✅
- [x] Three public Supabase Storage buckets (`supabase/migrations/0005_vehicle_media.sql`): `vehicle-images` (8MB), `vehicle-videos` (50MB, mp4/webm), `vehicle-audio` (5MB) — public read, staff-only write via RLS
- [x] Schema: `vehicles.gallery_urls` (`text[]`, capped at 9 in the app layer so cover + gallery = 10 images total), `vehicles.video_url`, `vehicles.hover_sound_url`
- [x] Admin upload UI (`VehicleMediaFields.tsx`, wired into `VehicleForm.tsx`): cover image upload-or-paste, gallery multi-upload (9 max), video upload with **client-side validation** (≤60s via a temporary `<video>` element, ≤50MB), and a per-vehicle hover-sound upload
- [x] `useEngineSound.ts` now plays the admin-uploaded audio file per vehicle when `hover_sound_url` is set, falling back to the original synthesized rev sound otherwise
- [x] `VehicleCard.tsx` autoplays the vehicle's video (muted, looped) on hover instead of the static image, pauses+resets on hover-end, and skips autoplay under `prefers-reduced-motion`
- [x] `next.config.ts` allows `next/image` to load Supabase Storage's public URLs (`**.supabase.co`)
- [ ] Video duration (60s) is **not** re-verified server-side — no media-processing backend exists to check it; only size/mime type are enforced by the bucket config. A malicious/non-browser upload could bypass the duration check.

## Milestone 10 — Vehicle detail page + reviews ✅
- [x] New route `/fleet/[id]`: full vehicle details (specs, features, gallery + video via `VehicleGallery.tsx`), reachable by clicking any fleet card
- [x] `reviews.vehicle_id` (nullable FK) added so a review can be tied to the specific car a former user leased; `ReviewForm.tsx` gained a vehicle picker
- [x] Vehicle detail page renders reviews for that vehicle (reviewer name + rating + body) via `getReviewsForVehicle`
- [x] `VehicleCard.tsx` "View Details" links to the new detail page
- [x] Public data access (`getVehicles`, `getVehicleForDetail` in `src/lib/data.ts`) explicitly selects a public-safe column list and maps placeholder data through `toPublicVehicle` — chassis/registration number, owner contact, and logbook path are never sent to the browser; **mileage is shown publicly** on the detail page (a deliberate call — common on real vehicle listings, unlike the other owner/document fields)
- [ ] Verified with the dev server + curl against all 4 placeholder vehicles and an unknown id (404 as expected) — no live-browser console check was done (no browser automation tool available in this environment)

## Milestone 11 — Client portal (registered lessees)
- [ ] `clients` + `leases` tables: client contact info, linked vehicle, lease start/end date, cost, status (`active`/`ended`)
- [ ] "Register as active client" flow, triggered by admin once a lease is confirmed — generates a unique, unguessable portal link/token (e.g. Supabase magic-link auth or a signed token URL) and (decide channel) emails/WhatsApps it to the client
- [ ] Client portal route (e.g. `/portal/[token]` or authenticated `/portal`): shows lease cost, start/end date, remaining time
- [ ] "Request extension" action on the portal → writes an `extension_requests` row; admin sees pending requests in `/kifaruadmin` and approves/declines (updates the lease end date on approval)
- [ ] Decide auth model up front (see Notes below) before building — this is the highest-risk item to get wrong

## Milestone 12 — QA & launch of the above
- [ ] Responsive + dark-mode QA on all new pages/flows
- [ ] RLS review for every new table (applications, media, clients, leases, extension requests) — these hold more sensitive data (logbooks, owner contact, lease cost) than anything shipped so far
- [ ] Storage bucket size/type limits verified against Supabase plan (video storage costs more than the placeholder SVGs currently in `public/vehicles/`)
- [ ] End-to-end pass: owner applies → admin approves → vehicle live with gallery/video/sound → client leases → client registered → client requests extension → admin approves

---
### Notes / decisions needed before Milestones 8–11
- **Client portal auth**: simplest to build is a long random token in the URL (`/portal/<token>`), no login required — lowest friction for clients but the link *is* the credential (must be transmitted and stored carefully, per the Privacy Policy §5 language already added). Alternative is real Supabase-Auth accounts per client (more secure, more setup/friction). Pick one before starting Milestone 11.
- **Video limits**: 50MB/60s should be checked both client-side (fast feedback, skip the upload) and server-side/in a Storage policy or edge function (can't trust the client alone).
- **Chassis/registration number**: recommend staff-only visibility by default; confirm with the business whether these should ever be public on a vehicle detail page.

### Notes / decisions log
- Rebranding as **Kifaru Car Hire** (burgundy/gray/white), not a literal clone of the reference screenshot (which was "Avenue Car Hire").
- Fleet, enquiries, and reviews are Supabase-backed; homepage falls back to placeholder content if Supabase isn't configured yet, so the site is always demoable.
- Next.js 16 renamed `middleware.ts` → `proxy.ts`; Cache Components (PPR) left **off** for this build to keep the data-fetching model simple and predictable.
- Engine sound on fleet-card hover is synthesized in-browser via the Web Audio API (no external audio asset/licensing needed) with a mute toggle for accessibility.
- `/kifaruadmin` access requires both a Supabase Auth account **and** a matching row in `profiles` — an auth account alone isn't enough. All `/kifaruadmin/**` routes are forced dynamic (never statically prerendered) since they depend on session + live data.
- lucide-react (installed version) ships no brand icons (Facebook/Instagram/LinkedIn/X) — footer social icons are hand-drawn inline SVGs in `src/components/site/SocialIcons.tsx`.
