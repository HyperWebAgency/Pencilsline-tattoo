import { STUDIO_SITE } from './supabase/config'

/**
 * The origin this deployment is served from, for og:image, canonical URLs,
 * breadcrumbs, the sitemap, robots.txt and llms.txt.
 *
 * Production is STUDIO_SITE, www.pencilsline-tattoo.fr, served by this
 * project since 5 October 2026. Not VERCEL_PROJECT_PRODUCTION_URL: Vercel
 * fills that with the project's shortest custom domain, the bare
 * pencilsline-tattoo.fr, which only redirects to www — a sitemap and
 * canonical URLs pointing at a redirect.
 *
 * Server-only (VERCEL_* are not NEXT_PUBLIC_). Import from server components.
 */
export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/+$/, '')

  if (process.env.VERCEL_ENV === 'production') return STUDIO_SITE

  // Preview and branch deployments each get their own hostname.
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000'

  return STUDIO_SITE
}
