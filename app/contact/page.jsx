import Link from 'next/link'
import BookingForm from '@/components/BookingForm'
import ContactIntro from '@/components/ContactIntro'
import InkStroke from '@/components/InkStroke'
import { getSiteUrl } from '@/lib/site-url'
import {
  BOOKING_WARNING,
  STUDIO_ADDRESS,
  STUDIO_ARTIST,
  STUDIO_CITY,
  STUDIO_EMAIL,
  STUDIO_FACEBOOK,
  STUDIO_GEO,
  STUDIO_GOOGLE_URL,
  STUDIO_HOURS,
  STUDIO_HOURS_SCHEMA,
  STUDIO_INSTAGRAM,
  STUDIO_INSTAGRAM_HANDLE,
  STUDIO_MAPS_URL,
  STUDIO_NAME,
  STUDIO_PHONE,
  STUDIO_PHONE_E164,
  STUDIO_REVIEW_COUNT,
  VENUE_NAME,
} from '@/lib/supabase/config'

export const metadata = {
  title: `Contact & rendez-vous — ${STUDIO_NAME}, ${STUDIO_ADDRESS.city}`,
  description: `Prendre rendez-vous avec ${STUDIO_ARTIST} — tatouage graphique, brush et fineline à ${STUDIO_ADDRESS.city}, près de ${STUDIO_CITY}. Décrivez votre projet, je vous réponds par e-mail.`,
}

const fullAddress = `${STUDIO_ADDRESS.street}, ${STUDIO_ADDRESS.postalCode} ${STUDIO_ADDRESS.city}`

// The business at this address is the shop, Lemon Tattoo; Alexandra works there
// under her own name. Modelling it that way keeps the local listing honest.
const schema = {
  '@context': 'https://schema.org',
  '@type': 'TattooParlor',
  name: VENUE_NAME,
  employee: {
    '@type': 'Person',
    name: `${STUDIO_ARTIST} — ${STUDIO_NAME}`,
    jobTitle: 'Tatoueuse',
    sameAs: [STUDIO_INSTAGRAM, STUDIO_FACEBOOK, STUDIO_GOOGLE_URL],
  },
  description: `Tatouage graphique, brush, abstrait et fineline par ${STUDIO_ARTIST} au studio ${VENUE_NAME}, ${STUDIO_ADDRESS.city}, près de ${STUDIO_CITY}.`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: STUDIO_ADDRESS.street,
    postalCode: STUDIO_ADDRESS.postalCode,
    addressLocality: STUDIO_ADDRESS.city,
    addressCountry: STUDIO_ADDRESS.country,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: STUDIO_GEO.lat,
    longitude: STUDIO_GEO.lng,
  },
  hasMap: STUDIO_MAPS_URL,
  telephone: STUDIO_PHONE_E164,
  email: STUDIO_EMAIL,
  url: STUDIO_MAPS_URL,
  sameAs: [STUDIO_INSTAGRAM, STUDIO_FACEBOOK, STUDIO_GOOGLE_URL, STUDIO_MAPS_URL],
  openingHoursSpecification: STUDIO_HOURS_SCHEMA,
  areaServed: [STUDIO_ADDRESS.city, STUDIO_CITY],
}

// Mirrors the visible breadcrumb so Google can show the trail in results.
// Built from the live origin, not the intended domain: pointing a breadcrumb at
// a host that serves a different site is worse than having no breadcrumb.
function buildBreadcrumbSchema(site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: site,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Contact',
        item: `${site}/contact`,
      },
    ],
  }
}

export default function ContactPage() {
  const breadcrumbSchema = buildBreadcrumbSchema(getSiteUrl())

  return (
    <>
      <ContactIntro artist={STUDIO_ARTIST} studio="Pencilsline" tail="Tattoo" />

      <main className="contact">
        <header className="contact__head">
          <nav className="breadcrumb" aria-label="Fil d'Ariane">
            <ol className="breadcrumb__list">
              <li className="breadcrumb__item">
                <Link className="breadcrumb__link" href="/">
                  Accueil
                </Link>
              </li>
              <li className="breadcrumb__item" aria-current="page">
                Contact
              </li>
            </ol>
          </nav>
          <h1 className="contact__title">
            Parlons de{' '}
            <span className="contact__word">
              votre projet
              <span className="contact__underline" aria-hidden="true">
                <InkStroke length={260} thickness={7} seed={47} rough={2.6} />
              </span>
            </span>
          </h1>
        </header>

        <div className="contact__grid">
          <section className="contact__form" aria-labelledby="form-title">
            <h2 className="visually-hidden" id="form-title">
              Demande de rendez-vous
            </h2>

            <BookingForm />

            <p className="notice" role="note">
              <span className="notice__label">Important</span>
              {BOOKING_WARNING}
            </p>
          </section>

          <aside className="contact__aside">
            <section aria-labelledby="studio-title">
              <h2 className="contact__h2" id="studio-title">
                Le studio
              </h2>
              <address className="contact__address">
                <span className="contact__artist">{VENUE_NAME}</span>
                <span className="contact__venue">avec {STUDIO_ARTIST}</span>
                {STUDIO_ADDRESS.street}
                <br />
                {STUDIO_ADDRESS.postalCode} {STUDIO_ADDRESS.city}
                <br />
                <a className="contact__link contact__phone" href={`tel:${STUDIO_PHONE_E164}`}>
                  {STUDIO_PHONE}
                </a>
              </address>
              <a
                className="brush-link contact__maplink"
                href={STUDIO_MAPS_URL}
                target="_blank"
                rel="noreferrer"
              >
                Itinéraire
                <span className="brush-link__dash" aria-hidden="true">
                  <InkStroke length={130} thickness={2.8} seed={48} color="#b31b1b" />
                </span>
              </a>

              <div className="contact__map">
                <iframe
                  title={`Carte — ${VENUE_NAME}, ${fullAddress}`}
                  src={`https://maps.google.com/maps?q=${STUDIO_GEO.lat},${STUDIO_GEO.lng}&z=17&hl=fr&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </section>

            <section aria-labelledby="hours-title">
              <h2 className="contact__h2" id="hours-title">
                Horaires
              </h2>
              <dl className="contact__hours">
                {STUDIO_HOURS.map((h) => (
                  <div key={h.days}>
                    <dt>{h.days}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section aria-labelledby="direct-title">
              <h2 className="contact__h2" id="direct-title">
                Direct
              </h2>
              <ul className="contact__list">
                <li>
                  <a className="contact__link" href={`tel:${STUDIO_PHONE_E164}`}>
                    {STUDIO_PHONE}
                  </a>
                </li>
                <li>
                  <a className="contact__link" href={`mailto:${STUDIO_EMAIL}`}>
                    {STUDIO_EMAIL}
                  </a>
                </li>
                <li>
                  <a className="contact__link" href={STUDIO_INSTAGRAM} target="_blank" rel="noreferrer">
                    Instagram — {STUDIO_INSTAGRAM_HANDLE}
                  </a>
                </li>
                <li>
                  <a className="contact__link" href={STUDIO_FACEBOOK} target="_blank" rel="noreferrer">
                    Facebook — Pencilsline Tattoo
                  </a>
                </li>
                <li>
                  <a className="contact__link" href={STUDIO_GOOGLE_URL} target="_blank" rel="noreferrer">
                    Google — {STUDIO_REVIEW_COUNT} avis
                  </a>
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </main>

      <script
        type="application/ld+json"
        // Static object we control — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}
