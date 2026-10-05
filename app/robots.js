import { getSiteUrl } from '@/lib/site-url'

/**
 * /robots.txt. Every public page is open to every crawler, AI answer engines
 * included (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…): being cited
 * by them is part of the point, so none is singled out. Only the admin and
 * the API are kept out.
 */
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/'],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  }
}
