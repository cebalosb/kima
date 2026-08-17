-- Kima: lets email_log track contact-form acknowledgement emails
-- alongside ticket confirmations.
--
-- Safe to run more than once.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

alter table public.email_log
  add column if not exists contact_message_id uuid references public.contact_messages (id) on delete set null;
