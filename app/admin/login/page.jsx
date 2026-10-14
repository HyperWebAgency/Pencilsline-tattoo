'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setPending(true)
    setError('')

    const supabase = createSupabaseBrowserClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('Email ou mot de passe incorrect.')
      setPending(false)
      return
    }

    // A real account that isn't on the admin list (public.admins): /admin
    // would send it straight back here, so say so and close the session.
    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (isAdmin !== true) {
      await supabase.auth.signOut()
      setError('Ce compte n’a pas accès à l’administration.')
      setPending(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="admin-login">
      <form className="admin-login__form" onSubmit={handleSubmit}>
        <h1>Espace administration</h1>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error ? <p className="admin-login__error">{error}</p> : null}

        <button type="submit" disabled={pending}>
          {pending ? 'Connexion…' : 'Se connecter'}
        </button>

        <Link className="admin-login__link" href="/admin/mot-de-passe-oublie">
          Mot de passe oublié&nbsp;?
        </Link>
      </form>
    </main>
  )
}
