-- Kima: adds a mandatory contact phone number to events, so attendees
-- and admins always have a way to reach the organizer about a specific
-- campaign.
--
-- Existing rows get '' as a placeholder (open the event's edit page to
-- fill in a real number) — the app form requires a real one for every
-- new or edited event going forward.
--
-- Safe to run more than once.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

alter table public.events
  add column if not exists contact_phone text not null default '';
