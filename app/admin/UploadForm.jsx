'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { ALLOWED_MIME, MAX_GALLERY_PHOTOS, MAX_ORIGINAL_BYTES } from '@/lib/supabase/config'
import { SEND_AS_IS_BYTES, formatSize, shrinkPhoto } from '@/lib/shrinkPhoto'

/** `count` is how many photos the gallery holds; it stops at MAX_GALLERY_PHOTOS. */
export default function UploadForm({ count }) {
  const router = useRouter()
  const inputRef = useRef(null)
  const pickRef = useRef(0) // the latest pick wins if she picks again mid-way
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [note, setNote] = useState('') // what happened to her photo
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [preparing, setPreparing] = useState(false)
  const [pending, setPending] = useState(false)
  const [dragging, setDragging] = useState(false)

  async function acceptFile(candidate) {
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
    setFile(null)
    setPreview('')
    setNote('Préparation de la photo…')
    setPreparing(true)

    let shrunk = null
    try {
      shrunk = await shrinkPhoto(candidate)
    } catch {}
    if (pick !== pickRef.current) return
    setPreparing(false)

    if (shrunk) {
      const size = `${shrunk.width} × ${shrunk.height} px`
      setFile(shrunk.file)
      setPreview(URL.createObjectURL(shrunk.file))
      setNote(
        shrunk.file.type === 'image/webp'
          ? `Prête : ${size} · ${formatSize(candidate.size)} → ${formatSize(shrunk.file.size)}, publiée en WebP.`
          : `Prête : ${size}, convertie en WebP à l’envoi.`
      )
    } else if (candidate.size <= SEND_AS_IS_BYTES) {
      // This browser can't read it, but the server can.
      setFile(candidate)
      setNote('Pas d’aperçu dans ce navigateur : la photo sera convertie en WebP à l’envoi.')
    } else {
      setNote('')
      setError('Impossible de préparer cette photo. Enregistrez-la en JPG, puis réessayez.')
    }
  }

  function reset() {
    setFile(null)
    setPreview('')
    setNote('')
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

    try {
      const res = await fetch('/api/photos', { method: 'POST', body })
      // A refusal from Vercel itself (413, too large) is not JSON.
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(
          payload.error ||
            (res.status === 413
              ? 'Photo trop lourde pour l’envoi. Essayez avec une photo plus petite.'
              : "Échec de l'envoi.")
        )
        return
      }
    } catch {
      setError('Connexion interrompue pendant l’envoi. Réessayez.')
      return
    } finally {
      setPending(false)
    }

    reset()
    router.refresh()
  }

  // At the limit, say why there is no form and what to do instead.
  if (count >= MAX_GALLERY_PHOTOS) {
    return (
      <div className="upload upload--full">
        <p>
          <strong>La galerie est pleine : {count} photos sur {MAX_GALLERY_PHOTOS}.</strong>
        </p>
        <p className="upload__hint">
          Pour ajouter une nouvelle photo, supprimez d&apos;abord une photo dans la
          liste ci-dessous. Le formulaire d&apos;ajout réapparaîtra ici.
        </p>
      </div>
    )
  }

  const left = MAX_GALLERY_PHOTOS - count

  return (
    <form className="upload" onSubmit={handleSubmit}>
      <p className="upload__hint">
        Encore {left} photo{left > 1 ? 's' : ''} possible{left > 1 ? 's' : ''} dans la galerie
        ({count} sur {MAX_GALLERY_PHOTOS}). Une nouvelle photo va dans la galerie ; pour
        la montrer aussi sur l&apos;accueil, ajoutez-la ensuite dans l&apos;onglet Accueil.
      </p>
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
        ) : file ? (
          <p>{file.name}</p>
        ) : (
          <p>
            Glissez une photo ici, ou touchez pour choisir (JPG ou PNG : elle est
            convertie en WebP automatiquement)
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_MIME.join(',')}
          hidden
          onChange={(e) => acceptFile(e.target.files?.[0])}
        />
      </div>

      {note ? (
        <p className="upload__status" role="status">
          {note}
        </p>
      ) : null}

      <label htmlFor="description">
        Description <span className="upload__required">(obligatoire)</span>
      </label>
      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Ex. : Fleur au pinceau sur l'avant-bras"
        rows={2}
        required
      />
      <p className="upload__hint">
        Décrivez le tatouage — le nom du studio et la ville sont ajoutés
        automatiquement pour le référencement.
      </p>

      {error ? <p className="upload__error">{error}</p> : null}

      <button type="submit" disabled={pending || preparing}>
        {pending ? 'Envoi…' : 'Publier la photo'}
      </button>
    </form>
  )
}
