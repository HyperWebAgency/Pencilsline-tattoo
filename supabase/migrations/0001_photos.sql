-- Portfolio photos for Pencilsline Tattoo.
-- Public reads everything; only authenticated users (the artist) may write.

create table if not exists public.photos (
  id            uuid primary key default gen_random_uuid(),
  storage_path  text        not null unique,
  alt_text      text        not null check (length(trim(alt_text)) > 0),
  description   text,
  display_order integer     not null default 0,
  width         integer,
  height        integer,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Public gallery is always ordered by display_order.
create index if not exists photos_display_order_idx
  on public.photos (display_order, created_at);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists photos_touch_updated_at on public.photos;
create trigger photos_touch_updated_at
  before update on public.photos
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Second layer of defence. Writes normally go through the API route using the
-- secret key (which bypasses RLS), but if the publishable key ever leaks these
-- policies still prevent anonymous writes.
-- ---------------------------------------------------------------------------

alter table public.photos enable row level security;

drop policy if exists "photos are publicly readable" on public.photos;
create policy "photos are publicly readable"
  on public.photos for select
  to anon, authenticated
  using (true);

drop policy if exists "authenticated can insert photos" on public.photos;
create policy "authenticated can insert photos"
  on public.photos for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update photos" on public.photos;
create policy "authenticated can update photos"
  on public.photos for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete photos" on public.photos;
create policy "authenticated can delete photos"
  on public.photos for delete
  to authenticated
  using (true);
