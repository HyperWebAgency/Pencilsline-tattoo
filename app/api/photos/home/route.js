import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from '@/lib/supabase/server'
import { MAX_HOME_PHOTOS } from '@/lib/supabase/config'

/**
 * Puts a gallery photo into the home carousel, or takes it out. Taking it out
 * never deletes it: it stays in the gallery.
 */
export async function POST(request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const { id, onHome } = await request.json().catch(() => ({}))
  if (!id || typeof onHome !== 'boolean') {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()
  let changes = { show_on_home: false }

  if (onHome) {
    const { count } = await admin
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('show_on_home', true)

    if ((count ?? 0) >= MAX_HOME_PHOTOS) {
      return NextResponse.json(
        {
          error: `Le carrousel est plein (${MAX_HOME_PHOTOS} photos). Retirez-en une avant d'en ajouter une autre.`,
        },
        { status: 400 }
      )
    }

    // Joins at the end of the carousel.
    const { data: last } = await admin
      .from('photos')
      .select('home_order')
      .eq('show_on_home', true)
      .order('home_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    changes = { show_on_home: true, home_order: (last?.home_order ?? -1) + 1 }
  }

  const { error } = await admin.from('photos').update(changes).eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/')

  return NextResponse.json({ ok: true })
}
