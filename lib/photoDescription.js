import { buildAltText } from './supabase/config'

/**
 * A gallery photo's description, edited after upload from /admin (see
 * PATCH /api/photos and app/admin/PhotoDescription.jsx). Shared by both, so
 * the browser and the server agree on what gets saved.
 */

/** What buildAltText adds after the description: « — Pencilsline Tattoo, Montpellier ». */
export const ALT_SUFFIX = buildAltText('')

/**
 * The description as she wrote it: the alt text minus the studio suffix,
 * taken off once (a description that itself ends with it keeps its own).
 */
export function stripAltSuffix(altText) {
  const alt = (altText ?? '').toString()
  return (alt.endsWith(ALT_SUFFIX) ? alt.slice(0, -ALT_SUFFIX.length) : alt).trim()
}

/**
 * The text to show and edit for a photo. The alt text is what the site
 * actually publishes, so it wins; the raw description column is the fallback.
 */
export function descriptionOf(photo) {
  return stripAltSuffix(photo?.alt_text) || (photo?.description ?? '').trim()
}

/**
 * Same rule as the upload: trimmed, and not empty (alt text is mandatory, and
 * the upload sets no maximum). Line breaks, which can only come from a paste,
 * become spaces: alt text is one line.
 * Returns { description } or { error }, the error in French for the admin.
 */
export function validateDescription(raw) {
  if (raw != null && typeof raw !== 'string') {
    return { error: 'Description invalide.' }
  }
  const description = (raw ?? '').replace(/\s*[\r\n]+\s*/g, ' ').trim()
  if (!description) {
    return { error: 'La description est obligatoire (accessibilité et référencement).' }
  }
  return { description }
}
