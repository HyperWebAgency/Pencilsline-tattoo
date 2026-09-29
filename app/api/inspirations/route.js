import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import {
  ALLOWED_MIME,
  INSPIRATION_BUCKET,
  INSPIRATION_MAX_EDGE,
  MAX_UPLOAD_BYTES,
} from '@/lib/supabase/config'

const fail = (error, status = 400) => NextResponse.json({ error }, { status })

/**
 * One image from the contact form, stored so the booking email can link to it
 * (Formspree only takes attachments on its paid plans). Open to anyone, since
 * clients aren't signed in, so it takes one image per request, other sites'
 * pages can't call it, and whatever arrives is decoded and re-encoded as a
 * WebP picture before it is stored: nothing else ever lands in the bucket.
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

  let webp
  try {
    webp = await sharp(Buffer.from(await photo.arrayBuffer()), { limitInputPixels: 50_000_000 })
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

  // Grouped by month, so old requests are easy to clear out later.
  const month = new Date().toISOString().slice(0, 7)
  const path = `${month}/${crypto.randomUUID()}.webp`

  const { error } = await createSupabaseAdminClient()
    .storage.from(INSPIRATION_BUCKET)
    .upload(path, webp, { contentType: 'image/webp', upsert: false })
  if (error) return fail("Enregistrement de l'image impossible.", 500)

  return NextResponse.json(
    {
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${INSPIRATION_BUCKET}/${path}`,
    },
    { status: 201 }
  )
}
