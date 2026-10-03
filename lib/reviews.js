import { cache } from 'react'
import { REVIEW_BUCKET } from './supabase/config'
import { createSupabasePublicClient } from './supabase/server'

/**
 * Google reviews shown on the home page, as Alexandra keeps them in /admin
 * (the reviews table, migration 0007), copied from her Google Business Profile
 * (STUDIO_GOOGLE_URL). They are presented as Google reviews, so they must
 * match Google exactly: the name as it is displayed and the text word for
 * word, typos and capitals included. Always five stars.
 *
 * photo: the reviewer's Google profile picture, in the reviews bucket.
 * text: line breaks kept as \n (a blank line as \n\n).
 *
 * Never throws: without reviews the section is simply left out.
 *
 * cache() makes the hero's faces and the reviews section share one query per
 * render.
 */
export const getReviews = cache(async () => {
  try {
    const { data, error } = await createSupabasePublicClient()
      .from('reviews')
      .select('id, name, text, photo_path, letter_avatar')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw error

    return data.map((review) => ({
      id: review.id,
      name: review.name,
      text: review.text,
      photo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${REVIEW_BUCKET}/${review.photo_path}`,
      rating: 5,
      // Google's plain disc with an initial, not a photo (migration 0009).
      letterAvatar: review.letter_avatar,
    }))
  } catch (err) {
    console.warn('Reviews unavailable, leaving the section out:', err.message)
    return []
  }
})
