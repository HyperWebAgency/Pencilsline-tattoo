// Studio identity, appended to every photo's alt text and filename for local SEO.
export const STUDIO_NAME = 'Pencilsline Tattoo'
export const STUDIO_CITY = 'Montpellier'

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
