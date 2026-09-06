import { BUCKET } from './supabase/config'
import { createSupabasePublicClient } from './supabase/server'

/** The deal lays out 12 zones; more cards than that would never be seen. */
const DECK_LIMIT = 12

/**
 * Photos for the gallery transition, loaded in the root layout so the deal can
 * run from anywhere — the navbar link carries no photos of its own, unlike the
 * carousel's own « Voir toutes les réalisations » button.
 *
 * Never throws. Without a deck the link simply navigates, which is also what
 * happens under prefers-reduced-motion.
 */
export async function getTransitionDeck() {
  try {
    const supabase = createSupabasePublicClient()

    const { data, error } = await supabase
      .from('photos')
      .select('storage_path, alt_text')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(DECK_LIMIT)

    if (error) throw error

    return (data ?? []).map((photo) => ({
      src: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${photo.storage_path}`,
      alt: photo.alt_text,
    }))
  } catch (err) {
    console.error('Gallery transition deck unavailable:', err.message)
    return []
  }
}
