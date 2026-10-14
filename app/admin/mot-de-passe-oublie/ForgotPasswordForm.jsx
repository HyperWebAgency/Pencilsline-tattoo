'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

/**
 * Sends the reset e-mail. Its link lands on /auth/confirm, which opens a
 * short session and sends her to choose a new password.
 *
 * The answer is the same whether or not the address has an account, so the
 * form can't be used to find out which e-mails do. Supabase limits how often
 * it sends; that limit is the one thing said plainly.
 */
export default function ForgotPasswordForm({ expired }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | sending | sent | limited | failed

  async function handleSubmit(event) {
    event.preventDefault()
    setState('sending')

    const { error } = await createSupabaseBrowserClient().auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/auth/confirm` }
    )

    if (!error) setState('sent')
    else if (error.status === 429) setState('limited')
    // No status: the request never reached Supabase.
    else setState(error.status ? 'sent' : 'failed')
  }

  if (state === 'sent') {
    return (
      <div className="admin-login__form">
        <h1>Vérifiez vos e-mails</h1>
        <p className="admin-login__text">
          Si <strong>{email.trim()}</strong> correspond à un compte, un e-mail vient de partir
          avec un lien pour choisir un nouveau mot de passe.
        </p>
        <p className="admin-login__text">
          Le lien ne sert qu’une fois. Pensez à regarder dans les spams.
        </p>
        <Link className="admin-login__link" href="/admin/login">
          ← Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <form className="admin-login__form" onSubmit={handleSubmit}>
      <h1>Mot de passe oublié</h1>

      {expired ? (
        <p className="admin-login__error" role="alert">
          Ce lien a expiré ou a déjà servi. Demandez-en un nouveau ci-dessous.
        </p>
      ) : null}

      <p className="admin-login__text">
        Entrez l’adresse e-mail de votre compte&nbsp;: vous recevrez un lien pour choisir un
        nouveau mot de passe.
      </p>

      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="username"
        required
      />

      {state === 'limited' ? (
        <p className="admin-login__error" role="alert">
          Trop de demandes d’un coup. Patientez quelques minutes, puis réessayez.
        </p>
      ) : null}
      {state === 'failed' ? (
        <p className="admin-login__error" role="alert">
          Envoi impossible. Vérifiez votre connexion, puis réessayez.
        </p>
      ) : null}

      <button type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'Envoi…' : 'Recevoir le lien'}
      </button>

      <Link className="admin-login__link" href="/admin/login">
        ← Retour à la connexion
      </Link>
    </form>
  )
}
