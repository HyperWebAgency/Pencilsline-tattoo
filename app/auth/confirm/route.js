import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Where the password-reset e-mail's link lands. It turns the link's one-time
 * code into a session, then sends her to choose a new password. The
 * destination is fixed, never read from the link, so a link can't be bent
 * into a redirect to another site.
 *
 * Two shapes of link:
 * - ?code=…, Supabase's default e-mail: works in the browser that asked for it
 *   (the code's other half was left there as a cookie);
 * - ?token_hash=…&type=recovery, once Supabase's « Reset password » e-mail
 *   template links here: works on any device, e.g. asked on a computer and
 *   opened on a phone.
 *
 * A used, expired or forged code opens nothing and goes back to the form.
 */
export async function GET(request) {
  const params = new URL(request.url).searchParams
  const code = params.get('code')
  const tokenHash = params.get('token_hash')

  const supabase = await createSupabaseServerClient()
  let opened = false

  if (code) {
    opened = !(await supabase.auth.exchangeCodeForSession(code)).error
  } else if (tokenHash && params.get('type') === 'recovery') {
    opened = !(await supabase.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash })).error
  }

  redirect(opened ? '/admin/nouveau-mot-de-passe' : '/admin/mot-de-passe-oublie?lien=expire')
}
