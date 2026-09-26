'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BUCKET, MAX_HOME_PHOTOS } from '@/lib/supabase/config'

const publicUrl = (path) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`

/**
 * The home carousel: a selection of the gallery's photos, in its own order.
 * Step 1 arranges what is in it; step 2 picks from the rest of the gallery.
 */
export default function HomeCarousel({ photos }) {
  const router = useRouter()
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  const inCarousel = photos
    .filter((p) => p.show_on_home)
    .sort((a, b) => a.home_order - b.home_order)
  const available = photos.filter((p) => !p.show_on_home)
  const full = inCarousel.length >= MAX_HOME_PHOTOS

  async function send(url, body, id, failure) {
    setBusy(id)
    setError('')
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const payload = await res.json().catch(() => ({}))
    setBusy(null)
    if (!res.ok) {
      setError(payload.error || failure)
      return
    }
    router.refresh()
  }

  function move(index, direction) {
    const target = index + direction
    if (target < 0 || target >= inCarousel.length) return
    const reordered = [...inCarousel]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    send(
      '/api/photos/home/reorder',
      { ids: reordered.map((p) => p.id) },
      inCarousel[index].id,
      'Réorganisation impossible.'
    )
  }

  return (
    <>
      {error ? <p className="admin__error">{error}</p> : null}

      <h3 className="admin__step">
        <span aria-hidden="true">1</span>
        Dans le carrousel ({inCarousel.length} sur {MAX_HOME_PHOTOS})
      </h3>
      <p className="admin__hint">
        ↑ et ↓ changent l&apos;ordre du carrousel. « Retirer » la sort du carrousel
        sans la supprimer : elle reste dans la galerie.
      </p>

      {inCarousel.length ? (
        <ol className="photo-list">
          {inCarousel.map((photo, index) => (
            <li key={photo.id} className="photo-list__item">
              <span className="photo-list__pos" aria-hidden="true">
                {index + 1}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publicUrl(photo.storage_path)}
                alt={photo.alt_text}
                className="photo-list__thumb"
                loading="lazy"
              />
              <div className="photo-list__meta">
                <p className="photo-list__alt">{photo.description || photo.alt_text}</p>
              </div>
              <div className="photo-list__actions">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || busy === photo.id}
                  aria-label="Monter"
                  title="Monter"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === inCarousel.length - 1 || busy === photo.id}
                  aria-label="Descendre"
                  title="Descendre"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="photo-list__delete"
                  onClick={() =>
                    send(
                      '/api/photos/home',
                      { id: photo.id, onHome: false },
                      photo.id,
                      'Impossible de retirer cette photo.'
                    )
                  }
                  disabled={busy === photo.id}
                >
                  Retirer
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="admin__empty">
          Le carrousel est vide : il n&apos;apparaît pas sur l&apos;accueil.
        </p>
      )}

      <h3 className="admin__step admin__step--spaced">
        <span aria-hidden="true">2</span>
        Ajouter une photo de la galerie
      </h3>
      {full ? (
        <p className="admin__hint">
          Le carrousel est plein. Retirez d&apos;abord une photo ci-dessus pour en
          ajouter une autre.
        </p>
      ) : (
        <p className="admin__hint">
          Touchez « Ajouter » sous une photo : elle se place à la fin du carrousel.
        </p>
      )}

      {available.length ? (
        <ul className="pick-grid">
          {available.map((photo) => (
            <li key={photo.id} className="pick-grid__item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publicUrl(photo.storage_path)}
                alt={photo.alt_text}
                className="pick-grid__thumb"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() =>
                  send(
                    '/api/photos/home',
                    { id: photo.id, onHome: true },
                    photo.id,
                    "Impossible d'ajouter cette photo."
                  )
                }
                disabled={full || busy === photo.id}
              >
                Ajouter
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin__empty">
          Toutes les photos de la galerie sont déjà dans le carrousel. Ajoutez-en
          de nouvelles dans l&apos;onglet Galerie.
        </p>
      )}
    </>
  )
}
