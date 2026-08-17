-- Kima: adds a real `role` column to `public.users` so admin access
-- is enforced by the database (RLS), not just by which URL you type.
--
-- New signups default to 'organizer' — every logged-in user manages
-- their own events. Promote specific accounts to 'admin' by hand, see
-- the update at the bottom (edit the email first).
--
-- Safe to run more than once.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

alter table public.users
  add column if not exists role text not null default 'organizer'
  check (role in ('organizer', 'admin'));

-- Organizers can only edit their own events; admins can edit any.
drop policy if exists "Signed-in users can update events" on public.events;
drop policy if exists "Organizers can update own events, admins any" on public.events;
create policy "Organizers can update own events, admins any"
  on public.events for update
  to authenticated
  using (
    auth.uid() = organizer_id
    or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Same split for delete (supersedes the standalone policy from
-- events_delete.sql if you already ran that one).
drop policy if exists "Signed-in users can delete events" on public.events;
drop policy if exists "Organizers can delete own events, admins any" on public.events;
create policy "Organizers can delete own events, admins any"
  on public.events for delete
  to authenticated
  using (
    auth.uid() = organizer_id
    or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Promote your account to admin.
update public.users set role = 'admin' where email = 'cebalosb@gmail.com';
