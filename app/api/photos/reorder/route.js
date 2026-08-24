import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from '@/lib/supabase/server'

export async function POST(request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const { ids } = await request.json()
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'Ordre invalide.' }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()

  // Position in the array is the new display_order.
  const results = await Promise.all(
    ids.map((id, index) =>
      admin.from('photos').update({ display_order: index }).eq('id', id)
    )
  )

  const failed = results.find((r) => r.error)
  if (failed) {
    return NextResponse.json({ error: failed.error.message }, { status: 500 })
  }

  revalidatePath('/portfolio')

  return NextResponse.json({ ok: true })
}
