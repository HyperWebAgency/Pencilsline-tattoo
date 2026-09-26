import { getReviewCount } from '@/lib/settings'
import { STUDIO_GOOGLE_URL, STUDIO_RATING } from '@/lib/supabase/config'

/** Five filled seal-red stars. Decorative — the score beside them carries it. */
function Stars() {
  return (
    <span className="grate__stars" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" focusable="false">
          <path
            d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.5l1.1-6.5L2.6 9.4l6.5-.9z"
            fill="currentColor"
          />
        </svg>
      ))}
    </span>
  )
}

/**
 * The Google Business Profile rating, linked to the profile it came from.
 *
 * Shared by the hero and the footer so the two can never disagree. The review
 * count is set by Alexandra from /admin; the rating lives in config — see the
 * note there on why neither is emitted as JSON-LD aggregateRating.
 */
export default async function GoogleRating({ variant = '' }) {
  const reviewCount = await getReviewCount()

  return (
    <a
      className={`grate${variant ? ` grate--${variant}` : ''}`}
      href={STUDIO_GOOGLE_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={`${STUDIO_RATING} sur 5 — ${reviewCount} avis Google, voir le profil`}
    >
      <Stars />
      <span className="grate__score">{STUDIO_RATING}</span>
      <span className="grate__count">{reviewCount} avis Google</span>
    </a>
  )
}
