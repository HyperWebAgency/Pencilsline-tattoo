import { PHOTO_MAX_EDGE, PHOTO_WEBP_QUALITY } from '@/lib/supabase/config'

/** Under the 4.5 MB a Vercel function accepts, so a photo can still go whole. */
export const SEND_AS_IS_BYTES = 4 * 1024 * 1024

const toBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality))

/** 380 Ko, 4,2 Mo: French units, kept on one line. */
export function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`
  const mb = (bytes / 1024 / 1024).toLocaleString('fr-FR', { maximumFractionDigits: 1 })
  return `${mb} Mo`
}

/**
 * Shrinks the photo to maxEdge px and encodes it as WebP, here in the browser:
 * a photo straight from a phone is often past what a Vercel function accepts. Safari can't encode WebP (it silently hands back a PNG), so there it
 * becomes a JPEG, which the API converts. Redrawing also drops the EXIF block,
 * GPS position included. Rejects if the browser can't decode the file.
 */
export async function shrinkPhoto(file, maxEdge = PHOTO_MAX_EDGE) {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()

    const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight))
    const width = Math.max(1, Math.round(img.naturalWidth * scale))
    const height = Math.max(1, Math.round(img.naturalHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, width, height)

    let blob = await toBlob(canvas, 'image/webp', PHOTO_WEBP_QUALITY)
    if (blob?.type !== 'image/webp') {
      // JPEG has no transparency: white behind it, not black.
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, width, height)
      blob = await toBlob(canvas, 'image/jpeg', 0.92)
    }
    if (!blob) throw new Error('Encodage impossible.')

    const base = file.name.replace(/\.[^.]*$/, '') || 'photo'
    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
    return { file: new File([blob], `${base}.${ext}`, { type: blob.type }), width, height }
  } finally {
    URL.revokeObjectURL(url)
  }
}
