import { NextResponse } from 'next/server'
import { getRecoveringAdmin, PASSWORD_MAX_BYTES, PASSWORD_MIN } from '@/lib/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const fail = (error, status = 400) => NextResponse.json({ error }, { status })

/**
 * Sets a new password after a reset link. Done here rather than from the
 * browser so the rules hold whatever is sent:
 * - only this site's own pages may call it (no cross-site form);
 * - only an admin whose session a reset link opened in the last 15 minutes
 *   (lib/admin.js), never an old session left open somewhere;
 * - a password of 10 to 72 characters, not the e-mail address.
 * Every other session of the account is then signed out, in case someone
 * else had one.
 */
export async function POST(request) {
  // Same-origin only. Browsers send one of the two headers or both.
  const site = request.headers.get('sec-fetch-site')
  if (site && site !== 'same-origin') return fail('Non autorisé.', 403)
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return fail('Non autorisé.', 403)

  const supabase = await createSupabaseServerClient()
  const admin = await getRecoveringAdmin(supabase)
  if (!admin) {
    return fail('Ce lien a expiré. Demandez un nouvel e-mail de réinitialisation.', 401)
  }

  const body = await request.json().catch(() => null)
  const password = typeof body?.password === 'string' ? body.password : ''
  if (password.length < PASSWORD_MIN) {
    return fail(`Le mot de passe doit faire au moins ${PASSWORD_MIN} caractères.`)
  }
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) {
    return fail('Mot de passe trop long.')
  }
  if (password.trim().toLowerCase() === admin.email?.toLowerCase()) {
    return fail('Le mot de passe ne peut pas être votre adresse e-mail.')
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    if (error.code === 'same_password') {
      return fail('Choisissez un mot de passe différent de l’ancien.')
    }
    if (error.code === 'weak_password') {
      return fail('Mot de passe trop simple. Mélangez lettres, chiffres et symboles.')
    }
    return fail('Enregistrement impossible. Réessayez.', 500)
  }

  await supabase.auth.signOut({ scope: 'others' })
  return NextResponse.json({ ok: true })
}
