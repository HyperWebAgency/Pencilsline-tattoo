import { STUDIO_ADDRESS, VENUE_NAME } from './supabase/config'

/**
 * Who stands behind the site, for the mentions légales, the privacy policy
 * and the CGV. Read off the public SIRENE register on 5 October 2026: SIRET
 * 00035 is the active establishment, registered at the shop's address; 00019,
 * her first, is closed (radié).
 */
export const LEGAL_NAME = 'Alexandra Langlois'
export const LEGAL_STATUS = 'Entrepreneur individuel (EI), au régime de la micro-entreprise'
export const LEGAL_SIREN = '842 330 979'
export const LEGAL_SIRET = '842 330 979 00035'
export const LEGAL_APE = '96.09Z (autres services personnels)'
export const LEGAL_SEAT = `chez ${VENUE_NAME}, ${STUDIO_ADDRESS.street}, ${STUDIO_ADDRESS.postalCode} ${STUDIO_ADDRESS.city}`

/**
 * When the legal pages' text last changed, as ISO: shown under each title in
 * French, and given to the sitemap as their lastModified. Update it with them.
 */
export const LEGAL_UPDATED = '2026-10-05'

/** From Vercel's own privacy notice; it publishes no phone number. */
export const HOST = {
  name: 'Vercel Inc.',
  address: '440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis',
  url: 'https://vercel.com',
}

/**
 * A professional who sells to consumers must name a consumer mediator they
 * have joined (Code de la consommation, L612-1). Set to { name, url } once
 * Alexandra has one; until then the CGV carry the general clause only.
 */
export const LEGAL_MEDIATOR = null

/** The three legal pages, in the order the footer and each page list them. */
export const LEGAL_PAGES = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/confidentialite', label: 'Confidentialité' },
  { href: '/cgv', label: 'CGV' },
]
