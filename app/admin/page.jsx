import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getReviewCount } from '@/lib/settings'
import { MAX_GALLERY_PHOTOS, MAX_HOME_PHOTOS } from '@/lib/supabase/config'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import HomeCarousel from './HomeCarousel'
import UploadForm from './UploadForm'
import PhotoList from './PhotoList'
import ReviewCountForm from './ReviewCountForm'
import VideoList from './VideoList'
import VideoUploadForm from './VideoUploadForm'

// Admin must always reflect true current state and be permission-checked
// per request. Never cached.
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Administration — Pencilsline Tattoo',
  robots: { index: false, follow: false },
}

/**
 * One tab per thing she can change, each opening with where it shows on the
 * site. Tabs are plain links (?section=…), so they work without JavaScript and
 * the back button returns to the previous tab.
 */
const SECTIONS = [
  { id: 'galerie', label: 'Galerie' },
  { id: 'accueil', label: 'Accueil' },
  { id: 'videos', label: 'Vidéos' },
  { id: 'avis', label: 'Avis Google' },
]

function Step({ n, children }) {
  return (
    <h3 className="admin__step">
      <span aria-hidden="true">{n}</span>
      {children}
    </h3>
  )
}

export default async function AdminPage({ searchParams }) {
  const supabase = await createSupabaseServerClient()

  // Server-side check on every request. The login UI is cosmetic; this and
  // RLS are the real boundary.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { section: asked } = await searchParams
  const section = SECTIONS.some((s) => s.id === asked) ? asked : 'galerie'

  const [{ data: photos }, { data: videos }, reviewCount] = await Promise.all([
    supabase
      .from('photos')
      .select('id, storage_path, alt_text, description, display_order, show_on_home, home_order')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('videos')
      .select('id, storage_path, poster_path, label, display_order')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true }),
    getReviewCount(),
  ])

  const counts = {
    galerie: `${photos?.length ?? 0}/${MAX_GALLERY_PHOTOS}`,
    accueil: `${(photos ?? []).filter((p) => p.show_on_home).length}/${MAX_HOME_PHOTOS}`,
    videos: videos?.length ?? 0,
    avis: reviewCount,
  }

  return (
    <main className="admin">
      <header className="admin__header">
        <div>
          <h1>Espace administration</h1>
          <p className="admin__lead">
            Ici, vous changez les photos, les vidéos et le nombre d&apos;avis du
            site. Chaque changement est en ligne en quelques secondes.
          </p>
        </div>
        <AccountBar email={user.email} />
      </header>

      <nav className="admin-tabs" aria-label="Sections de l'administration">
        {SECTIONS.map((s) => (
          <Link
            key={s.id}
            href={`/admin?section=${s.id}`}
            className="admin-tabs__tab"
            aria-current={s.id === section ? 'page' : undefined}
          >
            {s.label}
            <span className="admin-tabs__count">{counts[s.id]}</span>
          </Link>
        ))}
      </nav>

      {section === 'galerie' && (
        <section className="admin__panel" aria-labelledby="admin-gallery">
          <h2 id="admin-gallery">Galerie — page Réalisations</h2>
          <p className="admin__where">
            Toutes vos photos, montrées sur la page Réalisations dans l&apos;ordre de
            la liste. Jusqu&apos;à {MAX_GALLERY_PHOTOS} photos. Le carrousel de
            l&apos;accueil en montre une sélection, choisie dans l&apos;onglet Accueil.
          </p>

          <Step n={1}>Ajouter une photo</Step>
          <UploadForm count={photos?.length ?? 0} />

          <Step n={2}>Vos photos, dans l&apos;ordre de la galerie</Step>
          <p className="admin__hint">
            ↑ et ↓ changent l&apos;ordre de la galerie : la photo n° 1 est montrée en
            premier. « Supprimer » l&apos;efface du site entier.
          </p>
          <PhotoList photos={photos ?? []} />
        </section>
      )}

      {section === 'accueil' && (
        <section className="admin__panel" aria-labelledby="admin-home">
          <h2 id="admin-home">Accueil — carrousel « Réalisations »</h2>
          <p className="admin__where">
            Le carrousel en haut de l&apos;accueil montre une sélection de photos de
            votre galerie, au maximum {MAX_HOME_PHOTOS}, dans son propre ordre.
            Changer le carrousel ne touche pas à la galerie.
          </p>
          <HomeCarousel photos={photos ?? []} />
        </section>
      )}

      {section === 'videos' && (
        <section className="admin__panel" aria-labelledby="admin-videos">
          <h2 id="admin-videos">Vidéos de l&apos;atelier</h2>
          <p className="admin__where">
            Elles apparaissent sous le titre de l&apos;accueil. Sur ordinateur,
            jusqu&apos;à trois côte à côte (au-delà, elles passent à la ligne) ; sur
            téléphone, seule la vidéo n° 1 est montrée.
          </p>

          <Step n={1}>Ajouter une vidéo</Step>
          <VideoUploadForm />

          <Step n={2}>Vos vidéos, dans l&apos;ordre du site</Step>
          <p className="admin__hint">
            ↑ et ↓ changent l&apos;ordre : la vidéo n° 1 est celle des téléphones.
          </p>
          <VideoList videos={videos ?? []} />
        </section>
      )}

      {section === 'avis' && (
        <section className="admin__panel" aria-labelledby="admin-reviews">
          <h2 id="admin-reviews">Avis Google</h2>
          <p className="admin__where">
            Le nombre d&apos;avis affiché à côté des étoiles : en haut de
            l&apos;accueil, dans le pied de page et sur la page Contact.
          </p>
          <ReviewCountForm initialCount={reviewCount} />
        </section>
      )}
    </main>
  )
}

function AccountBar({ email }) {
  return (
    <div className="admin__account">
      <span className="admin__account-label">Connectée en tant que</span>
      <strong className="admin__account-email">{email}</strong>
      <div className="admin__account-links">
        <a href="/" target="_blank" rel="noreferrer" className="admin__view-site">
          Voir le site ↗
        </a>
        <form action="/api/auth/signout" method="post">
          <button type="submit" className="admin__signout">
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  )
}
