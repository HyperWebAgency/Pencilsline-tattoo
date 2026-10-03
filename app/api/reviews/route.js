import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from '@/lib/supabase/server'
import {
  ALLOWED_MIME,
  MAX_REVIEWS,
  MAX_UPLOAD_BYTES,
  REVIEW_BUCKET,
  REVIEW_PHOTO_SIZE,
} from '@/lib/supabase/config'

/** getUser() validates the JWT with Supabase rather than trusting the cookie. */
async function requireArtist() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

const fail = (error, status = 400) => NextResponse.json({ error }, { status })

/** Name and text as she typed them, ends trimmed, Windows line breaks unified. */
function readFields(form) {
  const name = (form.get('name') || '').toString().trim()
  const text = (form.get('text') || '').toString().replace(/\r\n?/g, '\n').trim()

  if (!name || name.length > 80) return { error: 'Le nom est obligatoire (80 caractères maximum).' }
  if (!text || text.length > 4000) return { error: "L'avis est obligatoire (4000 caractères maximum)." }
  return { name, text }
}

/** A photo file from the form, or an error to show her. */
function readPhoto(form) {
  const photo = form.get('photo')
  if (!photo || typeof photo === 'string' || photo.size === 0) return {}
  if (!ALLOWED_MIME.includes(photo.type)) return { error: 'Format de photo non supporté.' }
  if (photo.size > MAX_UPLOAD_BYTES) return { error: 'Photo trop lourde.' }
  return { photo }
}

/**
 * Below this image entropy a picture is one of Google's letter avatars (a
 * plain disc with an initial), not a photo: those measured about 4.3, photos
 * 7.1 to 7.3. The hero's row of faces leaves them out (migration 0009).
 */
const LETTER_AVATAR_ENTROPY = 6

/**
 * The profile picture as a centred WebP square, stored under a fresh name.
 * rotate() applies any EXIF orientation; sharp drops the metadata. Returns the
 * storage path and whether it is a letter avatar, or an error.
 */
async function storePhoto(admin, photo) {
  let webp
  try {
    webp = await sharp(Buffer.from(await photo.arrayBuffer()))
      .rotate()
      .resize(REVIEW_PHOTO_SIZE, REVIEW_PHOTO_SIZE, { fit: 'cover' })
      .webp({ quality: 82 })
      .toBuffer()
  } catch {
    return { error: 'Impossible de lire cette photo. Enregistrez-la en JPG, puis réessayez.' }
  }

  const { entropy } = await sharp(webp).stats()
  const path = `${crypto.randomUUID()}.webp`
  const { error } = await admin.storage
    .from(REVIEW_BUCKET)
    .upload(path, webp, { contentType: 'image/webp', upsert: false })
  return error
    ? { error: error.message, status: 500 }
    : { path, letterAvatar: entropy < LETTER_AVATAR_ENTROPY }
}

/** Adds a review at the end of the row. */
export async function POST(request) {
  if (!(await requireArtist())) return fail('Non autorisé.', 401)

  const form = await request.formData().catch(() => null)
  if (!form) return fail('Requête invalide.')

  const fields = readFields(form)
  if (fields.error) return fail(fields.error)
  const { photo, error: photoError } = readPhoto(form)
  if (photoError) return fail(photoError)
  if (!photo) return fail('La photo est obligatoire.')

  const admin = createSupabaseAdminClient()

  const { count } = await admin.from('reviews').select('*', { count: 'exact', head: true })
  if ((count ?? 0) >= MAX_REVIEWS) {
    return fail(`Il y a déjà ${MAX_REVIEWS} avis. Supprimez-en un pour en ajouter un autre.`)
  }

  const stored = await storePhoto(admin, photo)
  if (stored.error) return fail(stored.error, stored.status)

  const { data: last } = await admin
    .from('reviews')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error: insertError } = await admin.from('reviews').insert({
    name: fields.name,
    text: fields.text,
    photo_path: stored.path,
    letter_avatar: stored.letterAvatar,
    display_order: (last?.display_order ?? -1) + 1,
  })

  if (insertError) {
    await admin.storage.from(REVIEW_BUCKET).remove([stored.path])
    return fail(insertError.message, 500)
  }

  revalidatePath('/')
  return NextResponse.json({ ok: true }, { status: 201 })
}

/** Changes a review's name and text, and its photo when a new one is sent. */
export async function PATCH(request) {
  if (!(await requireArtist())) return fail('Non autorisé.', 401)

  const form = await request.formData().catch(() => null)
  const id = form?.get('id')?.toString()
  if (!id) return fail('Identifiant manquant.')

  const fields = readFields(form)
  if (fields.error) return fail(fields.error)
  const { photo, error: photoError } = readPhoto(form)
  if (photoError) return fail(photoError)

  const admin = createSupabaseAdminClient()

  const { data: review } = await admin
    .from('reviews')
    .select('photo_path')
    .eq('id', id)
    .maybeSingle()
  if (!review) return fail('Avis introuvable.', 404)

  const changes = { name: fields.name, text: fields.text }
  if (photo) {
    const stored = await storePhoto(admin, photo)
    if (stored.error) return fail(stored.error, stored.status)
    changes.photo_path = stored.path
    changes.letter_avatar = stored.letterAvatar
  }

  const { error: updateError } = await admin.from('reviews').update(changes).eq('id', id)
  if (updateError) {
    if (changes.photo_path) await admin.storage.from(REVIEW_BUCKET).remove([changes.photo_path])
    return fail(updateError.message, 500)
  }

  // The old picture only goes once nothing points at it any more.
  if (changes.photo_path) await admin.storage.from(REVIEW_BUCKET).remove([review.photo_path])

  revalidatePath('/')
  return NextResponse.json({ ok: true })
}

export async function DELETE(request) {
  if (!(await requireArtist())) return fail('Non autorisé.', 401)

  const { id } = await request.json().catch(() => ({}))
  if (!id) return fail('Identifiant manquant.')

  const admin = createSupabaseAdminClient()

  const { data: review } = await admin
    .from('reviews')
    .select('photo_path')
    .eq('id', id)
    .maybeSingle()
  if (!review) return fail('Avis introuvable.', 404)

  // Row first: a leftover file is invisible, a row without its picture is not.
  const { error } = await admin.from('reviews').delete().eq('id', id)
  if (error) return fail(error.message, 500)
  await admin.storage.from(REVIEW_BUCKET).remove([review.photo_path])

  revalidatePath('/')
  return NextResponse.json({ ok: true })
}
