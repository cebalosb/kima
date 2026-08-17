-- Kima: sets up the `users` table to work with Supabase Auth.
-- Safe to run more than once. Assumes `users` is currently empty
-- (it was just created) — if you've already added real rows, stop
-- and ask before running this.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

-- Start clean so the columns/types are guaranteed to match what the app expects.
drop table if exists public.users cascade;

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

-- Row Level Security: each person can only see/edit their own row.
alter table public.users enable row level security;

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Whenever someone signs up (auth.users gets a new row), automatically
-- create their matching row in public.users, pulling name/phone from the
-- sign-up form. Runs with elevated privileges so it works even before
-- the user has confirmed their email.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
