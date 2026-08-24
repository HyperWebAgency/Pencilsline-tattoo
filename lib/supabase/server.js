import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Request-scoped client that reads the artist's session from cookies.
 * Use this to check *who* is asking. Subject to RLS.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies() // async in Next 16

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // Safe to ignore: the browser client refreshes sessions too.
          }
        },
      },
    }
  )
}

/**
 * Admin client using the secret key. BYPASSES ROW LEVEL SECURITY.
 *
 * Never import this into a Client Component. Only use it in route handlers
 * *after* verifying the caller is signed in.
 */
export function createSupabaseAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY
  if (!key) throw new Error('SUPABASE_SECRET_KEY is not set')

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * Anonymous read-only client for public pages. No cookies, so pages using it
 * stay statically renderable and cacheable.
 */
export function createSupabasePublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
