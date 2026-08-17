-- Kima: sets up `events` and `tickets` tables backing the real app,
-- and widens the `users` read policy so organizer names can be shown
-- publicly (event pages, admin lists) instead of only to the user
-- themselves.
--
-- Safe to run more than once. Resets `events` and `tickets` to a clean
-- structure — fine since neither is used by the app yet. If you've
-- already added real rows to either, stop and ask before running this.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

-- ---------------------------------------------------------------------
-- users: allow anyone to read basic profile info (needed to show
-- "Hosted by <name>" on event pages). Editing your own row stays
-- locked to you.
-- ---------------------------------------------------------------------
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Anyone can view profiles" on public.users;
create policy "Anyone can view profiles"
  on public.users for select
  using (true);

-- ---------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------
drop table if exists public.tickets cascade;
drop table if exists public.events cascade;

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  starts_at timestamptz not null,
  location text not null,
  price_amount numeric not null,
  price_currency text not null default 'CFA',
  banner_from text not null,
  banner_to text not null,
  image_url text,
  organizer_id uuid not null references public.users (id) on delete cascade,
  capacity integer not null default 0,
  category text not null,
  subcategory text,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "Anyone can view events"
  on public.events for select
  using (true);

create policy "Signed-in users can create events"
  on public.events for insert
  to authenticated
  with check (auth.uid() = organizer_id);

-- Simplification: any signed-in user can edit any event (there's no
-- separate admin-role table yet, and the app's admin view relies on
-- being able to edit events it doesn't own). Tighten this later if you
-- add real roles.
create policy "Signed-in users can update events"
  on public.events for update
  to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- tickets — one row per person registered/paid for an event.
-- ---------------------------------------------------------------------
create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid references public.users (id) on delete set null,
  attendee_name text not null,
  attendee_phone text not null,
  payment_method text not null check (payment_method in ('airtel', 'mtn')),
  status text not null default 'valid' check (status in ('valid', 'used')),
  qr_value text not null unique,
  created_at timestamptz not null default now()
);

alter table public.tickets enable row level security;

-- Kept public so a guest who checks out without an account can still
-- see their own ticket / confirmation without logging in. This does
-- mean ticket data (name + phone) is readable by anyone with your
-- project's public API key, same as the events table — fine for a
-- demo, worth tightening later if you need stronger attendee privacy.
create policy "Anyone can view tickets"
  on public.tickets for select
  using (true);

-- Guest checkout: no login required to register + pay for an event.
create policy "Anyone can register for an event"
  on public.tickets for insert
  with check (true);

-- Marking a ticket as used (scanning at the door) requires being
-- signed in.
create policy "Signed-in users can update tickets"
  on public.tickets for update
  to authenticated
  using (true);
