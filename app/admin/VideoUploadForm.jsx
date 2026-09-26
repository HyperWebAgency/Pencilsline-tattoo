'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { MAX_VIDEO_BYTES, VIDEO_BUCKET, VIDEO_MIME } from '@/lib/supabase/config'

const EXTENSION = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' }

/** Some phones leave file.type empty for .mov; the extension still says. */
function videoType(file) {
  if (file.type) return file.type
  if (/\.mov$/i.test(file.name)) return 'video/quicktime'
  if (/\.mp4$/i.test(file.name)) return 'video/mp4'
  if (/\.webm$/i.test(file.name)) return 'video/webm'
  return ''
}

/**
 * A still from half a second in, as the clip's cover on the home page. Made
 * here, in the browser, because it is the one place the clip is already
 * decoded. Resolves to null if the browser cannot decode it (an iPhone .mov
 * in some browsers): the site then shows the clip's own first frame.
 */
function makePoster(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    const done = (blob) => {
      URL.revokeObjectURL(url)
      resolve(blob)
    }
    const timer = setTimeout(() => done(null), 15000)

    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.onerror = () => {
      clearTimeout(timer)
      done(null)
    }
    video.onloadeddata = () => {
      video.currentTime = Math.min(0.5, (video.duration || 1) / 2)
    }
    video.onseeked = () => {
      clearTimeout(timer)
      const width = Math.min(720, video.videoWidth || 720)
      const height = Math.round(((video.videoHeight || 1280) * width) / (video.videoWidth || 720))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(video, 0, 0, width, height)
      canvas.toBlob((blob) => done(blob), 'image/jpeg', 0.82)
    }
    video.src = url
  })
}

/**
 * Straight to Supabase Storage with the artist's own session: a clip is far
 * past what a Vercel function accepts as a request body. XHR rather than
 * supabase-js, for the progress events a large clip on a phone needs.
 */
function uploadWithProgress({ path, file, type, token, onProgress }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(
      'POST',
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${VIDEO_BUCKET}/${path}`
    )
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('apikey', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
    xhr.setRequestHeader('Content-Type', type)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total)
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve()
      let message = `Échec de l'envoi (${xhr.status}).`
      try {
        message = JSON.parse(xhr.responseText).message || message
      } catch {}
      reject(new Error(message))
    }
    xhr.onerror = () => reject(new Error('Connexion interrompue pendant l’envoi.'))
    xhr.send(file)
  })
}

export default function VideoUploadForm() {
  const router = useRouter()
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [poster, setPoster] = useState(null) // { blob, url } or null
  const [label, setLabel] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState('') // what is happening, shown to her
  const [progress, setProgress] = useState(0)
  const [pending, setPending] = useState(false)

  async function acceptFile(candidate) {
    if (!candidate) return

    if (!VIDEO_MIME.includes(videoType(candidate))) {
      setError('Format non supporté. Utilisez une vidéo MP4, MOV ou WebM.')
      return
    }
    if (candidate.size > MAX_VIDEO_BYTES) {
      setError(
        `Vidéo trop lourde (${Math.round(candidate.size / 1024 / 1024)} Mo, 50 Mo maximum). Raccourcissez-la ou exportez-la en qualité inférieure.`
      )
      return
    }

    setError('')
    setFile(candidate)
    setPoster(null)
    setStep('Préparation de l’aperçu…')
    const blob = await makePoster(candidate)
    setPoster(blob ? { blob, url: URL.createObjectURL(blob) } : null)
    setStep('')
  }

  function reset() {
    setFile(null)
    setPoster(null)
    setLabel('')
    setProgress(0)
    setStep('')
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!file) {
      setError('Choisissez une vidéo.')
      return
    }
    if (!label.trim()) {
      setError('La description est obligatoire.')
      return
    }

    setPending(true)
    setError('')

    const supabase = createSupabaseBrowserClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      setPending(false)
      setError('Votre session a expiré. Reconnectez-vous, puis réessayez.')
      return
    }

    const type = videoType(file)
    const id = crypto.randomUUID()
    const storagePath = `clips/${id}.${EXTENSION[type]}`
    const posterPath = poster ? `posters/${id}.jpg` : null

    try {
      if (poster) {
        setStep('Envoi de l’image de couverture…')
        const { error: posterError } = await supabase.storage
          .from(VIDEO_BUCKET)
          .upload(posterPath, poster.blob, { contentType: 'image/jpeg' })
        if (posterError) throw posterError
      }

      setStep('Envoi de la vidéo…')
      await uploadWithProgress({
        path: storagePath,
        file,
        type,
        token: session.access_token,
        onProgress: setProgress,
      })

      setStep('Publication…')
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath, posterPath, mimeType: type, label }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.error || 'Échec de la publication.')
    } catch (err) {
      // The API removes the files itself if it fails; this covers a failed upload.
      await supabase.storage
        .from(VIDEO_BUCKET)
        .remove([storagePath, posterPath].filter(Boolean))
        .catch(() => {})
      setPending(false)
      setStep('')
      setError(err.message || 'Échec de l’envoi.')
      return
    }

    setPending(false)
    reset()
    router.refresh()
  }

  return (
    <form className="upload" onSubmit={handleSubmit}>
      <div
        className="upload__dropzone"
        onClick={() => !pending && inputRef.current?.click()}
      >
        {poster ? (
          // Blob preview of a local file — plain img is right here.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster.url} alt="Aperçu de la vidéo" className="upload__preview" />
        ) : file ? (
          <p>{file.name}</p>
        ) : (
          <p>Touchez pour choisir une vidéo (MP4 de préférence, 50 Mo maximum)</p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={[...VIDEO_MIME, '.mov'].join(',')}
          hidden
          onChange={(e) => acceptFile(e.target.files?.[0])}
        />
      </div>

      <label htmlFor="video-label">
        Description <span className="upload__required">(obligatoire)</span>
      </label>
      <input
        id="video-label"
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Ex. : Tracé au pinceau sur l'avant-bras"
        maxLength={200}
        required
      />
      <p className="upload__hint">
        Décrivez ce qu&apos;on voit : ce texte est lu aux personnes malvoyantes.
      </p>

      {step ? (
        <div className="upload__status" role="status">
          <span>{step}</span>
          {step === 'Envoi de la vidéo…' ? (
            <progress className="upload__progress" value={progress} max={1}>
              {Math.round(progress * 100)} %
            </progress>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="upload__error">{error}</p> : null}

      <button type="submit" disabled={pending || !file}>
        {pending ? 'Envoi…' : 'Publier la vidéo'}
      </button>
    </form>
  )
}
