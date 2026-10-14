-- Only the accounts listed in public.admins may change the site.
--
-- Until now every write policy allowed any signed-in account, and Supabase
-- sign-ups were open: anyone could have created an account with the public
-- key and edited photos, videos and settings straight through the API. The
-- server routes and /admin check the same list (lib/admin.js).

create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- No policies: the list is never read or written through the API. is_admin()
-- reads it as its owner.
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Alexandra, and the agency that maintains the site.
insert into public.admins (user_id)
select id from auth.users
where email in ('pencilsline@gmail.com', 'mahanmirmohammadi5784@gmail.com')
on conflict do nothing;

-- photos
drop policy if exists "authenticated can insert photos" on public.photos;
drop policy if exists "authenticated can update photos" on public.photos;
drop policy if exists "authenticated can delete photos" on public.photos;
create policy "admins can insert photos" on public.photos
  for insert to authenticated with check (public.is_admin());
create policy "admins can update photos" on public.photos
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins can delete photos" on public.photos
  for delete to authenticated using (public.is_admin());

-- videos
drop policy if exists "authenticated can insert videos" on public.videos;
drop policy if exists "authenticated can update videos" on public.videos;
drop policy if exists "authenticated can delete videos" on public.videos;
create policy "admins can insert videos" on public.videos
  for insert to authenticated with check (public.is_admin());
create policy "admins can update videos" on public.videos
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins can delete videos" on public.videos
  for delete to authenticated using (public.is_admin());

-- site_settings
drop policy if exists "authenticated can update site settings" on public.site_settings;
create policy "admins can update site settings" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- storage: portfolio images
drop policy if exists "authenticated can upload portfolio images" on storage.objects;
drop policy if exists "authenticated can update portfolio images" on storage.objects;
drop policy if exists "authenticated can delete portfolio images" on storage.objects;
create policy "admins can upload portfolio images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'portfolio' and public.is_admin());
create policy "admins can update portfolio images" on storage.objects
  for update to authenticated
  using (bucket_id = 'portfolio' and public.is_admin())
  with check (bucket_id = 'portfolio' and public.is_admin());
create policy "admins can delete portfolio images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'portfolio' and public.is_admin());

-- storage: videos (uploaded from the browser with her session)
drop policy if exists "authenticated can upload videos" on storage.objects;
drop policy if exists "authenticated can update videos" on storage.objects;
drop policy if exists "authenticated can delete videos" on storage.objects;
create policy "admins can upload videos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'videos' and public.is_admin());
create policy "admins can update videos" on storage.objects
  for update to authenticated
  using (bucket_id = 'videos' and public.is_admin())
  with check (bucket_id = 'videos' and public.is_admin());
create policy "admins can delete videos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'videos' and public.is_admin());
