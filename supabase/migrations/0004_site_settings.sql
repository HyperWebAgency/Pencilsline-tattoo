-- Site-wide values the artist edits herself from /admin. For now, the Google
-- review count shown in the hero, the footer and on /contact, which used to be
-- a constant in config and needed a redeploy every time it grew.
--
-- One row only: the boolean primary key can only ever be true.

create table if not exists public.site_settings (
  id                  boolean     primary key default true check (id),
  google_review_count integer     not null check (google_review_count >= 0),
  updated_at          timestamptz not null default now()
);

-- Seeded with the number read off the profile on 7 September 2026.
insert into public.site_settings (id, google_review_count)
values (true, 289)
on conflict (id) do nothing;

drop trigger if exists site_settings_touch_updated_at on public.site_settings;
create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- Same shape as photos: world-readable, only the signed-in artist may change
-- it. Writes go through /api/settings with the secret key anyway; these are
-- the second layer.

alter table public.site_settings enable row level security;

drop policy if exists "site settings are publicly readable" on public.site_settings;
create policy "site settings are publicly readable"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "authenticated can update site settings" on public.site_settings;
create policy "authenticated can update site settings"
  on public.site_settings for update
  to authenticated
  using (true)
  with check (true);
