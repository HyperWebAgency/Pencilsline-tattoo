import ForgotPasswordForm from './ForgotPasswordForm'

export const metadata = {
  title: 'Mot de passe oublié — Pencilsline Tattoo',
  robots: { index: false, follow: false },
}

/** Asks for a reset e-mail. ?lien=expire when a reset link didn't work. */
export default async function ForgotPasswordPage({ searchParams }) {
  const { lien } = await searchParams
  return (
    <main className="admin-login">
      <ForgotPasswordForm expired={lien === 'expire'} />
    </main>
  )
}
