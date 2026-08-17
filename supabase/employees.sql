-- Kima: employee roster for internal platform access. Lets an admin
-- enroll a Kima employee (name, contract details, intended platform
-- role) before that person ever signs up. When they do sign up with
-- the matching email, they're automatically given that role instead
-- of the default 'organizer' — no shared passwords, no Supabase
-- dashboard access needed for day-to-day enrollment.
--
-- Safe to run more than once.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null unique,
  contract_type text not null,
  contract_start_date date not null,
  contract_end_date date,
  role text not null default 'organizer' check (role in ('organizer', 'admin')),
  user_id uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.employees enable row level security;

drop policy if exists "Admins can view employees" on public.employees;
create policy "Admins can view employees"
  on public.employees for select
  to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

drop policy if exists "Admins can add employees" on public.employees;
create policy "Admins can add employees"
  on public.employees for insert
  to authenticated
  with check (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

drop policy if exists "Admins can update employees" on public.employees;
create policy "Admins can update employees"
  on public.employees for update
  to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

drop policy if exists "Admins can delete employees" on public.employees;
create policy "Admins can delete employees"
  on public.employees for delete
  to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Re-point the signup trigger: a new account gets its role from a
-- matching employees row (by email) if one exists, otherwise the
-- default 'organizer'. Also links the employee row to the new user
-- once they've actually signed up, so the app can tell "enrolled but
-- hasn't signed up yet" apart from "active".
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  matched_role text;
begin
  select role into matched_role from public.employees where email = new.email limit 1;

  insert into public.users (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    coalesce(matched_role, 'organizer')
  )
  on conflict (id) do nothing;

  update public.employees set user_id = new.id where email = new.email;

  return new;
end;
$$;
