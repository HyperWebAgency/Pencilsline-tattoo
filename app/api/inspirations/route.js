import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { PROJECT_ID } from '@/lib/projectId'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import {
  ALLOWED_MIME,
  INSPIRATION_BUCKET,
  INSPIRATION_MAX_EDGE,
  MAX_INSPIRATIONS,
  MAX_UPLOAD_BYTES,
} from '@/lib/supabase/config'

const fail = (error, status = 400) => NextResponse.json({ error }, { status })

const ascii = (bytes, from, to) => String.fromCharCode(...bytes.subarray(from, to))

/**
 * Whether the file really is a JPEG, PNG, WebP or AVIF, from its first bytes.
 * The declared type is the sender's word, and sharp goes by content: without
 * this, an SVG renamed .png would reach its SVG renderer, the part of sharp
 * most often found vulnerable.
 */
function isAllowedImage(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true // JPEG
  if (ascii(bytes, 0, 8) === '\x89PNG\r\n\x1a\n') return true // PNG
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP') return true // WebP
  // AVIF: an ISO box "ftyp" whose brand is AVIF.
  return ascii(bytes, 4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(bytes, 8, 12))
}

/**
 * One image from the contact form, stored so the booking email can link to it
 * (Formspree only takes attachments on its paid plans). Open to anyone, since
 * clients aren't signed in, so it takes one image per request, other sites'
 * pages can't call it, and whatever arrives is decoded and re-encoded as a
 * WebP picture before it is stored: nothing else ever lands in the bucket.
 * Only real JPEG, PNG, WebP or AVIF files are decoded at all, and a request's
 * folder takes at most MAX_INSPIRATIONS images.
 * EXIF, GPS included, is dropped. Names are random and the bucket can't be
 * listed, so an image is only reachable from the email.
 */
export async function POST(request) {
  // Browsers say where a request comes from; another site's page is refused.
  const site = request.headers.get('sec-fetch-site')
  if (site && site !== 'same-origin') return fail('Non autorisé.', 403)

  const form = await request.formData().catch(() => null)
  const photo = form?.get('photo')
  if (!photo || typeof photo === 'string') return fail('Aucune image reçue.')
  if (!ALLOWED_MIME.includes(photo.type)) {
    return fail('Format non supporté. Utilisez une image JPG, PNG ou WebP.')
  }
  if (photo.size > MAX_UPLOAD_BYTES) return fail('Image trop lourde.')

  // The request's folder, so its page (/projet/<id>) can show them together.
  const project = String(form.get('project') ?? '')
  if (!PROJECT_ID.test(project)) return fail('Demande invalide.')

  const bytes = new Uint8Array(await photo.arrayBuffer())
  if (!isAllowedImage(bytes)) {
    return fail('Format non supporté. Utilisez une image JPG, PNG ou WebP.')
  }

  const admin = createSupabaseAdminClient()
  const bucket = admin.storage.from(INSPIRATION_BUCKET)

  // A request holds as many images as the form allows, no more.
  const { data: already } = await bucket.list(project, { limit: MAX_INSPIRATIONS + 1 })
  if ((already?.length ?? 0) >= MAX_INSPIRATIONS) {
    return fail(`${MAX_INSPIRATIONS} images maximum par demande.`)
  }

  let webp
  try {
    webp = await sharp(Buffer.from(bytes), { limitInputPixels: 50_000_000 })
      .rotate()
      .resize({
        width: INSPIRATION_MAX_EDGE,
        height: INSPIRATION_MAX_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer()
  } catch {
    return fail("Cette image n'a pas pu être lue. Essayez avec une autre.")
  }

  // A project id starts with the month, so old requests are easy to clear out.
  const path = `${project}/${crypto.randomUUID()}.webp`

  const { error } = await bucket.upload(path, webp, { contentType: 'image/webp', upsert: false })
  if (error) return fail("Enregistrement de l'image impossible.", 500)

  return NextResponse.json(
    {
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${INSPIRATION_BUCKET}/${path}`,
    },
    { status: 201 }
  )
}
