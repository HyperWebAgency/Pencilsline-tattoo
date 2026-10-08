/**
 * A booking request's inspiration images share one folder in the inspirations
 * bucket, named by an id the contact form makes up as it sends them:
 * 2026-10-k3f9x2ab7qzt. The booking e-mail then carries a single link,
 * /projet/<id>, to a page showing them all (app/projet/[id]).
 *
 * The month leads, so old requests are easy to clear out by prefix. The twelve
 * random characters are what keep the page private: nothing lists the folders,
 * and the id is only ever written in that one e-mail.
 *
 * Shared by the form (client), /api/inspirations and the page (server).
 */
export const PROJECT_ID = /^\d{4}-\d{2}-[a-z0-9]{12}$/

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'

export function makeProjectId(now = new Date()) {
  const month = now.toISOString().slice(0, 7)
  const random = crypto.getRandomValues(new Uint8Array(12))
  return `${month}-${Array.from(random, (byte) => ALPHABET[byte % 36]).join('')}`
}
