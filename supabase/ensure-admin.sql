-- Run in the Supabase SQL editor if admin login succeeds but the leads page is empty
-- or shows a setup error. Use the same email as Netlify ADMIN_EMAIL.

insert into public.admin_emails (email)
values
  ('admin@povertykillersfx.com'),
  ('support@povertykillersfx.com')
on conflict (email) do nothing;
