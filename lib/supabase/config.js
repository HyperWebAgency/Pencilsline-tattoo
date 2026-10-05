// Studio identity, appended to every photo's alt text for local SEO.
export const STUDIO_NAME = 'Pencilsline Tattoo'
export const STUDIO_CITY = 'Montpellier'

// Studio details. Single source of truth for the contact page, its map link
// and the TattooParlor schema.
//
// Naming: STUDIO_NAME (Pencilsline Tattoo) is Alexandra's artist brand and
// stays on the portfolio and photo alt text; photo filenames lead with local
// search phrases instead (see buildStoragePath). VENUE_NAME is the shop
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
 *
 * The review count is edited from /admin now (site_settings, see
 * lib/settings.js); this constant is only the fallback if that read fails.
 */
export const STUDIO_RATING = '5,0'
export const STUDIO_REVIEW_COUNT = 289

// Share-sheet tracking params stripped: they are session-specific and would rot.
export const STUDIO_INSTAGRAM = 'https://www.instagram.com/pencilsline_tattoo_2'
export const STUDIO_INSTAGRAM_HANDLE = '@pencilsline_tattoo_2'
export const STUDIO_FACEBOOK = 'https://www.facebook.com/p/Pencilsline-tattoo-100042647623968/'
export const STUDIO_EMAIL = 'pencilsline@gmail.com'
/**
 * The site's domain, served by this Vercel project since 5 October 2026 (it
 * stays registered on Alexandra's IONOS account, which only holds its DNS).
 * The bare pencilsline-tattoo.fr redirects here.
 *
 * For anything a crawler must be able to fetch — og:image, canonical URLs,
 * breadcrumbs — use getSiteUrl() from lib/site-url.js, which gives this in
 * production and each preview's own host elsewhere.
 */
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

/** Fixed hours Mon/Tue/Thu/Fri; Wednesday and Saturday by appointment. */
export const STUDIO_HOURS = [
  { days: 'Lundi, mardi, jeudi et vendredi', time: '10h30 – 18h' },
  { days: 'Mercredi et samedi', time: 'Sur rendez-vous' },
]

/**
 * Only the fixed days. Schema.org has no way to say "by appointment", and
 * listing Wednesday and Saturday as open hours would send people to a door that
 * may be shut. The visible table above carries that nuance instead.
 */
export const STUDIO_HOURS_SCHEMA = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    opens: '10:30',
    closes: '18:00',
  },
]

/** How to arrive. Shown under the address on the contact page. */
export const STUDIO_ACCESS = [
  'Parking gratuit : City Stade, rue des Anémones',
  'Tram ligne 2 : arrêt Clairval',
]

export const BUCKET = 'portfolio'
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10 MB
export const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
/**
 * Every photo is stored as WebP, at most PHOTO_MAX_EDGE px on its long edge.
 * The admin form shrinks it in the browser first: a Vercel function refuses
 * request bodies over 4.5 MB, and a photo straight from a phone is often more,
 * so she may pick one up to MAX_ORIGINAL_BYTES. Safari can't encode WebP, so
 * it sends a JPEG and the API converts that.
 */
export const PHOTO_MAX_EDGE = 2400
export const PHOTO_WEBP_QUALITY = 0.82
export const MAX_ORIGINAL_BYTES = 30 * 1024 * 1024 // 30 MB
/**
 * Two separate limits, because the two places show photos differently. The
 * gallery (/portfolio) holds every photo, up to 50. The home carousel is a
 * selection of those, kept at 12: the count it had on 26 September 2026,
 * which its dots and 3D layout were built around. Enforced by the API
 * routes, shown in /admin.
 */
export const MAX_GALLERY_PHOTOS = 50
export const MAX_HOME_PHOTOS = 12

/**
 * Clips for the video row under the hero (migration 0005). The browser uploads
 * them straight to this bucket: they are far past what a Vercel function
 * accepts as a request body. 50 MB is the Supabase free plan's per-file limit,
 * which the bucket enforces too.
 */
export const VIDEO_BUCKET = 'videos'
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024 // 50 MB
export const VIDEO_MIME = ['video/mp4', 'video/webm', 'video/quicktime']

/**
 * The Google reviews on the home page (migration 0007), edited in /admin, at
 * most MAX_REVIEWS. Each reviewer's profile picture is kept in REVIEW_BUCKET
 * as a WebP square of REVIEW_PHOTO_SIZE px; the page shows it at 44 px.
 */
export const REVIEW_BUCKET = 'reviews'
export const MAX_REVIEWS = 10
export const REVIEW_PHOTO_SIZE = 256

/**
 * Images a client attaches to the contact form (migration 0008): an
 * inspiration, a sketch, the placement. Stored as WebP of at most
 * INSPIRATION_MAX_EDGE px, and linked from the booking email.
 */
export const INSPIRATION_BUCKET = 'inspirations'
export const MAX_INSPIRATIONS = 3
export const INSPIRATION_MAX_EDGE = 2000

/**
 * Full alt text = what the artist wrote + studio and city.
 * Feeds both screen readers and image search.
 */
export function buildAltText(description) {
  return `${description.trim()} — ${STUDIO_NAME}, ${STUDIO_CITY}`
}

/**
 * Local searches the portfolio should turn up in, rotated across uploads so the
 * set is not one phrase repeated. Generic on purpose: one leads the name
 * whatever the photo shows, so nothing style-specific belongs here.
 */
const SEO_KEYWORDS = [
  'tatouage-montpellier',
  'tatoueuse-montpellier',
  'salon-de-tatouage-montpellier',
  'salon-de-tattoo-montpellier',
  'tattoo-montpellier',
  'tatouage-castelnau-le-lez',
]

/**
 * Keyword-first object name — a local search phrase, then the artist's
 * description: salon-de-tatouage-montpellier-dragon-au-pinceau-epaule-k3f9x2.webp.
 * Random UUIDs are useless for image SEO. The random suffix only guarantees
 * uniqueness, since two photos can share a description.
 */
export function buildStoragePath(description, originalName) {
  const ext = (originalName.split('.').pop() || 'jpg').toLowerCase()

  const words = description
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip French accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // Capped at 50 characters, cut back to the last whole word.
  const slug = words.length > 50 ? words.slice(0, 51).replace(/-[^-]*$/, '') : words

  const keyword = SEO_KEYWORDS[Math.floor(Math.random() * SEO_KEYWORDS.length)]
  const suffix = Math.random().toString(36).slice(2, 8)

  return `${[keyword, slug, suffix].filter(Boolean).join('-')}.${ext}`
}
