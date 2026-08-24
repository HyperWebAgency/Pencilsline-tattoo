'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BUCKET } from '@/lib/supabase/config'

export default function PhotoList({ photos }) {
  const router = useRouter()
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  const publicUrl = (path) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`

  async function move(index, direction) {
    const target = index + direction
    if (target < 0 || target >= photos.length) return

    setBusy(photos[index].id)
    setError('')

    const reordered = [...photos]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]

    const res = await fetch('/api/photos/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map((p) => p.id) }),
    })

    setBusy(null)
    if (!res.ok) {
      setError('Réorganisation impossible.')
      return
    }
    router.refresh()
  }

  async function remove(photo) {
    const confirmed = window.confirm(
      `Supprimer définitivement cette photo ?\n\n${photo.description || photo.alt_text}`
    )
    if (!confirmed) return

    setBusy(photo.id)
    setError('')

    const res = await fetch('/api/photos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: photo.id }),
    })

    setBusy(null)
    if (!res.ok) {
      setError('Suppression impossible.')
      return
    }
    router.refresh()
  }

  if (!photos.length) {
    return <p className="admin__empty">Aucune photo publiée pour le moment.</p>
  }

  return (
    <>
      {error ? <p className="admin__error">{error}</p> : null}

      <ul className="photo-list">
        {photos.map((photo, index) => (
          <li key={photo.id} className="photo-list__item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicUrl(photo.storage_path)}
              alt={photo.alt_text}
              className="photo-list__thumb"
              loading="lazy"
            />

            <div className="photo-list__meta">
              <p className="photo-list__description">{photo.description}</p>
              <p className="photo-list__alt">{photo.alt_text}</p>
            </div>

            <div className="photo-list__actions">
              {/* Arrows as well as drag: HTML5 drag does not work on touch. */}
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0 || busy === photo.id}
                aria-label="Monter"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === photos.length - 1 || busy === photo.id}
                aria-label="Descendre"
              >
                ↓
              </button>
              <button
                type="button"
                className="photo-list__delete"
                onClick={() => remove(photo)}
                disabled={busy === photo.id}
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
