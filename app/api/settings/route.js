import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from '@/lib/supabase/server'

/** Only there to catch a slip of the keyboard (an extra zero or two). */
const MAX_REVIEW_COUNT = 100000

export async function POST(request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const count = Number(body.reviewCount)

  if (!Number.isInteger(count) || count < 0 || count > MAX_REVIEW_COUNT) {
    return NextResponse.json(
      { error: "Nombre d'avis invalide : un nombre entier, sans espace ni virgule." },
      { status: 400 }
    )
  }

  const admin = createSupabaseAdminClient()

  // Upsert rather than update, so a missing row is recreated instead of the
  // save silently changing nothing.
  const { error } = await admin
    .from('site_settings')
    .upsert({ id: true, google_review_count: count })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // The count is in the footer on every page, not only on the home page.
  revalidatePath('/', 'layout')

  return NextResponse.json({ reviewCount: count })
}
