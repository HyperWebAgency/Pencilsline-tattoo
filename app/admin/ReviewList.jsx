'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { REVIEW_BUCKET } from '@/lib/supabase/config'
import ReviewForm from './ReviewForm'

const publicUrl = (path) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${REVIEW_BUCKET}/${path}`

export default function ReviewList({ reviews }) {
  const router = useRouter()
  const [busy, setBusy] = useState(null)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  async function move(index, direction) {
    const target = index + direction
    if (target < 0 || target >= reviews.length) return

    setBusy(reviews[index].id)
    setError('')

    const reordered = [...reviews]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]

    const res = await fetch('/api/reviews/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map((r) => r.id) }),
    })

    setBusy(null)
    if (!res.ok) {
      setError('Réorganisation impossible.')
      return
    }
    router.refresh()
  }

  async function remove(review) {
    const confirmed = window.confirm(`Supprimer l’avis de ${review.name} du site ?`)
    if (!confirmed) return

    setBusy(review.id)
    setError('')

    const res = await fetch('/api/reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: review.id }),
    })

    setBusy(null)
    if (!res.ok) {
      setError('Suppression impossible.')
      return
    }
    router.refresh()
  }

  if (!reviews.length) {
    return (
      <p className="admin__empty">
        Aucun avis : la section « Ce qu&apos;ils en disent » est masquée sur l&apos;accueil.
      </p>
    )
  }

  return (
    <>
      {error ? <p className="admin__error">{error}</p> : null}

      <ol className="photo-list">
        {reviews.map((review, index) =>
          editing === review.id ? (
            <li key={review.id} className="photo-list__item photo-list__item--form">
              <ReviewForm
                review={review}
                photoUrl={publicUrl(review.photo_path)}
                onClose={() => setEditing(null)}
              />
            </li>
          ) : (
            <li key={review.id} className="photo-list__item">
              <span className="photo-list__pos" aria-hidden="true">
                {index + 1}
              </span>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publicUrl(review.photo_path)}
                alt=""
                className="photo-list__thumb photo-list__thumb--avatar"
                loading="lazy"
              />

              <div className="photo-list__meta">
                <p className="photo-list__alt">{review.name}</p>
                <p className="photo-list__description photo-list__description--clamp">
                  {review.text}
                </p>
              </div>

              <div className="photo-list__actions">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || busy === review.id}
                  aria-label="Monter"
                  title="Monter"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === reviews.length - 1 || busy === review.id}
                  aria-label="Descendre"
                  title="Descendre"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(review.id)}
                  disabled={busy === review.id}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="photo-list__delete"
                  onClick={() => remove(review)}
                  disabled={busy === review.id}
                >
                  Supprimer
                </button>
              </div>
            </li>
          )
        )}
      </ol>
    </>
  )
}
