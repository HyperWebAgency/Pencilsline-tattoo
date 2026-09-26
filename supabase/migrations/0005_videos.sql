-- Clips for the video row under the hero, managed from /admin like the photos.
-- Before this they were three files in public/videos, so changing one meant a
-- code change and a redeploy.

create table if not exists public.videos (
  id            uuid        primary key default gen_random_uuid(),
  storage_path  text        not null unique,
  -- A still taken from the clip in the browser at upload time, so the page can
  -- show a cover while preload="none" withholds the video itself.
  poster_path   text,
  mime_type     text        not null,
  -- Read out by screen readers ("Lire la vidéo : ...").
  label         text        not null check (length(trim(label)) > 0),
  display_order integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists videos_display_order_idx
  on public.videos (display_order, created_at);

drop trigger if exists videos_touch_updated_at on public.videos;
create trigger videos_touch_updated_at
  before update on public.videos
  for each row execute function public.touch_updated_at();

alter table public.videos enable row level security;

drop policy if exists "videos are publicly readable" on public.videos;
create policy "videos are publicly readable"
  on public.videos for select
  to anon, authenticated
  using (true);

drop policy if exists "authenticated can insert videos" on public.videos;
create policy "authenticated can insert videos"
  on public.videos for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update videos" on public.videos;
create policy "authenticated can update videos"
  on public.videos for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete videos" on public.videos;
create policy "authenticated can delete videos"
  on public.videos for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Storage. Public so the page can stream without signed URLs. Unlike photos,
-- the browser uploads straight here with the artist's session: a clip is far
-- over the ~4.5 MB a Vercel function accepts as a request body. 50 MB is the
-- per-file ceiling of the Supabase free plan.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'videos',
  'videos',
  true,
  52428800,
  array['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "videos are publicly streamable" on storage.objects;
create policy "videos are publicly streamable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'videos');

drop policy if exists "authenticated can upload videos" on storage.objects;
create policy "authenticated can upload videos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'videos');

drop policy if exists "authenticated can update videos" on storage.objects;
create policy "authenticated can update videos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'videos')
  with check (bucket_id = 'videos');

drop policy if exists "authenticated can delete videos" on storage.objects;
create policy "authenticated can delete videos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'videos');
