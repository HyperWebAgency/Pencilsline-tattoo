-- Hardening from the security review of 2026-10-14.
--
-- The anonymous role kept Supabase's default write grants on the public
-- tables. RLS already refused every write, but TRUNCATE ignores RLS: revoke
-- what anon never uses. Reads stay, through the policies.
revoke insert, update, delete, truncate on all tables in schema public from anon;
-- Signed-in users write through RLS (admins only, 0010); TRUNCATE never.
revoke truncate on all tables in schema public from authenticated;

-- The updated_at trigger function ran with a mutable search_path.
alter function public.touch_updated_at() set search_path = '';
