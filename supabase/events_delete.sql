-- Kima: adds the missing delete policy for `events`, needed by the
-- admin panel's "Delete event" button.
--
-- Mirrors the existing update policy — any signed-in user can delete
-- any event, since there's still no separate admin-role table. Deleting
-- an event cascades to its tickets and vouchers (see events_and_tickets.sql
-- and vouchers.sql for those foreign keys).
--
-- Safe to run more than once.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

drop policy if exists "Signed-in users can delete events" on public.events;
create policy "Signed-in users can delete events"
  on public.events for delete
  to authenticated
  using (true);
