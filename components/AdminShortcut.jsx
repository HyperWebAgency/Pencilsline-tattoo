'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * "Ajouter des photos" — visible only to the signed-in artist, so the public
 * page stays clean while she gets a one-tap path from the gallery to the
 * upload form. Purely cosmetic gating: /admin re-checks auth server-side.
 */
export default function AdminShortcut() {
  const [artist, setArtist] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive && data.session) setArtist(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!artist) return null;

  return (
    <a className="admin-shortcut" href="/admin">
      <span aria-hidden="true">+</span> Ajouter des photos
    </a>
  );
}
