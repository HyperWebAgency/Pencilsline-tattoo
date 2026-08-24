import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import UploadForm from './UploadForm'
import PhotoList from './PhotoList'

// Admin must always reflect true current state and be permission-checked
// per request. Never cached.
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Administration — Pencilsline Tattoo',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()

  // Server-side check on every request. The login UI is cosmetic; this and
  // RLS are the real boundary.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: photos } = await supabase
    .from('photos')
    .select('id, storage_path, alt_text, description, display_order')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  return (
    <main className="admin">
      <header className="admin__header">
        <div>
          <h1>Portfolio</h1>
          <p className="admin__count">
            {photos?.length ?? 0} photo{(photos?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        <AccountBar email={user.email} />
      </header>

      <UploadForm />
      <PhotoList photos={photos ?? []} />
    </main>
  )
}

function AccountBar({ email }) {
  return (
    <div className="admin__account">
      <span className="admin__account-label">Connectée en tant que</span>
      <strong className="admin__account-email">{email}</strong>
      <form action="/api/auth/signout" method="post">
        <button type="submit" className="admin__signout">
          Se déconnecter
        </button>
      </form>
    </div>
  )
}
