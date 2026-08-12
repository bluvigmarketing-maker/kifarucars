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
- [ ] Dedicated vehicle detail pages (currently "View Details" anchors to the enquiry form)
- [ ] About Us / Contact Us as standalone pages if needed beyond the homepage sections

---
### Notes / decisions log
- Rebranding as **Kifaru Car Hire** (burgundy/gray/white), not a literal clone of the reference screenshot (which was "Avenue Car Hire").
- Fleet, enquiries, and reviews are Supabase-backed; homepage falls back to placeholder content if Supabase isn't configured yet, so the site is always demoable.
- Next.js 16 renamed `middleware.ts` → `proxy.ts`; Cache Components (PPR) left **off** for this build to keep the data-fetching model simple and predictable.
- Engine sound on fleet-card hover is synthesized in-browser via the Web Audio API (no external audio asset/licensing needed) with a mute toggle for accessibility.
- `/kifaruadmin` access requires both a Supabase Auth account **and** a matching row in `profiles` — an auth account alone isn't enough. All `/kifaruadmin/**` routes are forced dynamic (never statically prerendered) since they depend on session + live data.
- lucide-react (installed version) ships no brand icons (Facebook/Instagram/LinkedIn/X) — footer social icons are hand-drawn inline SVGs in `src/components/site/SocialIcons.tsx`.
