'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BUCKET } from '@/lib/supabase/config'
import PhotoDescription from './PhotoDescription'
import { MoveButtons, SortGrip, useSortable } from './Sortable'

export default function PhotoList({ photos }) {
  const router = useRouter()
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  // Rows saved from « Modifier », shown until router.refresh() brings the
  // server's copy; the list itself only keeps the order.
  const [edited, setEdited] = useState({})
  // The row whose description is open: its grip doesn't start a drag.
  const [editingId, setEditingId] = useState(null)

  function descriptionSaved(updated) {
    setEdited((rows) => ({ ...rows, [updated.id]: updated }))
    router.refresh()
  }

  const publicUrl = (path) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`

  // The whole order in one request, however far the photo moved.
  async function saveOrder(ids) {
    setError('')
    const res = await fetch('/api/photos/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    }).catch(() => null)

    if (!res?.ok) {
      setError('Réorganisation impossible.')
      return false
    }
    return true
  }

  const { list, locked, dragging, listRef, grab, moveTo } = useSortable(photos, saveOrder)

  async function remove(photo) {
    const confirmed = window.confirm(
      `Supprimer définitivement cette photo ?${
        photo.show_on_home ? ' Elle sera aussi retirée du carrousel de l’accueil.' : ''
      }\n\n${photo.description || photo.alt_text}`
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

      <ol
        ref={listRef}
        className={`photo-list${dragging ? ' is-sorting' : ''}`}
        aria-busy={locked || undefined}
      >
        {list.map((row, index) => {
          const photo = { ...row, ...edited[row.id] }
          return (
            <li
              key={photo.id}
              className={`photo-list__item${dragging === photo.id ? ' is-dragging' : ''}`}
            >
              <SortGrip
                index={index}
                onPointerDown={(e) => editingId !== photo.id && grab(e, index)}
              />

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publicUrl(photo.storage_path)}
                alt={photo.alt_text}
                className="photo-list__thumb"
                loading="lazy"
              />

              <div className="photo-list__meta">
                <PhotoDescription
                  photo={photo}
                  onSaved={descriptionSaved}
                  onEditingChange={(open) => setEditingId(open ? photo.id : null)}
                  disabled={busy === photo.id}
                />
                <p className="photo-list__alt">{photo.alt_text}</p>
                {/* The carousel is picked in the Accueil tab; say which are in it. */}
                {photo.show_on_home ? (
                  <p className="photo-list__badge">Aussi dans le carrousel de l&apos;accueil</p>
                ) : null}
              </div>

              <div className="photo-list__actions">
                {/* Arrows as well as the grip, for the keyboard. */}
                <MoveButtons
                  index={index}
                  count={list.length}
                  onMove={moveTo}
                  locked={locked}
                  disabled={busy === photo.id}
                />
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
          )
        })}
      </ol>
    </>
  )
}
