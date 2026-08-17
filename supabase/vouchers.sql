-- Kima: adds voucher support — admins issue a single-use discount code
-- per event, attendees redeem it on the payment page.
--
-- Safe to run more than once. Additive only (uses IF NOT EXISTS / OR
-- REPLACE throughout) — does not touch your existing events/tickets rows.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

-- ---------------------------------------------------------------------
-- tickets: record what was actually paid (may be less than the event's
-- listed price if a voucher was applied) and which code, if any, was used.
-- ---------------------------------------------------------------------
alter table public.tickets add column if not exists amount_paid numeric;
alter table public.tickets add column if not exists voucher_code text;

-- ---------------------------------------------------------------------
-- vouchers
-- ---------------------------------------------------------------------
create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  code text not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric not null check (discount_value > 0),
  created_by uuid references public.users (id) on delete set null,
  used_at timestamptz,
  -- Not a foreign key on purpose: redeem_voucher() links this to a ticket
  -- id generated client-side *before* the ticket row exists, so a strict
  -- FK would reject the very first write. It's an audit trail, not a
  -- referential-integrity-critical field.
  used_by_ticket_id uuid,
  created_at timestamptz not null default now(),
  unique (event_id, code)
);

alter table public.vouchers enable row level security;

-- Admin-facing: signed-in users can issue and view vouchers (same
-- simplification as events/tickets — no separate roles table yet, so
-- this isn't locked to "just admins", any account can do it for now).
drop policy if exists "Signed-in users can view vouchers" on public.vouchers;
create policy "Signed-in users can view vouchers"
  on public.vouchers for select
  to authenticated
  using (true);

drop policy if exists "Signed-in users can create vouchers" on public.vouchers;
create policy "Signed-in users can create vouchers"
  on public.vouchers for insert
  to authenticated
  with check (true);

-- No public SELECT policy on purpose — guests must not be able to list
-- all codes. Checking/redeeming a code happens through the two
-- functions below, which only ever return whether a specific code is
-- valid, never the whole table.

create or replace function public.validate_voucher(p_event_id uuid, p_code text)
returns table (discount_type text, discount_value numeric)
language sql
security definer
set search_path = public
as $$
  select discount_type, discount_value
  from public.vouchers
  where event_id = p_event_id
    and code = p_code
    and used_at is null;
$$;

grant execute on function public.validate_voucher(uuid, text) to anon, authenticated;

create or replace function public.redeem_voucher(p_event_id uuid, p_code text, p_ticket_id uuid)
returns table (discount_type text, discount_value numeric)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    update public.vouchers
    set used_at = now(), used_by_ticket_id = p_ticket_id
    where event_id = p_event_id
      and code = p_code
      and used_at is null
    returning vouchers.discount_type, vouchers.discount_value;
end;
$$;

grant execute on function public.redeem_voucher(uuid, text, uuid) to anon, authenticated;
