-- Whether a reviewer's Google picture is one of Google's letter avatars (a
-- plain disc with an initial) rather than a photo. The hero's row of faces
-- shows photos only. /api/reviews sets it from the picture itself at upload:
-- a letter avatar's image entropy is far lower than a photo's (about 4.3
-- against 7.1 to 7.3 on the first reviews), so it is not asked of Alexandra.

alter table public.reviews
  add column if not exists letter_avatar boolean not null default false;
