-- Kima: replaces the binary organizer/admin role model with Kima's
-- real role set. 'organizer' stays as the default for the general
-- public (anyone who signs up to run their own events) — it is NOT an
-- employee role. Employees get one of: sales, admin, super_admin.
--
-- 'admin' and 'super_admin' are treated identically everywhere below
-- (both get full admin-panel access) — there's no behavioral
-- difference between them yet. 'sales' currently gets no special
-- access beyond the regular organizer experience; define what Sales
-- should actually see/do and this file's checks are the place to
-- extend.
--
-- Safe to run more than once.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check
  check (role in ('organizer', 'sales', 'admin', 'super_admin'));

alter table public.employees drop constraint if exists employees_role_check;
alter table public.employees add constraint employees_role_check
  check (role in ('sales', 'admin', 'super_admin'));

-- events: organizer-or-admin update/delete
drop policy if exists "Organizers can update own events, admins any" on public.events;
create policy "Organizers can update own events, admins any"
  on public.events for update
  to authenticated
  using (
    auth.uid() = organizer_id
    or exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin'))
  );

drop policy if exists "Organizers can delete own events, admins any" on public.events;
create policy "Organizers can delete own events, admins any"
  on public.events for delete
  to authenticated
  using (
    auth.uid() = organizer_id
    or exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- contact_messages
drop policy if exists "Admins can view contact messages" on public.contact_messages;
create policy "Admins can view contact messages"
  on public.contact_messages for select
  to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin')));

drop policy if exists "Admins can delete contact messages" on public.contact_messages;
create policy "Admins can delete contact messages"
  on public.contact_messages for delete
  to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin')));

-- employees
drop policy if exists "Admins can view employees" on public.employees;
create policy "Admins can view employees"
  on public.employees for select
  to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin')));

drop policy if exists "Admins can add employees" on public.employees;
create policy "Admins can add employees"
  on public.employees for insert
  to authenticated
  with check (exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin')));

drop policy if exists "Admins can update employees" on public.employees;
create policy "Admins can update employees"
  on public.employees for update
  to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin')));

drop policy if exists "Admins can delete employees" on public.employees;
create policy "Admins can delete employees"
  on public.employees for delete
  to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin')));

-- Role-change RPC
create or replace function public.set_user_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin')) then
    raise exception 'Only admins can change roles.';
  end if;
  if p_role not in ('organizer', 'sales', 'admin', 'super_admin') then
    raise exception 'Invalid role.';
  end if;
  update public.users set role = p_role where id = p_user_id;
end;
$$;

-- Top Event promotion trigger
create or replace function public.enforce_top_event_admin_only()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.is_top and not exists (
    select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin')
  ) then
    new.is_top := false;
  end if;
  return new;
end;
$$;
