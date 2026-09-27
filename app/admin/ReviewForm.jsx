'use client'

import { useRouter } from 'next/navigation'
import { useId, useRef, useState } from 'react'
import { ALLOWED_MIME, MAX_ORIGINAL_BYTES } from '@/lib/supabase/config'
import { SEND_AS_IS_BYTES, formatSize, shrinkPhoto } from './shrinkPhoto'

/**
 * Adds a review, or edits one when `review` is given (then `photoUrl` is its
 * current picture and `onClose` closes the form). Stars are not asked for:
 * the site always shows five.
 */
export default function ReviewForm({ review, photoUrl, onClose }) {
  const router = useRouter()
  const id = useId()
  const inputRef = useRef(null)
  const pickRef = useRef(0) // the latest pick wins if she picks again mid-way
  const [name, setName] = useState(review?.name ?? '')
  const [text, setText] = useState(review?.text ?? '')
  const [photo, setPhoto] = useState(null) // a newly picked file
  const [preview, setPreview] = useState(photoUrl ?? '')
  const [error, setError] = useState('')
  const [preparing, setPreparing] = useState(false)
  const [pending, setPending] = useState(false)

  async function acceptPhoto(candidate) {
    if (!candidate) return

    if (!ALLOWED_MIME.includes(candidate.type)) {
      setError('Format non supporté. Utilisez JPG, PNG, WebP ou AVIF.')
      return
    }
    if (candidate.size > MAX_ORIGINAL_BYTES) {
      setError(`Photo trop lourde (${formatSize(candidate.size)}, 30 Mo maximum).`)
      return
    }

    const pick = ++pickRef.current
    setError('')
    setPreparing(true)

    // Only to get under what a Vercel function accepts; the server crops it.
    let shrunk = null
    try {
      shrunk = await shrinkPhoto(candidate, 1024)
    } catch {}
    if (pick !== pickRef.current) return
    setPreparing(false)

    if (shrunk) {
      setPhoto(shrunk.file)
      setPreview(URL.createObjectURL(shrunk.file))
    } else if (candidate.size <= SEND_AS_IS_BYTES) {
      // This browser can't read it, but the server can.
      setPhoto(candidate)
      setPreview('')
    } else {
      setError('Impossible de préparer cette photo. Enregistrez-la en JPG, puis réessayez.')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!review && !photo) {
      setError('La photo est obligatoire.')
      return
    }
    if (!name.trim() || !text.trim()) {
      setError('Le nom et l’avis sont obligatoires.')
      return
    }

    setPending(true)
    setError('')

    const body = new FormData()
    if (review) body.append('id', review.id)
    body.append('name', name)
    body.append('text', text)
    if (photo) body.append('photo', photo)

    try {
      const res = await fetch('/api/reviews', { method: review ? 'PATCH' : 'POST', body })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(payload.error || "Échec de l'enregistrement.")
        return
      }
    } catch {
      setError('Connexion interrompue. Réessayez.')
      return
    } finally {
      setPending(false)
    }

    if (review) {
      onClose()
    } else {
      setName('')
      setText('')
      setPhoto(null)
      setPreview('')
      if (inputRef.current) inputRef.current.value = ''
    }
    router.refresh()
  }

  return (
    <form className="upload review-form" onSubmit={handleSubmit}>
      <div className="review-form__photo">
        <button
          type="button"
          className="review-form__avatar"
          onClick={() => inputRef.current?.click()}
          aria-label={preview ? 'Changer la photo' : 'Choisir la photo'}
        >
          {preview ? (
            // Blob or storage preview — plain img is right here.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" />
          ) : (
            <span aria-hidden="true">{photo ? '✓' : '+'}</span>
          )}
        </button>
        <div>
          <p className="review-form__photo-label">
            Photo de profil{' '}
            {review ? null : <span className="upload__required">(obligatoire)</span>}
          </p>
          <p className="upload__hint">
            {preparing
              ? 'Préparation de la photo…'
              : photo && !preview
                ? 'Photo choisie (pas d’aperçu dans ce navigateur).'
                : review
                  ? 'Touchez le rond pour la changer.'
                  : 'La photo Google de la personne : touchez le rond pour la choisir.'}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_MIME.join(',')}
          hidden
          onChange={(e) => acceptPhoto(e.target.files?.[0])}
        />
      </div>

      <label htmlFor={`${id}-name`}>
        Nom <span className="upload__required">(obligatoire)</span>
      </label>
      <input
        id={`${id}-name`}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex. : Marine Vialle"
        maxLength={80}
        required
      />

      <label htmlFor={`${id}-text`}>
        Avis <span className="upload__required">(obligatoire)</span>
      </label>
      <textarea
        id={`${id}-text`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={review ? 6 : 4}
        maxLength={4000}
        required
      />
      <p className="upload__hint">
        Recopiez l&apos;avis mot pour mot, tel qu&apos;il est sur Google. Les
        retours à la ligne sont gardés.
      </p>

      {error ? <p className="upload__error">{error}</p> : null}

      <div className="review-form__actions">
        <button type="submit" disabled={pending || preparing}>
          {pending ? 'Enregistrement…' : review ? 'Enregistrer' : 'Ajouter l’avis'}
        </button>
        {review ? (
          <button type="button" className="review-form__cancel" onClick={onClose} disabled={pending}>
            Annuler
          </button>
        ) : null}
      </div>
    </form>
  )
}
