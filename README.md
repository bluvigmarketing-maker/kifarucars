# Kifaru Car Hire

Corporate & expat car hire website. Next.js 16 (App Router) + Tailwind CSS v4
on the frontend, Supabase for auth/data, deployed on Vercel.

See [MILESTONES.md](./MILESTONES.md) for build progress and what's left.

## Stack notes

- **Next.js 16** — `middleware.ts` is now `proxy.ts` (see `src/proxy.ts`); this
  project keeps Cache Components (PPR) **off** for a simpler, predictable
  data-fetching model.
- **Fleet, enquiries and reviews are Supabase-backed.** Until Supabase is
  configured (see below), the public site falls back to clearly-labeled
  placeholder content in `src/lib/placeholder-data.ts` — the site always runs
  and is demoable, and the enquiry form will say it isn't connected yet.
- **Admin dashboard** lives at `/kifaruadmin`, gated by Supabase Auth.

## 1. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without Supabase configured, the homepage shows
placeholder fleet/review content and `/kifaruadmin` redirects to a login page
that can't yet authenticate anyone.

## 2. Connect Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env.local` and fill in **Project Settings → API**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```
3. Run the SQL files in `supabase/migrations/` **in order** (`0001`, `0002`,
   `0003`, `0004`, `0005`, ...) via the Supabase SQL editor (or `supabase db push`
   if you're using the CLI). `0001_init.sql` creates `vehicles`, `enquiries`,
   `reviews`, and `profiles` with row-level security; `0004_vehicle_applications.sql`
   adds car-owner leasing applications, extended vehicle fields, and the
   private `logbooks` Storage bucket; `0005_vehicle_media.sql` adds the vehicle
   photo gallery, hover video/sound fields, per-vehicle reviews, and the public
   `vehicle-images` / `vehicle-videos` / `vehicle-audio` Storage buckets.
4. `0002_seed_optional.sql` is optional — it seeds a handful of starter
   vehicles and reviews.
5. Restart `npm run dev` so the new env vars are picked up.

## 3. Create your first admin user

The `profiles` table is what actually grants `/kifaruadmin` access — a
Supabase Auth account alone isn't enough (see `src/lib/admin/dal.ts`).

1. In the Supabase dashboard, go to **Authentication → Users → Add user**
   and create a user with an email/password.
2. Copy that user's UUID, then run in the SQL editor:
   ```sql
   insert into public.profiles (id, email, full_name, role)
   values ('<paste-user-uuid>', '<their-email>', '<their-name>', 'admin');
   ```
3. Sign in at `/kifaruadmin/login`.

## 4. Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket and import it in Vercel.
2. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables in the Vercel
   project settings (Production + Preview).
3. Deploy. No other configuration is required — `proxy.ts` and Server Actions
   run natively on Vercel.

## Replacing placeholder content

Search `src/lib/placeholder-data.ts` — it has every placeholder value
(phone, WhatsApp number, email, stats, sample vehicles/reviews) called out
with `// PLACEHOLDER` comments. Real fleet vehicles and reviews should be
added through `/kifaruadmin` once Supabase is connected, rather than edited
in this file.

## Project structure

```
src/
  app/
    (site)/            # public homepage (Header/Footer layout)
    kifaruadmin/        # admin dashboard
      login/            # public login page
      (protected)/       # auth-gated dashboard pages
  components/
    site/               # homepage sections
    admin/              # dashboard UI
    ui/                 # shared primitives (Button, Container, ...)
  lib/
    actions/            # Server Actions (mutations)
    admin/              # admin-only data access + auth DAL
    supabase/           # Supabase client helpers
  hooks/
    useEngineSound.ts   # Web Audio API "engine rev" hover sound
supabase/
  migrations/           # SQL schema + optional seed data
```
