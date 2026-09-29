-- Inspiration images sent with the contact form. Formspree only takes file
-- attachments on its paid plans, so /api/inspirations stores each image here
-- and the booking email carries a link to it.
--
-- Public, so the link in the email opens without a login. There is no select
-- policy on storage.objects for this bucket, so it can't be listed: a file is
-- only reachable by its random name. The API writes with the secret key, so no
-- insert policy either.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('inspirations', 'inspirations', true, 2097152, array['image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
