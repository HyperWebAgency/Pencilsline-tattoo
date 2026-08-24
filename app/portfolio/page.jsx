import Image from 'next/image'
import { createSupabasePublicClient } from '@/lib/supabase/server'
import { BUCKET, STUDIO_CITY, STUDIO_NAME } from '@/lib/supabase/config'

// ISR: static HTML, rebuilt hourly. The upload route also calls
// revalidatePath('/portfolio') so new photos appear within seconds.
export const revalidate = 3600

export const metadata = {
  title: `Portfolio — ${STUDIO_NAME}, ${STUDIO_CITY}`,
  description: `Réalisations de tatouages fineline par ${STUDIO_NAME} à ${STUDIO_CITY}.`,
}

export default async function PortfolioPage() {
  const supabase = createSupabasePublicClient()

  const { data: photos, error } = await supabase
    .from('photos')
    .select('id, storage_path, alt_text, description, width, height')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to load portfolio:', error.message)
  }

  const publicUrl = (path) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`

  return (
    <main className="portfolio">
      <h1>Portfolio</h1>
      <p className="portfolio__intro">
        Tatouages réalisés par {STUDIO_NAME} à {STUDIO_CITY}.
      </p>

      {!photos?.length ? (
        <p className="portfolio__empty">
          Aucune photo pour le moment. Revenez bientôt.
        </p>
      ) : (
        <ul className="portfolio__grid">
          {photos.map((photo, i) => (
            <li key={photo.id} className="portfolio__item">
              <Image
                src={publicUrl(photo.storage_path)}
                alt={photo.alt_text}
                width={photo.width ?? 1200}
                height={photo.height ?? 1600}
                sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
                // First few are above the fold: load eagerly for LCP.
                priority={i < 3}
                className="portfolio__image"
              />
              {photo.description ? (
                <figcaption className="portfolio__caption">
                  {photo.description}
                </figcaption>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
