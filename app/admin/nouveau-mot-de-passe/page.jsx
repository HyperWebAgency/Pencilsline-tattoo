import { redirect } from 'next/navigation'
import { getRecoveringAdmin } from '@/lib/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import NewPasswordForm from './NewPasswordForm'

export const metadata = {
  title: 'Nouveau mot de passe — Pencilsline Tattoo',
  robots: { index: false, follow: false },
}

// Checked on every visit: the page only exists for a fresh reset session.
export const dynamic = 'force-dynamic'

/**
 * Reached from a reset link, through /auth/confirm. Without a session that
 * link opened in the last 15 minutes (lib/admin.js), back to the form for a
 * new e-mail.
 */
export default async function NewPasswordPage() {
  const supabase = await createSupabaseServerClient()
  const admin = await getRecoveringAdmin(supabase)
  if (!admin) redirect('/admin/mot-de-passe-oublie?lien=expire')

  return (
    <main className="admin-login">
      <NewPasswordForm email={admin.email} />
    </main>
  )
}
