import GalleryStamp from '@/components/GalleryStamp'
import InkMerci from '@/components/InkMerci'
import InkStroke from '@/components/InkStroke'
import { STUDIO_NAME } from '@/lib/supabase/config'

export const metadata = {
  title: `Merci — ${STUDIO_NAME}`,
  description: 'Votre demande de rendez-vous est bien arrivée.',
  // Only reached by sending the form: nothing here for search results.
  robots: { index: false, follow: true },
}

/**
 * Where the contact form lands once Formspree has the request. « Merci » is
 * written in ink, letter by letter (InkMerci); the rest says what happens
 * next and points to the gallery in the meantime.
 */
export default function MerciPage() {
  return (
    <main className="merci">
      {/* Without JavaScript nothing writes the word, so show it whole. */}
      <noscript>
        <style>{'.merci-ink__line { stroke-dashoffset: 0 !important; }'}</style>
      </noscript>

      <p className="merci__kicker">
        <span className="seal-dot" aria-hidden="true" />
        Demande envoyée
      </p>

      <h1 className="merci__title">
        <span className="visually-hidden">Merci</span>
        <InkMerci />
      </h1>

      <p className="merci__lead">
        Votre demande est bien arrivée.
        <br />
        Je reviens vers vous le plus vite possible.
      </p>

      <p className="merci__text">
        Gardez un œil sur vos e-mails, et pensez à jeter un coup d&apos;œil aux
        spams&nbsp;: je vous réponds par là, ou je vous appelle si vous
        m&apos;avez laissé votre numéro.
      </p>

      <p className="merci__text">
        En attendant, allez faire un tour du côté des réalisations&nbsp;: vous
        y trouverez peut-être l&apos;inspiration&nbsp;!
      </p>

      <div className="merci__actions">
        <GalleryStamp />
        <a className="brush-link" href="/">
          Retour à l&apos;accueil
          <span className="brush-link__dash" aria-hidden="true">
            <InkStroke length={140} thickness={2.8} seed={151} color="#b31b1b" />
          </span>
        </a>
      </div>
    </main>
  )
}
