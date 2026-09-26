import { VIDEO_BUCKET } from './supabase/config'
import { createSupabasePublicClient } from './supabase/server'

export const videoUrl = (path) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${VIDEO_BUCKET}/${path}`

/**
 * The clips for the video row under the hero, in the order Alexandra set in
 * /admin. The first is the one a phone shows.
 *
 * Never throws: without Supabase the row is simply left out, like the carousel
 * without its photos, rather than failing the whole home page.
 */
export async function getVideos() {
  try {
    const { data, error } = await createSupabasePublicClient()
      .from('videos')
      .select('id, storage_path, poster_path, mime_type, label')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw error

    return (data ?? []).map((v) => ({
      id: v.id,
      src: videoUrl(v.storage_path),
      poster: v.poster_path ? videoUrl(v.poster_path) : null,
      type: v.mime_type,
      label: v.label,
    }))
  } catch (err) {
    console.warn('Videos unavailable, leaving the row out:', err.message)
    return []
  }
}
