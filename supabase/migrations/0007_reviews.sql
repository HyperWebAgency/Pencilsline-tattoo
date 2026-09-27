-- Google reviews shown on the home page ("Ce qu'ils en disent"), managed from
-- /admin. Before this they were hand-copied into lib/reviews.js, so changing
-- one meant a code change and a redeploy. Always shown with five stars, so no
-- rating column. At most 10, enforced by the API (MAX_REVIEWS).

create table if not exists public.reviews (
  id            uuid        primary key default gen_random_uuid(),
  -- As Google displays it, capitals included.
  name          text        not null check (length(trim(name)) > 0),
  -- Word for word from Google; line breaks kept.
  text          text        not null check (length(trim(text)) > 0),
  -- The reviewer's profile picture, in the reviews bucket.
  photo_path    text        not null unique,
  display_order integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists reviews_display_order_idx
  on public.reviews (display_order, created_at);

drop trigger if exists reviews_touch_updated_at on public.reviews;
create trigger reviews_touch_updated_at
  before update on public.reviews
  for each row execute function public.touch_updated_at();

alter table public.reviews enable row level security;

-- Read by the public home page. Writes go through /api/reviews, which checks
-- the session and then uses the secret key, so no write policies are needed.
drop policy if exists "reviews are publicly readable" on public.reviews;
create policy "reviews are publicly readable"
  on public.reviews for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Storage for the profile pictures. Public, so the page links them directly.
-- The API stores each one as a small square WebP.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reviews', 'reviews', true, 1048576, array['image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
