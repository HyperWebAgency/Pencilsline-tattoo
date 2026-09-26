import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from '@/lib/supabase/server'
import { VIDEO_BUCKET, VIDEO_MIME } from '@/lib/supabase/config'

async function requireArtist() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Registers a clip the browser has already uploaded to the bucket. The file
 * itself never passes through here: a clip is far past what a Vercel function
 * accepts as a request body, so /admin uploads it straight to Supabase with
 * the artist's session, then posts its paths.
 */
export async function POST(request) {
  const user = await requireArtist()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const storagePath = String(body.storagePath || '')
  const posterPath = body.posterPath ? String(body.posterPath) : null
  const mimeType = String(body.mimeType || '')
  const label = String(body.label || '').trim()

  // Only paths the upload form itself produces.
  if (!/^clips\/[\w-]+\.(mp4|webm|mov)$/.test(storagePath)) {
    return NextResponse.json({ error: 'Fichier vidéo invalide.' }, { status: 400 })
  }
  if (posterPath && !/^posters\/[\w-]+\.jpg$/.test(posterPath)) {
    return NextResponse.json({ error: 'Image de couverture invalide.' }, { status: 400 })
  }
  if (!VIDEO_MIME.includes(mimeType)) {
    return NextResponse.json({ error: `Format non supporté : ${mimeType || 'inconnu'}.` }, { status: 400 })
  }
  if (!label) {
    return NextResponse.json(
      { error: 'La description est obligatoire (accessibilité).' },
      { status: 400 }
    )
  }

  const admin = createSupabaseAdminClient()

  // New clips go last.
  const { data: last } = await admin
    .from('videos')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: video, error } = await admin
    .from('videos')
    .insert({
      storage_path: storagePath,
      poster_path: posterPath,
      mime_type: mimeType,
      label: label.slice(0, 200),
      display_order: (last?.display_order ?? -1) + 1,
    })
    .select()
    .single()

  if (error) {
    // The upload already happened: don't leave its files orphaned.
    await admin.storage.from(VIDEO_BUCKET).remove([storagePath, posterPath].filter(Boolean))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/')

  return NextResponse.json({ video }, { status: 201 })
}

export async function DELETE(request) {
  const user = await requireArtist()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const { id } = await request.json().catch(() => ({}))
  if (!id) {
    return NextResponse.json({ error: 'Identifiant manquant.' }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()

  const { data: video, error: fetchError } = await admin
    .from('videos')
    .select('storage_path, poster_path')
    .eq('id', id)
    .single()

  if (fetchError || !video) {
    return NextResponse.json({ error: 'Vidéo introuvable.' }, { status: 404 })
  }

  // Files first, then the row — never orphan files.
  const { error: storageError } = await admin.storage
    .from(VIDEO_BUCKET)
    .remove([video.storage_path, video.poster_path].filter(Boolean))

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 })
  }

  const { error: deleteError } = await admin.from('videos').delete().eq('id', id)
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  revalidatePath('/')

  return NextResponse.json({ ok: true })
}
