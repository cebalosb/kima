-- Kima: lets an admin delete a contact message from the Messages page.
--
-- Also backs the 14-day retention cleanup: any message older than 14
-- days is purged automatically whenever an admin loads the Messages
-- page (there is no background timer — cleanup happens on that read,
-- via the same admin-only delete permission this policy grants).
--
-- Safe to run more than once.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

drop policy if exists "Admins can delete contact messages" on public.contact_messages;
create policy "Admins can delete contact messages"
  on public.contact_messages for delete
  to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));
