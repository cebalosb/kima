-- Kima: lets an admin promote or demote another registered user to/from
-- 'admin' directly from the app UI — no Supabase dashboard access needed
-- for day-to-day team management.
--
-- Note: this only changes the role of an EXISTING account. Creating a
-- brand-new login still requires that person to sign up themselves
-- (email + password) — the app never invents a password on someone
-- else's behalf. Once they've signed up (default role: organizer), any
-- admin can promote them from the Team page.
--
-- A dedicated RPC (rather than a blanket "admins can update any user
-- row" RLS policy) is used on purpose, so admins can only ever change
-- the `role` column — not someone else's name, email, or phone.
--
-- Safe to run more than once.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

create or replace function public.set_user_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.users where id = auth.uid() and role = 'admin') then
    raise exception 'Only admins can change roles.';
  end if;
  if p_role not in ('organizer', 'admin') then
    raise exception 'Invalid role.';
  end if;
  update public.users set role = p_role where id = p_user_id;
end;
$$;

grant execute on function public.set_user_role(uuid, text) to authenticated;
