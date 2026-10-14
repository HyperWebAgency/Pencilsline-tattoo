/**
 * Who may change the site: the accounts in public.admins (migration 0010),
 * Alexandra's and the agency's. Being signed in is not enough. Sign-ups may be
 * open on the Supabase project, and anyone could create an account with the
 * public key. RLS checks the same list, so a route that forgot this still
 * couldn't write.
 *
 * Server only: pass a client from createSupabaseServerClient().
 */

/**
 * The signed-in user if they are an admin, otherwise null. getUser() checks
 * the session with Supabase rather than trusting the cookie; is_admin() is the
 * database's own answer.
 */
export async function getAdmin(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: isAdmin, error } = await supabase.rpc('is_admin')
  return !error && isAdmin === true ? user : null
}

/** New password length: below 10, too easy to guess; past 72 bytes, bcrypt ignores the rest. */
export const PASSWORD_MIN = 10
export const PASSWORD_MAX_BYTES = 72

/** How long a reset link's session may set a new password. */
const RECOVERY_WINDOW_S = 15 * 60

/**
 * The admin, if this session was authenticated in the last fifteen minutes:
 * in practice, just opened by a password-reset link. Only such a session may
 * choose a new password without the old one, so a session left open for
 * days on a phone can't be used to lock her out.
 *
 * Read from the token's amr: how the session was opened, and when. Token
 * refreshes add no entry (checked on 2026-10-14: one « password » entry per
 * session), so an old session stays old however often it is refreshed.
 */
export async function getRecoveringAdmin(supabase) {
  const admin = await getAdmin(supabase)
  if (!admin) return null

  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) return null

  const now = Math.floor(Date.now() / 1000)
  const fresh = (data.claims.amr ?? []).some(
    (entry) => entry.method !== 'token_refresh' && now - entry.timestamp < RECOVERY_WINDOW_S
  )
  return fresh ? admin : null
}
