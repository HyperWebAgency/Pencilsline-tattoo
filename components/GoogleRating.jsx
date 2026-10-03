import { getReviews } from '@/lib/reviews'
import { getReviewCount } from '@/lib/settings'
import { STUDIO_GOOGLE_URL, STUDIO_RATING } from '@/lib/supabase/config'

/** How many reviewers' pictures `faces` shows: a few, large enough to see. */
const MAX_FACES = 3

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
 *
 * faces: lead with a few of the reviewers' Google profile pictures, the ones
 * whose reviews she keeps in /admin, in her order and only real photos (not
 * Google's letter avatars), stacked like coins, with the stars and score over
 * the review count beside them. Decorative: the link's label already says
 * what it is.
 */
export default async function GoogleRating({ variant = '', faces = false }) {
  const [reviewCount, reviews] = await Promise.all([
    getReviewCount(),
    faces ? getReviews() : [],
  ])
  const people = reviews.filter((r) => r.photo && !r.letterAvatar).slice(0, MAX_FACES)

  return (
    <a
      className={`grate${variant ? ` grate--${variant}` : ''}${people.length ? ' grate--faces' : ''}`}
      href={STUDIO_GOOGLE_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={`${STUDIO_RATING} sur 5 — ${reviewCount} avis Google, voir le profil`}
    >
      {people.length > 0 && (
        <span className="grate__faces" aria-hidden="true">
          {people.map((r) => (
            <img key={r.id} src={r.photo} alt="" width={44} height={44} decoding="async" />
          ))}
        </span>
      )}
      {/* Two lines beside the faces; without them these boxes vanish
          (display: contents) and it all runs on one line, as before. */}
      <span className="grate__body">
        <span className="grate__line">
          <Stars />
          <span className="grate__score">{STUDIO_RATING}</span>
        </span>
        <span className="grate__count">{reviewCount} avis Google</span>
      </span>
    </a>
  )
}
