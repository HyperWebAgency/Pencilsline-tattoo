import InkStroke from './InkStroke'
import {
  BOOKING_WARNING,
  STUDIO_ACCESS,
  STUDIO_ADDRESS,
  STUDIO_HOURS,
  VENUE_NAME,
} from '@/lib/supabase/config'

/**
 * French spacing: a narrow no-break space before ? ! ; and a no-break space
 * before : and €, so no punctuation mark ever wraps onto a line of its own.
 */
const fr = (text) =>
  text
    .replace(/ ([?!;])/g, ' $1')
    .replace(/ :/g, ' :')
    .replace(/(\d) €/g, '$1 €')

/**
 * Every answer comes from Alexandra's own words (her current site, her booking
 * post) or from the studio details in config — nothing here is a guess. The
 * same list feeds the visible accordion and the FAQPage JSON-LD.
 */
const QUESTIONS = [
  {
    q: 'Combien coûte un tatouage à Montpellier chez Pencilsline ?',
    a: "Chaque pièce est unique, son tarif aussi : il dépend du temps de travail, du niveau de détail et de la symbolique du dessin. La zone, la taille, la peau ou la complexité du motif peuvent le faire évoluer. Envoie-moi ton projet et je te fais un devis.",
  },
  {
    q: 'Comment prendre rendez-vous pour un tatouage à Montpellier ?',
    a: `Écris-moi depuis la page Contact avec ton projet, la zone à tatouer, la taille approximative en centimètres et tes inspirations : plus ta demande est précise, plus je te réponds vite. Tu peux aussi passer au ${VENUE_NAME} pour en parler directement.`,
  },
  {
    q: 'Faut-il verser un acompte ?',
    a: 'Oui : des arrhes de 50 € bloquent ta date. Elles sont déduites du prix le jour du tatouage, sauf en cas de désistement.',
  },
  {
    q: 'Quand est-ce que je découvre mon dessin ?',
    a: "Je dessine ta pièce la semaine qui précède ton rendez-vous, puis je te l'envoie pour que tu la valides ou qu'on l'ajuste ensemble avant la séance.",
  },
  {
    q: 'Quels styles de tatouage proposes-tu à Montpellier ?',
    a: "Du tatouage graphique, brush et abstrait, souvent d'inspiration japonaise, dans l'esprit de l'encre de Chine. Mon style mêle le graphisme, le semi-réalisme et le geste du pinceau.",
  },
  {
    q: 'Est-ce que je peux me faire tatouer un flash ?',
    a: "Oui. Mes flashs sont en exemplaire unique : une création, une personne. Tu les découvres sur mes réseaux ou en me contactant, et un dessin peut aussi être adapté à ton idée.",
  },
  {
    q: 'Où se trouve ton salon de tatouage près de Montpellier ?',
    a: `Je tatoue au ${VENUE_NAME}, ${STUDIO_ADDRESS.street} à ${STUDIO_ADDRESS.city}, aux portes de Montpellier. ${STUDIO_ACCESS.join('. ')}.`,
  },
  {
    q: 'Quels sont tes horaires ?',
    a: `${STUDIO_HOURS.map((h) => `${h.days} : ${h.time.toLowerCase()}`).join('. ')}.`,
  },
  {
    q: 'Y a-t-il des contre-indications au tatouage ?',
    a: `${BOOKING_WARNING} En cas de doute sur ta santé ou sur un traitement en cours, demande l'avis de ton médecin avant de réserver.`,
  },
].map(({ q, a }) => ({ q: fr(q), a: fr(a) }))

const schema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: QUESTIONS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

/** A brush rule between questions — the footer's rule, a size smaller. */
function Rule({ seed }) {
  return (
    <span className="faq__rule" aria-hidden="true">
      <InkStroke length={900} thickness={1.5} seed={seed} rough={1.2} />
    </span>
  )
}

/**
 * Questions fréquentes. Native <details>, so it opens without JavaScript and
 * every answer is in the HTML for search engines; the first one starts open
 * to show that the rows unfold.
 */
export default function Faq() {
  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <div className="faq__inner">
        <div className="faq__intro">
          <p className="faq__kicker">
            <span className="seal-dot" aria-hidden="true" />
            Questions fréquentes
          </p>
          <h2 className="faq__title" id="faq-title">
            Avant ton{' '}
            <span className="faq__word">
              tatouage
              <span className="faq__underline" aria-hidden="true">
                <InkStroke length={260} thickness={7} seed={113} rough={2.6} />
              </span>
            </span>
          </h2>
          <p className="faq__lead">
            Tarifs, rendez-vous, dessin, accès au salon près de Montpellier{' '}:
            l&apos;essentiel pour préparer ton projet.
          </p>
          <a className="brush-link faq__more" href="/contact">
            Poser une autre question
            <span className="brush-link__dash" aria-hidden="true">
              <InkStroke length={140} thickness={2.8} seed={117} color="#b31b1b" />
            </span>
          </a>
        </div>

        <div className="faq__list">
          {/* The rule sits outside <details>: anything inside it other than
              the summary is hidden while the row is closed. */}
          {QUESTIONS.map(({ q, a }, i) => (
            <div className="faq__row" key={q}>
              <Rule seed={120 + i} />
              <details className="faq__item" open={i === 0}>
                <summary className="faq__q">
                  <span>{q}</span>
                  {/* A brushed plus; opening turns the upright stroke flat,
                      leaving a minus. */}
                  <span className="faq__icon" aria-hidden="true">
                    <span>
                      <InkStroke length={20} thickness={2.4} seed={140 + i} />
                    </span>
                    <span>
                      <InkStroke length={20} thickness={2.4} seed={150 + i} />
                    </span>
                  </span>
                </summary>
                <p className="faq__a">{a}</p>
              </details>
            </div>
          ))}
          <Rule seed={129} />
        </div>
      </div>

      <script
        type="application/ld+json"
        // Static copy we control — no user input reaches this.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
        }}
      />
    </section>
  )
}
