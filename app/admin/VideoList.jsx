'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { VIDEO_BUCKET } from '@/lib/supabase/config'

const publicUrl = (path) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${VIDEO_BUCKET}/${path}`

export default function VideoList({ videos }) {
  const router = useRouter()
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  async function move(index, direction) {
    const target = index + direction
    if (target < 0 || target >= videos.length) return

    setBusy(videos[index].id)
    setError('')

    const reordered = [...videos]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]

    const res = await fetch('/api/videos/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map((v) => v.id) }),
    })

    setBusy(null)
    if (!res.ok) {
      setError('Réorganisation impossible.')
      return
    }
    router.refresh()
  }

  async function remove(video) {
    const confirmed = window.confirm(
      `Supprimer définitivement cette vidéo du site ?\n\n${video.label}`
    )
    if (!confirmed) return

    setBusy(video.id)
    setError('')

    const res = await fetch('/api/videos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: video.id }),
    })

    setBusy(null)
    if (!res.ok) {
      setError('Suppression impossible.')
      return
    }
    router.refresh()
  }

  if (!videos.length) {
    return (
      <p className="admin__empty">
        Aucune vidéo : la rangée de vidéos est masquée sur l&apos;accueil.
      </p>
    )
  }

  return (
    <>
      {error ? <p className="admin__error">{error}</p> : null}

      <ol className="photo-list">
        {videos.map((video, index) => (
          <li key={video.id} className="photo-list__item">
            <span className="photo-list__pos" aria-hidden="true">
              {index + 1}
            </span>

            {video.poster_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={publicUrl(video.poster_path)}
                alt=""
                className="photo-list__thumb photo-list__thumb--video"
                loading="lazy"
              />
            ) : (
              <video
                src={`${publicUrl(video.storage_path)}#t=0.1`}
                className="photo-list__thumb photo-list__thumb--video"
                preload="metadata"
                muted
                playsInline
              />
            )}

            <div className="photo-list__meta">
              <p className="photo-list__alt">{video.label}</p>
              {index === 0 ? (
                <p className="photo-list__badge">Affichée sur téléphone</p>
              ) : null}
            </div>

            <div className="photo-list__actions">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0 || busy === video.id}
                aria-label="Monter"
                title="Monter"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === videos.length - 1 || busy === video.id}
                aria-label="Descendre"
                title="Descendre"
              >
                ↓
              </button>
              <button
                type="button"
                className="photo-list__delete"
                onClick={() => remove(video)}
                disabled={busy === video.id}
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}
