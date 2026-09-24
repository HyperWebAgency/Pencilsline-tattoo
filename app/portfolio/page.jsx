import Link from 'next/link'
import AdminShortcut from '@/components/AdminShortcut'
import GalleryGrid from '@/components/GalleryGrid'
import InkStroke from '@/components/InkStroke'
import SealStamp from '@/components/SealStamp'
import { getSiteUrl } from '@/lib/site-url'
import { createSupabasePublicClient } from '@/lib/supabase/server'
import {
  BUCKET,
  STUDIO_ARTIST,
  STUDIO_CITY,
  STUDIO_INSTAGRAM,
  STUDIO_INSTAGRAM_HANDLE,
  STUDIO_NAME,
} from '@/lib/supabase/config'

// ISR: static HTML, rebuilt hourly. The upload route also calls
// revalidatePath('/portfolio') so new photos appear within seconds.
export const revalidate = 3600

export const metadata = {
  title: `Réalisations — ${STUDIO_NAME}, ${STUDIO_CITY}`,
  description: `Tatouages graphiques, brush et abstraits réalisés par ${STUDIO_ARTIST} — ${STUDIO_NAME}, ${STUDIO_CITY}.`,
}

/**
 * Mirrors the visible trail so Google can show it in results. Built from the
 * live origin rather than the intended domain — pointing a breadcrumb at a host
 * serving a different site is worse than having no breadcrumb.
 */
function buildBreadcrumbSchema(site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: site },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Réalisations',
        item: `${site}/portfolio`,
      },
    ],
  }
}

export default async function PortfolioPage() {
  const supabase = createSupabasePublicClient()

  const { data, error } = await supabase
    .from('photos')
    .select('id, storage_path, alt_text, width, height')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to load portfolio:', error.message)
  }

  const photos = (data ?? []).map((p) => ({
    id: p.id,
    src: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${p.storage_path}`,
    alt: p.alt_text,
    width: p.width,
    height: p.height,
  }))

  return (
    <main className="pfolio">
      <header className="pfolio__head">
        <nav className="breadcrumb" aria-label="Fil d'Ariane">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link className="breadcrumb__link" href="/">
                Accueil
              </Link>
            </li>
            <li className="breadcrumb__item" aria-current="page">
              Réalisations
            </li>
          </ol>
        </nav>
        <p className="pfolio__kicker">
          <span className="seal-dot" aria-hidden="true" />
          Portfolio — {STUDIO_CITY}
        </p>
        <h1 className="pfolio__title">
          L&apos;encre sur{' '}
          <span className="pfolio__word">
            la peau.
            <span className="pfolio__underline" aria-hidden="true">
              <InkStroke length={220} thickness={7} seed={53} rough={2.6} />
            </span>
          </span>
        </h1>
        {photos.length > 0 && (
          <p className="pfolio__count">
            {photos.length} pièce{photos.length > 1 ? 's' : ''} — graphique, brush
            &amp; abstrait
          </p>
        )}
      </header>

      {photos.length === 0 ? (
        <p className="pfolio__empty">Aucune photo pour le moment. Revenez bientôt.</p>
      ) : (
        <GalleryGrid photos={photos} />
      )}

      <footer className="pfolio__cta">
        <p className="pfolio__cta-text">Un projet en tête&nbsp;?</p>
        <div className="pfolio__cta-actions">
          <SealStamp href="/contact" seed={17}>
            Prendre rendez-vous
          </SealStamp>
          <a className="brush-link" href={STUDIO_INSTAGRAM} target="_blank" rel="noreferrer">
            {STUDIO_INSTAGRAM_HANDLE}
            <span className="brush-link__dash" aria-hidden="true">
              <InkStroke length={130} thickness={2.8} seed={19} color="#b31b1b" />
            </span>
          </a>
        </div>
      </footer>

      <AdminShortcut />

      <script
        type="application/ld+json"
        // Static object we control — no user input reaches this.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbSchema(getSiteUrl())),
        }}
      />
    </main>
  )
}
