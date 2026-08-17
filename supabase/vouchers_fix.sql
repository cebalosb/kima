-- Kima: fixes a bug in the voucher setup — redeeming a voucher failed
-- with a foreign-key error because used_by_ticket_id pointed at a
-- ticket id that doesn't exist yet at the moment the voucher is
-- redeemed (the ticket is only created right after). This just drops
-- that constraint; the column stays as a plain audit-trail id.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

alter table public.vouchers drop constraint if exists vouchers_used_by_ticket_id_fkey;
