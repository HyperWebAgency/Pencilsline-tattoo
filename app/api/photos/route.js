import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from '@/lib/supabase/server'
import {
  ALLOWED_MIME,
  BUCKET,
  MAX_UPLOAD_BYTES,
  buildAltText,
  buildStoragePath,
} from '@/lib/supabase/config'

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
  const storagePath = buildStoragePath(description, file.name)

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false })

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
    })
    .select()
    .single()

  if (insertError) {
    // Don't leave the file orphaned if the row fails to insert.
    await admin.storage.from(BUCKET).remove([storagePath])
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  revalidatePath('/portfolio')

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

  revalidatePath('/portfolio')

  return NextResponse.json({ ok: true })
}
