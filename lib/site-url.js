import { STUDIO_SITE } from './supabase/config'

/**
 * The origin this deployment is actually served from.
 *
 * Deliberately NOT STUDIO_SITE. That is the domain Alexandra intends to use,
 * but it still serves her previous site (a Duda page, unrelated to this build).
 * Using it here pointed og:image at a host that 404s, so link previews came up
 * blank — and it told Google this site's canonical URLs lived on someone
 * else's domain.
 *
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL to the project's production domain:
 * the .vercel.app one until a custom domain is attached, the custom one after.
 * So this corrects itself the day the domain is moved across — no code change.
 *
 * Server-only (VERCEL_* are not NEXT_PUBLIC_). Import from server components.
 */
export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/+$/, '')

  if (
    process.env.VERCEL_ENV === 'production' &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  // Preview and branch deployments each get their own hostname.
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000'

  return STUDIO_SITE
}
