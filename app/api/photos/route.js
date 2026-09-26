import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from '@/lib/supabase/server'
import {
  ALLOWED_MIME,
  BUCKET,
  MAX_GALLERY_PHOTOS,
  MAX_UPLOAD_BYTES,
  PHOTO_MAX_EDGE,
  PHOTO_WEBP_QUALITY,
  buildAltText,
  buildStoragePath,
} from '@/lib/supabase/config'

/**
 * Every photo is stored as WebP. The admin form already sends one from most
 * browsers; Safari can't encode WebP and sends a JPEG, converted here. rotate()
 * applies any EXIF orientation, and sharp drops the metadata (GPS included).
 */
async function toWebp(file) {
  if (file.type === 'image/webp') return file

  const webp = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({
      width: PHOTO_MAX_EDGE,
      height: PHOTO_MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: Math.round(PHOTO_WEBP_QUALITY * 100) })
    .toBuffer()

  const base = file.name.replace(/\.[^.]*$/, '') || 'photo'
  return new File([webp], `${base}.webp`, { type: 'image/webp' })
}

/**
 * Confirms the caller is the signed-in artist.
 * getUser() validates the JWT with Supabase rather than trusting the cookie.
 */
async function requireArtist() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function POST(request) {
  const user = await requireArtist()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  const description = (formData.get('description') || '').toString().trim()

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 })
  }

  // Alt text is mandatory. No generic fallback — nobody backfills it later.
  if (!description) {
    return NextResponse.json(
      { error: 'La description est obligatoire (accessibilité et référencement).' },
      { status: 400 }
    )
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json(
      { error: `Format non supporté : ${file.type || 'inconnu'}.` },
      { status: 400 }
    )
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: 'Fichier trop volumineux (10 Mo maximum).' },
      { status: 400 }
    )
  }

  const admin = createSupabaseAdminClient()

  const { count } = await admin.from('photos').select('*', { count: 'exact', head: true })
  if ((count ?? 0) >= MAX_GALLERY_PHOTOS) {
    return NextResponse.json(
      {
        error: `La galerie est pleine (${MAX_GALLERY_PHOTOS} photos). Supprimez-en une pour en ajouter une autre.`,
      },
      { status: 400 }
    )
  }

  let photoFile
  try {
    photoFile = await toWebp(file)
  } catch {
    return NextResponse.json(
      { error: 'Impossible de lire cette photo. Enregistrez-la en JPG, puis réessayez.' },
      { status: 400 }
    )
  }

  const storagePath = buildStoragePath(description, photoFile.name)

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, photoFile, { contentType: photoFile.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // New photos go last.
  const { data: lastPhoto } = await admin
    .from('photos')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: photo, error: insertError } = await admin
    .from('photos')
    .insert({
      storage_path: storagePath,
      alt_text: buildAltText(description),
      description,
      display_order: (lastPhoto?.display_order ?? -1) + 1,
      // Gallery only: the home carousel is picked separately, in /admin.
      show_on_home: false,
    })
    .select()
    .single()

  if (insertError) {
    // Don't leave the file orphaned if the row fails to insert.
    await admin.storage.from(BUCKET).remove([storagePath])
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Photos show on / and /portfolio, and the layout's transition deck is on
  // every page, so refresh them all, not just the gallery.
  revalidatePath('/', 'layout')

  return NextResponse.json({ photo }, { status: 201 })
}

export async function DELETE(request) {
  const user = await requireArtist()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'Identifiant manquant.' }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()

  const { data: photo, error: fetchError } = await admin
    .from('photos')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (fetchError || !photo) {
    return NextResponse.json({ error: 'Photo introuvable.' }, { status: 404 })
  }

  // Storage object first, then the row — never orphan files.
  const { error: storageError } = await admin.storage
    .from(BUCKET)
    .remove([photo.storage_path])

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 })
  }

  const { error: deleteError } = await admin.from('photos').delete().eq('id', id)
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  // Photos show on / and /portfolio, and the layout's transition deck is on
  // every page, so refresh them all, not just the gallery.
  revalidatePath('/', 'layout')

  return NextResponse.json({ ok: true })
}
