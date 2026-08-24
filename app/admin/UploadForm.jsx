'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { ALLOWED_MIME, MAX_UPLOAD_BYTES } from '@/lib/supabase/config'

export default function UploadForm() {
  const router = useRouter()
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [dragging, setDragging] = useState(false)

  function acceptFile(candidate) {
    if (!candidate) return

    if (!ALLOWED_MIME.includes(candidate.type)) {
      setError('Format non supporté. Utilisez JPG, PNG, WebP ou AVIF.')
      return
    }
    if (candidate.size > MAX_UPLOAD_BYTES) {
      setError('Fichier trop volumineux (10 Mo maximum).')
      return
    }

    setError('')
    setFile(candidate)
    setPreview(URL.createObjectURL(candidate))
  }

  function reset() {
    setFile(null)
    setPreview('')
    setDescription('')
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!file) {
      setError('Choisissez une photo.')
      return
    }
    if (!description.trim()) {
      setError('La description est obligatoire.')
      return
    }

    setPending(true)
    setError('')

    const body = new FormData()
    body.append('file', file)
    body.append('description', description)

    const res = await fetch('/api/photos', { method: 'POST', body })
    const payload = await res.json()

    setPending(false)

    if (!res.ok) {
      setError(payload.error || "Échec de l'envoi.")
      return
    }

    reset()
    router.refresh()
  }

  return (
    <form className="upload" onSubmit={handleSubmit}>
      <div
        className={`upload__dropzone${dragging ? ' upload__dropzone--active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          acceptFile(e.dataTransfer.files?.[0])
        }}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          // Blob preview of a local file — plain img is correct here,
          // next/image is for the published portfolio.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Aperçu" className="upload__preview" />
        ) : (
          <p>Glissez une photo ici, ou touchez pour choisir</p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_MIME.join(',')}
          hidden
          onChange={(e) => acceptFile(e.target.files?.[0])}
        />
      </div>

      <label htmlFor="description">
        Description <span className="upload__required">(obligatoire)</span>
      </label>
      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Ex. : Fleur fineline sur l'avant-bras"
        rows={2}
        required
      />
      <p className="upload__hint">
        Décrivez le tatouage — le nom du studio et la ville sont ajoutés
        automatiquement pour le référencement.
      </p>

      {error ? <p className="upload__error">{error}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? 'Envoi…' : 'Publier la photo'}
      </button>
    </form>
  )
}
