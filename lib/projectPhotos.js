import { INSPIRATION_BUCKET, MAX_INSPIRATIONS } from './supabase/config'
import { createSupabaseAdminClient } from './supabase/server'

/**
 * The images of one booking request (see lib/projectId.js), oldest first, as
 * { url, createdAt }. Listed with the secret key: the bucket has no select
 * policy, so nobody else can list it. Server only. Never throws; an empty list
 * means no such request.
 */
export async function getProjectPhotos(id) {
  try {
    const { data, error } = await createSupabaseAdminClient()
      .storage.from(INSPIRATION_BUCKET)
      // A little past the form's limit, should a request ever hold more.
      .list(id, { limit: MAX_INSPIRATIONS + 7, sortBy: { column: 'created_at', order: 'asc' } })
    if (error) throw error

    return (data ?? [])
      .filter((file) => file.name.endsWith('.webp'))
      .map((file) => ({
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${INSPIRATION_BUCKET}/${id}/${file.name}`,
        createdAt: file.created_at,
      }))
  } catch (err) {
    console.error('Project photos unavailable:', err.message)
    return []
  }
}
