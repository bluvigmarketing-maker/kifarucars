-- Kifaru Car Hire — email (SMTP) settings managed from /kifaruadmin/settings
-- instead of Vercel environment variables. Shared with Kifaru Liquor (same
-- Supabase project), so one form configures email for both sites.
-- Run after 0015. Safe to re-run.

create table if not exists public.email_settings (
  -- Single-row table: the only allowed id is true.
  id boolean primary key default true check (id),
  smtp_host text not null default '',
  smtp_port integer not null default 465 check (smtp_port between 1 and 65535),
  smtp_user text not null default '',
  -- AES-256-GCM, encrypted by the app (src/lib/email/settings.ts). Never
  -- sent to the browser.
  smtp_pass_encrypted text,
  email_from text not null default '',
  -- Car hire: staff inbox copied on every booking/lease invoice.
  staff_copy_email text not null default '',
  -- Kifaru Liquor: where new paid shop orders are sent.
  liquor_orders_email text not null default 'admin@kifaru.ke',
  updated_at timestamptz not null default now(),
  updated_by text
);

-- RLS on with NO policies: only the service role (server code) can read or
-- write it. The admin page goes through a server action that checks the
-- signed-in user is staff first.
alter table public.email_settings enable row level security;

notify pgrst, 'reload schema';
