import { LEGAL_PAGES, LEGAL_UPDATED } from '@/lib/legal'
import { getSiteUrl } from '@/lib/site-url'
import { BUCKET } from '@/lib/supabase/config'
import { createSupabasePublicClient } from '@/lib/supabase/server'

// Rebuilt hourly, like the pages whose photos it lists.
export const revalidate = 3600

const photoUrl = (path) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`

/** Every portfolio photo, in gallery order. Never throws. */
async function getPhotos() {
  try {
    const { data, error } = await createSupabasePublicClient()
      .from('photos')
      .select('storage_path, show_on_home, created_at')
      .order('display_order', { ascending: true })
    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error('Sitemap photos unavailable:', err.message)
    return []
  }
}

/**
 * /sitemap.xml. Each page with photos lists them, so image search finds the
 * tattoos under their keyword-first filenames (see buildStoragePath). A
 * lastModified only where it is true: the newest photo for the pages that
 * show them, the legal pages' own date. /merci (noindex) and /admin are left
 * out.
 */
export default async function sitemap() {
  const site = getSiteUrl()
  const photos = await getPhotos()

  const newest = photos.reduce(
    (latest, p) => (p.created_at > latest ? p.created_at : latest),
    ''
  )
  const photosChanged = newest ? new Date(newest) : undefined

  return [
    {
      url: site,
      lastModified: photosChanged,
      changeFrequency: 'weekly',
      priority: 1,
      images: photos.filter((p) => p.show_on_home).map((p) => photoUrl(p.storage_path)),
    },
    {
      url: `${site}/portfolio`,
      lastModified: photosChanged,
      changeFrequency: 'weekly',
      priority: 0.9,
      images: photos.map((p) => photoUrl(p.storage_path)),
    },
    {
      url: `${site}/contact`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...LEGAL_PAGES.map((page) => ({
      url: `${site}${page.href}`,
      lastModified: LEGAL_UPDATED,
      changeFrequency: 'yearly',
      priority: 0.2,
    })),
  ]
}
