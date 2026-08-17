-- Kima: adds a mandatory attendee email to tickets, collected at
-- registration, so a payment-confirmation email can be sent once a
-- ticket is paid for.
--
-- Existing rows get '' as a placeholder — the app form requires a
-- real one for every new registration going forward.
--
-- Safe to run more than once.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

alter table public.tickets
  add column if not exists attendee_email text not null default '';
