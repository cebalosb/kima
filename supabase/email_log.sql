-- Kima: records every transactional email the app sends (ticket
-- confirmations, for now), so the admin panel can show usage against
-- the Resend plan's monthly cap.
--
-- Rows are only ever written by the send-ticket-confirmation Edge
-- Function using the service-role key — there's no insert policy for
-- regular clients on purpose.
--
-- Safe to run more than once.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  email_type text not null default 'ticket_confirmation',
  recipient_email text not null,
  ticket_id uuid references public.tickets (id) on delete set null,
  status text not null check (status in ('sent', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.email_log enable row level security;

drop policy if exists "Admins can view email log" on public.email_log;
create policy "Admins can view email log"
  on public.email_log for select
  to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin')));
