-- The home carousel becomes its own selection, managed apart from the gallery.
--
-- /portfolio shows every photo (up to 50) in display_order. The carousel on /
-- shows a hand-picked subset (up to 12, the count it had when this was
-- written) and now keeps its own order, so rearranging one no longer
-- reshuffles the other.

alter table public.photos
  add column if not exists home_order integer not null default 0;

-- Start from the order the carousel shows today.
update public.photos p
set home_order = ranked.position
from (
  select id, row_number() over (order by display_order, created_at) - 1 as position
  from public.photos
  where show_on_home
) ranked
where p.id = ranked.id;

-- New uploads join the gallery only; she adds them to the carousel herself.
alter table public.photos
  alter column show_on_home set default false;

create index if not exists photos_home_order_idx
  on public.photos (show_on_home, home_order, created_at);
