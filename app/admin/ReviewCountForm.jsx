'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ReviewCountForm({ initialCount }) {
  const router = useRouter()
  const [count, setCount] = useState(String(initialCount))
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setPending(true)
    setError('')
    setDone('')

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewCount: Number(count) }),
    })
    const payload = await res.json().catch(() => ({}))

    setPending(false)

    if (!res.ok) {
      setError(payload.error || "Échec de l'enregistrement.")
      return
    }

    setDone(`Enregistré : ${payload.reviewCount} avis. Le site affiche le nouveau chiffre.`)
    router.refresh()
  }

  return (
    <form className="upload" onSubmit={handleSubmit}>
      <label htmlFor="review-count">Nombre d&apos;avis Google</label>
      <input
        id="review-count"
        type="number"
        inputMode="numeric"
        min="0"
        step="1"
        value={count}
        onChange={(e) => setCount(e.target.value)}
        required
      />
      <p className="upload__hint">
        Recopiez le nombre affiché sur votre fiche Google. Il apparaît sur
        l&apos;accueil, dans le pied de page et sur la page Contact.
      </p>

      {error ? <p className="upload__error">{error}</p> : null}
      {done ? <p className="admin__done">{done}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  )
}
