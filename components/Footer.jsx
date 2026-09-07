import Link from 'next/link'
import GoogleRating from './GoogleRating'
import InkStroke from './InkStroke'
import {
  STUDIO_ADDRESS,
  STUDIO_ARTIST,
  STUDIO_EMAIL,
  STUDIO_FACEBOOK,
  STUDIO_GOOGLE_URL,
  STUDIO_INSTAGRAM,
  STUDIO_INSTAGRAM_HANDLE,
  STUDIO_NAME,
  STUDIO_PHONE,
  STUDIO_PHONE_E164,
  STUDIO_REVIEW_COUNT,
  VENUE_NAME,
} from '@/lib/supabase/config'

const SOCIALS = [
  { href: STUDIO_INSTAGRAM, label: 'Instagram', detail: STUDIO_INSTAGRAM_HANDLE },
  { href: STUDIO_FACEBOOK, label: 'Facebook', detail: 'Pencilsline Tattoo' },
  { href: STUDIO_GOOGLE_URL, label: 'Google', detail: `${STUDIO_REVIEW_COUNT} avis` },
]

const PAGES = [
  { href: '/', label: 'Accueil' },
  { href: '/portfolio', label: 'Réalisations' },
  { href: '/contact', label: 'Contact' },
]

/**
 * Site footer, mounted in the root layout so every page carries the studio's
 * identity, its profiles and the Google rating.
 *
 * The rating is plain text linking to the profile rather than JSON-LD
 * aggregateRating: those reviews live on Google, and marking up someone else's
 * reviews as your own structured data is against Google's own guidelines.
 */
export default function Footer() {
  return (
    <footer className="foot">
      <div className="foot__rule" aria-hidden="true">
        <InkStroke length={1200} thickness={1.7} seed={91} rough={1.2} />
      </div>

      <div className="foot__grid">
        <section className="foot__col" aria-labelledby="foot-studio">
          <h2 className="foot__h" id="foot-studio">
            Le studio
          </h2>
          <address className="foot__address">
            <span className="foot__name">{STUDIO_NAME}</span>
            <span className="foot__sub">
              {STUDIO_ARTIST} — chez {VENUE_NAME}
            </span>
            {STUDIO_ADDRESS.street}
            <br />
            {STUDIO_ADDRESS.postalCode} {STUDIO_ADDRESS.city}
          </address>
          <a className="foot__link" href={`tel:${STUDIO_PHONE_E164}`}>
            {STUDIO_PHONE}
          </a>
          <a className="foot__link" href={`mailto:${STUDIO_EMAIL}`}>
            {STUDIO_EMAIL}
          </a>
        </section>

        <section className="foot__col" aria-labelledby="foot-nav">
          <h2 className="foot__h" id="foot-nav">
            Le site
          </h2>
          <nav className="foot__pages" aria-label="Pages du site">
            {PAGES.map((page, i) => (
              <Link key={page.href} className="brush-link" href={page.href}>
                {page.label}
                <span className="brush-link__dash" aria-hidden="true">
                  <InkStroke length={70} thickness={2.8} seed={95 + i} color="#b31b1b" />
                </span>
              </Link>
            ))}
          </nav>
        </section>

        <section className="foot__col" aria-labelledby="foot-social">
          <h2 className="foot__h" id="foot-social">
            Me suivre
          </h2>

          <GoogleRating />

          <ul className="foot__socials">
            {SOCIALS.map((s, i) => (
              <li key={s.label}>
                <a className="brush-link" href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                  <span className="foot__detail"> — {s.detail}</span>
                  <span className="brush-link__dash" aria-hidden="true">
                    <InkStroke length={120} thickness={2.8} seed={98 + i} color="#b31b1b" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="foot__legal">
        © {new Date().getFullYear()} {STUDIO_NAME} — {STUDIO_ADDRESS.city}
      </p>
    </footer>
  )
}
