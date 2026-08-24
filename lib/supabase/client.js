'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser client for the login form.
 *
 * Session persistence: the artist uploads from her own phone, so the session
 * is kept indefinitely rather than cleared when the tab closes. If this ever
 * moves to a shared shop device, this is the one place to change.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
}
