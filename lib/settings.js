import { cache } from 'react'
import { STUDIO_REVIEW_COUNT } from './supabase/config'
import { createSupabasePublicClient } from './supabase/server'

/**
 * The Google review count, as Alexandra last set it from /admin (the
 * site_settings table, migration 0004).
 *
 * cache() makes the hero, the footer and /contact share one query per render.
 * Never throws: if the table or Supabase is unavailable, the page still builds
 * with the number from config rather than failing.
 */
export const getReviewCount = cache(async () => {
  try {
    const { data, error } = await createSupabasePublicClient()
      .from('site_settings')
      .select('google_review_count')
      .eq('id', true)
      .single()

    if (error) throw error
    return data.google_review_count
  } catch (err) {
    // A warning, not an error: the page is fine, it just shows the config
    // number. console.error would also raise the dev overlay over the page.
    console.warn('Review count unavailable, using the one in config:', err.message)
    return STUDIO_REVIEW_COUNT
  }
})
