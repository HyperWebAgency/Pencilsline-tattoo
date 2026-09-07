// Studio identity, appended to every photo's alt text and filename for local SEO.
export const STUDIO_NAME = 'Pencilsline Tattoo'
export const STUDIO_CITY = 'Montpellier'

// Studio details. Single source of truth for the contact page, its map link
// and the TattooParlor schema.
//
// Naming: STUDIO_NAME (Pencilsline Tattoo) is Alexandra's artist brand and
// stays on the portfolio, photo alt text and filenames. VENUE_NAME is the shop
// she works at — used only on the contact page and in its local-SEO schema.
export const VENUE_NAME = 'Lemon Tattoo'
export const STUDIO_ARTIST = 'Alexandra'
export const STUDIO_ADDRESS = {
  street: "575 Av. de l'Europe",
  postalCode: '34170',
  city: 'Castelnau-le-Lez',
  country: 'FR',
}
export const STUDIO_PHONE = '06 48 37 84 37'
// E.164 for tel: links and structured data.
export const STUDIO_PHONE_E164 = '+33648378437'
export const STUDIO_MAPS_URL = 'https://maps.app.goo.gl/1q1RE59oULRfWe4XA'
/** From the Google Business Profile, used to centre the map embed and for geo schema. */
export const STUDIO_GEO = { lat: 43.6302782, lng: 3.9025087 }

/**
 * Alexandra's own Google Business Profile — distinct from the Lemon Tattoo
 * listing at the same address. Written as a ?cid= link rather than the
 * share.google short link she sent: the CID is the profile's permanent
 * identifier, while share links are opaque and can be regenerated.
 *
 * Profile: "Pencilsline Tattoo Montpellier – Alexandra …", category Tatoueur.
 */
export const STUDIO_GOOGLE_URL = 'https://maps.google.com/?cid=6538766911123973705'

/**
 * Read off the profile on 7 September 2026. Shown to visitors, deliberately NOT
 * emitted as aggregateRating in our JSON-LD: Google's review-snippet policy
 * disallows marking up ratings collected on another site as your own. Refresh
 * these by hand — an unattended number that drifts is worse than none.
 */
export const STUDIO_RATING = '5,0'
export const STUDIO_REVIEW_COUNT = 289

// Share-sheet tracking params stripped: they are session-specific and would rot.
export const STUDIO_INSTAGRAM = 'https://www.instagram.com/pencilsline_tattoo_2'
export const STUDIO_INSTAGRAM_HANDLE = '@pencilsline_tattoo_2'
export const STUDIO_FACEBOOK = 'https://www.facebook.com/p/Pencilsline-tattoo-100042647623968/'
export const STUDIO_EMAIL = 'pencilsline@gmail.com'
export const STUDIO_SITE = 'https://www.pencilsline-tattoo.fr'

/**
 * What a booking request should contain, from Alexandra's own "Comment réserver
 * ton tattoo ?" post. The more precise the request, the faster she can quote.
 */
export const BOOKING_CHECKLIST = [
  'Ton projet, décrit avec tes mots',
  'La zone à tatouer',
  'La taille approximative, en centimètres',
  'Tes inspirations, ou des références visuelles',
]

/**
 * Medical contraindication, stated plainly on her post. Non-negotiable, so it
 * belongs on the page rather than buried in a DM exchange.
 */
export const BOOKING_WARNING =
  "En cas de grossesse, d'allaitement ou de pacemaker, je ne tatoue pas."

/** Mon–Fri 10:30–18:00; closed weekends. */
export const STUDIO_HOURS = [
  { days: 'Lundi – Vendredi', time: '10h30 – 18h00' },
  { days: 'Samedi – Dimanche', time: 'Fermé' },
]

export const STUDIO_HOURS_SCHEMA = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '10:30',
    closes: '18:00',
  },
]

export const BUCKET = 'portfolio'
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10 MB
export const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

/**
 * Full alt text = what the artist wrote + studio and city.
 * Feeds both screen readers and image search.
 */
export function buildAltText(description) {
  return `${description.trim()} — ${STUDIO_NAME}, ${STUDIO_CITY}`
}

/**
 * Descriptive, keyword-rich object name. Random UUIDs are useless for image SEO,
 * so the artist's description leads, with a short random suffix only to guarantee
 * uniqueness.
 */
export function buildStoragePath(description, originalName) {
  const ext = (originalName.split('.').pop() || 'jpg').toLowerCase()

  const slug = description
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip French accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

  const studioSlug = `${STUDIO_NAME}-${STUDIO_CITY}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')

  const suffix = Math.random().toString(36).slice(2, 8)

  return `${slug || 'tatouage'}-${studioSlug}-${suffix}.${ext}`
}
