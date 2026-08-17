-- Kima: lets an admin promote an event as a "Top Event" — at creation
-- or any time later via edit. Top Events (this month, by category and
-- subcategory) also sort first within any filtered results on the
-- regular Browse Events page.
--
-- A trigger (not just UI hiding) enforces that only an admin can set
-- is_top = true — an organizer submitting the form (or hitting the API
-- directly) has it silently reset to false, so this can't be
-- self-granted.
--
-- Safe to run more than once.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

alter table public.events add column if not exists is_top boolean not null default false;

create or replace function public.enforce_top_event_admin_only()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.is_top and not exists (select 1 from public.users where id = auth.uid() and role = 'admin') then
    new.is_top := false;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_top_event_admin_only on public.events;
create trigger enforce_top_event_admin_only
  before insert or update on public.events
  for each row execute procedure public.enforce_top_event_admin_only();
