'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PASSWORD_MIN } from '@/lib/admin'

/**
 * Chooses the new password, twice. The rules are checked here for a quick
 * answer, and again by /api/auth/password, which is what counts.
 */
export default function NewPasswordForm({ email }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [shown, setShown] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (password.length < PASSWORD_MIN) {
      setError(`Le mot de passe doit faire au moins ${PASSWORD_MIN} caractères.`)
      return
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne sont pas identiques.')
      return
    }

    setPending(true)
    const res = await fetch('/api/auth/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).catch(() => null)
    const data = await res?.json().catch(() => ({}))

    if (!res?.ok) {
      setError(data?.error || 'Connexion interrompue. Réessayez.')
      setPending(false)
      return
    }

    router.replace('/admin')
    router.refresh()
  }

  return (
    <form className="admin-login__form" onSubmit={handleSubmit}>
      <h1>Nouveau mot de passe</h1>
      <p className="admin-login__text">
        Choisissez un mot de passe d’au moins {PASSWORD_MIN} caractères, que vous n’utilisez
        nulle part ailleurs. Une phrase courte marche très bien.
      </p>

      {/* For password managers: the account this password belongs to. */}
      <input type="email" value={email} autoComplete="username" readOnly hidden />

      <label htmlFor="password">Nouveau mot de passe</label>
      <input
        id="password"
        type={shown ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        required
      />

      <label htmlFor="confirm">Le même, une seconde fois</label>
      <input
        id="confirm"
        type={shown ? 'text' : 'password'}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="new-password"
        required
      />

      <label className="admin-login__check">
        <input type="checkbox" checked={shown} onChange={(e) => setShown(e.target.checked)} />
        Afficher les mots de passe
      </label>

      {error ? (
        <p className="admin-login__error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending}>
        {pending ? 'Enregistrement…' : 'Enregistrer et me connecter'}
      </button>
    </form>
  )
}
