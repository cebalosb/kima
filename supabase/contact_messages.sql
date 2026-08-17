-- Kima: adds a `contact_messages` table backing the public Contact page
-- form. Anyone (including guests) can submit one; only admins can read
-- them back, via the admin Messages page.
--
-- Safe to run more than once.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can submit a contact message" on public.contact_messages;
create policy "Anyone can submit a contact message"
  on public.contact_messages for insert
  with check (true);

-- No public SELECT policy on purpose — only admins should be able to
-- read submitted messages (which may include a real name/email/phone
-- number a stranger typed in, not just platform users).
drop policy if exists "Admins can view contact messages" on public.contact_messages;
create policy "Admins can view contact messages"
  on public.contact_messages for select
  to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));
