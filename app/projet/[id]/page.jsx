import { notFound } from 'next/navigation'
import InkStroke from '@/components/InkStroke'
import { PROJECT_ID } from '@/lib/projectId'
import { getProjectPhotos } from '@/lib/projectPhotos'
import { STUDIO_NAME } from '@/lib/supabase/config'

export const metadata = {
  title: `Photos du projet — ${STUDIO_NAME}`,
  // Private: only ever linked from one booking e-mail. robots.txt keeps
  // crawlers out of /projet/ as well.
  robots: { index: false, follow: false },
}

// Read on every visit: the folder fills after the build, and a private page
// has no business sitting in a cache.
export const dynamic = 'force-dynamic'

const sentOn = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Paris',
})

/**
 * The inspiration images of one booking request, one under the other, large.
 * The booking e-mail links here (see lib/projectId.js), so Alexandra sees the
 * client's photos in one tap instead of opening an address per image. Each
 * photo opens on its own when tapped, to zoom or save it.
 */
export default async function ProjectPage({ params }) {
  const { id } = await params
  if (!PROJECT_ID.test(id)) notFound()

  const photos = await getProjectPhotos(id)
  if (!photos.length) notFound()

  const count = photos.length
  const plural = count > 1 ? 's' : ''

  return (
    <main className="projet">
      <p className="projet__kicker">
        <span className="seal-dot" aria-hidden="true" />
        Demande de rendez-vous
      </p>

      <h1 className="projet__title">
        Photos du{' '}
        <span className="projet__word">
          projet
          <span className="projet__underline" aria-hidden="true">
            <InkStroke length={200} thickness={6} seed={431} rough={2.6} />
          </span>
        </span>
      </h1>

      <p className="projet__meta">
        {count} photo{plural} · envoyée{plural} le {sentOn.format(new Date(photos[0].createdAt))}
      </p>

      <ol className="projet__photos">
        {photos.map((photo, i) => (
          <li key={photo.url} className="projet__photo">
            <a href={photo.url} target="_blank" rel="noreferrer">
              {/* From Supabase, already a sized WebP: next/image would only
                  add a second copy. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={`Photo d’inspiration ${i + 1} sur ${count}`}
                loading={i ? 'lazy' : 'eager'}
              />
            </a>
            {count > 1 ? (
              <span className="projet__count" aria-hidden="true">
                {i + 1} / {count}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </main>
  )
}
