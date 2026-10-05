import Link from 'next/link'
import GalleryStamp from '@/components/GalleryStamp'
import InkStroke from '@/components/InkStroke'
import { STUDIO_NAME } from '@/lib/supabase/config'

export const metadata = {
  title: `Page introuvable — ${STUDIO_NAME}`,
  // Next already marks a 404 noindex; follow keeps the links below crawlable.
  robots: { index: false, follow: true },
}

/**
 * The 404, for any address the site doesn't know — mostly old links from the
 * previous site. Laid out like /merci: one centred column, a faint « 404 »
 * left on the paper behind the title like a trace of ink, then the ways back.
 * Everything here is still; only the links answer the pointer.
 */
export default function NotFound() {
  return (
    <main className="lost">
      <p className="lost__kicker">
        <span className="seal-dot" aria-hidden="true" />
        <span className="visually-hidden">Erreur 404&nbsp;: </span>
        Page introuvable
      </p>

      {/* The numeral and the title share one cell, the title across the
          middle of the 404, like a word written over a faded print. */}
      <div className="lost__stage">
        {/* Holds the bleed filter only: the numeral's edges soak into the
            paper, the same displacement as every other brushed edge. */}
        <svg className="lost__filter" aria-hidden="true" focusable="false">
          <filter id="lost-bleed">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05"
              numOctaves="3"
              seed="404"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
        <p className="lost__numeral" aria-hidden="true">
          404
        </p>

        <h1 className="lost__title">
          Une page{' '}
          <span className="lost__word">
            blanche
            <span className="lost__underline" aria-hidden="true">
              <InkStroke length={220} thickness={7} seed={404} rough={2.6} />
            </span>
          </span>
        </h1>
      </div>

      <p className="lost__lead">Pas un trait d’encre à cette adresse.</p>

      <p className="lost__text">
        Le site a fait peau neuve en octobre&nbsp;2026, et certains liens de
        l’ancien site ne mènent plus nulle part. Retrouvez les réalisations
        dans la galerie ou prenez rendez-vous pour parler de votre projet.
      </p>

      <div className="lost__actions">
        <GalleryStamp seed={407} />
        <Link className="brush-link" href="/contact">
          Prendre rendez-vous
          <span className="brush-link__dash" aria-hidden="true">
            <InkStroke length={160} thickness={2.8} seed={411} color="#b31b1b" />
          </span>
        </Link>
        <Link className="brush-link" href="/">
          Retour à l’accueil
          <span className="brush-link__dash" aria-hidden="true">
            <InkStroke length={140} thickness={2.8} seed={415} color="#b31b1b" />
          </span>
        </Link>
      </div>
    </main>
  )
}
