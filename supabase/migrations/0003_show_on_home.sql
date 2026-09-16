-- Per-photo control over the home page carousel.
--
-- The carousel on /, the grid on /portfolio and the polaroid deal that plays on
-- the way there all read this one table, so there was no way to drop a photo
-- from one surface without losing it everywhere. This flag does exactly that:
-- false hides a photo from the home carousel only, and it still appears in the
-- portfolio and in the transition.

alter table public.photos
  add column if not exists show_on_home boolean not null default true;

-- The home page filters on this, so keep the ordered lookup covered.
create index if not exists photos_home_idx
  on public.photos (show_on_home, display_order, created_at);
