# Kifaru Car Hire — Build Milestones

Tracks progress on the site build. Stack: Next.js 16 (App Router) + Tailwind CSS v4 + Supabase + Vercel.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done

## Milestone 1 — Foundation
- [x] Scaffold Next.js app (TypeScript, Tailwind v4, App Router, `src/` dir)
- [x] Brand theme: burgundy / gray / white palette, Jost + Fraunces fonts
- [x] Core dependencies: Supabase, zod, lucide-react, framer-motion
- [ ] Supabase client libs (browser + server) and shared TypeScript types
- [ ] Supabase schema: `vehicles`, `enquiries`, `reviews`, `profiles` (admin roles) + RLS policies

## Milestone 2 — Public Homepage
- [ ] Shared UI primitives (Button, Container, SectionHeading)
- [ ] Header/nav + footer + floating WhatsApp button
- [ ] Hero (stats, CTAs)
- [ ] Fleet slider — category filters, vehicle cards, **hover-to-hear engine sound**
- [ ] Services / About / Why Choose Us / CTA banner sections
- [ ] Google Reviews section
- [ ] FAQ accordion
- [ ] Enquiry form → Supabase (server action)

## Milestone 3 — Admin Dashboard (`/kifaruadmin`)
- [ ] Auth gating via `proxy.ts` (Next 16's renamed middleware) + Supabase Auth
- [ ] Login page
- [ ] Dashboard shell (sidebar/topbar) + overview
- [ ] Fleet management (create/edit/delete vehicles, availability toggle)
- [ ] Enquiries inbox (view, update status, delete)
- [ ] Reviews management (add/edit/delete, feature on homepage)

## Milestone 4 — Content & Data
- [ ] Replace placeholder business info (locations, phone/WhatsApp, email, stats) with real details
- [ ] Seed initial fleet vehicles and reviews via admin dashboard or seed SQL
- [ ] Real logo / brand assets (currently text wordmark)

## Milestone 5 — Launch readiness
- [ ] Responsive QA (mobile/tablet/desktop) across all sections
- [ ] Lighthouse/perf pass, image optimization
- [ ] Supabase RLS review (no admin data exposed to anon)
- [ ] Connect Vercel project + Supabase env vars, deploy preview
- [ ] Production domain + go-live

---
### Notes / decisions log
- Rebranding as **Kifaru Car Hire** (burgundy/gray/white), not a literal clone of the reference screenshot (which was "Avenue Car Hire").
- Fleet, enquiries, and reviews are Supabase-backed; homepage falls back to placeholder content if Supabase isn't configured yet, so the site is always demoable.
- Next.js 16 renamed `middleware.ts` → `proxy.ts`; Cache Components (PPR) left **off** for this build to keep the data-fetching model simple and predictable.
- Engine sound on fleet-card hover is synthesized in-browser via the Web Audio API (no external audio asset/licensing needed) with a mute toggle for accessibility.
