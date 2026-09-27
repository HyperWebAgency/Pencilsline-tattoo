import GoogleRating from './GoogleRating'
import InkStroke from './InkStroke'
import ReviewCarousel from './ReviewCarousel'
import { getReviews } from '@/lib/reviews'
import { STUDIO_GOOGLE_URL } from '@/lib/supabase/config'

/**
 * Google reviews, copied from her profile into /admin (lib/reviews.js) and
 * linked back to it. Deliberately no Review or AggregateRating JSON-LD:
 * Google does not give review stars to a business's own markup of its
 * reviews, and these live on Google anyway — see the note on STUDIO_RATING
 * in config.
 */
export default async function GoogleReviews() {
  const reviews = await getReviews()
  if (reviews.length === 0) return null

  return (
    <section className="reviews" aria-labelledby="reviews-title">
      <div className="reviews__intro">
        <p className="reviews__kicker">
          <span className="seal-dot" aria-hidden="true" />
          Avis Google
        </p>
        <h2 className="reviews__title" id="reviews-title">
          Ce qu&apos;ils en{' '}
          <span className="reviews__word">
            disent
            <span className="reviews__underline" aria-hidden="true">
              <InkStroke length={200} thickness={7} seed={131} rough={2.6} />
            </span>
          </span>
        </h2>
        <GoogleRating />
      </div>

      <ReviewCarousel reviews={reviews} />

      <p className="reviews__foot">
        <a className="brush-link" href={STUDIO_GOOGLE_URL} target="_blank" rel="noreferrer">
          Voir tous les avis sur Google
          <span className="brush-link__dash" aria-hidden="true">
            <InkStroke length={180} thickness={2.8} seed={133} color="#b31b1b" />
          </span>
        </a>
      </p>
    </section>
  )
}
