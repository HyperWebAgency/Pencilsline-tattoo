-- Storage bucket for portfolio images.
-- Public bucket so next/image can fetch originals without signed URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio',
  'portfolio',
  true,
  10485760,  -- 10 MB, matches the client-side upload limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Storage policies. Same shape as the photos table: world-readable, and only
-- the signed-in artist may modify objects.
-- ---------------------------------------------------------------------------

drop policy if exists "portfolio images are publicly readable" on storage.objects;
create policy "portfolio images are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'portfolio');

drop policy if exists "authenticated can upload portfolio images" on storage.objects;
create policy "authenticated can upload portfolio images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio');

drop policy if exists "authenticated can update portfolio images" on storage.objects;
create policy "authenticated can update portfolio images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio')
  with check (bucket_id = 'portfolio');

drop policy if exists "authenticated can delete portfolio images" on storage.objects;
create policy "authenticated can delete portfolio images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio');
