import Link from 'next/link'
import InkStroke from './InkStroke'
import { LEGAL_PAGES, LEGAL_UPDATED } from '@/lib/legal'

/** The FAQ's faint brush rule, above every section. */
function Rule({ seed }) {
  return (
    <span className="legal__rule" aria-hidden="true">
      <InkStroke length={900} thickness={1.5} seed={seed} rough={1.2} />
    </span>
  )
}

const num = (i) => String(i + 1).padStart(2, '0')

/** 2026-10-05 → « 5 octobre 2026 ». UTC, so the server's zone can't shift the day. */
const updated = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(LEGAL_UPDATED))

/**
 * Shell shared by the three legal pages: the contact page's breadcrumb and
 * inked title, then the FAQ's layout, a table of contents pinned on the left
 * and the text on the right. `sections` feeds both, so a section added to a
 * page shows up in its contents by itself.
 *
 * sections: [{ id, title, body }] — id is the anchor, body is JSX.
 */
export default function LegalPage({ href, title, word, lead, sections, seed = 200 }) {
  const crumb = LEGAL_PAGES.find((p) => p.href === href)?.label

  return (
    <main className="legal">
      <header className="legal__head">
        <nav className="breadcrumb" aria-label="Fil d'Ariane">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link className="breadcrumb__link" href="/">
                Accueil
              </Link>
            </li>
            <li className="breadcrumb__item" aria-current="page">
              {crumb}
            </li>
          </ol>
        </nav>
        <h1 className="legal__title">
          {title}{' '}
          <span className="legal__word">
            {word}
            <span className="legal__underline" aria-hidden="true">
              <InkStroke length={260} thickness={7} seed={seed} rough={2.6} />
            </span>
          </span>
        </h1>
        <p className="legal__lead">{lead}</p>
        <p className="legal__date">
          Mise à jour le <time dateTime={LEGAL_UPDATED}>{updated}</time>
        </p>
      </header>

      <div className="legal__grid">
        <aside className="legal__aside">
          <nav aria-labelledby="legal-toc">
            <p className="legal__h" id="legal-toc">
              Sommaire
            </p>
            <ol className="legal__toc">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>
                    <span className="legal__toc-num">{num(i)}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <nav className="legal__others" aria-labelledby="legal-others">
            <p className="legal__h" id="legal-others">
              Voir aussi
            </p>
            {LEGAL_PAGES.filter((p) => p.href !== href).map((p, i) => (
              <Link key={p.href} className="brush-link" href={p.href}>
                {p.href === '/cgv' ? 'Conditions générales de vente' : p.label}
                <span className="brush-link__dash" aria-hidden="true">
                  <InkStroke length={140} thickness={2.8} seed={seed + 40 + i} color="#b31b1b" />
                </span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="legal__body">
          {sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              className="legal__section"
              aria-labelledby={`${s.id}-title`}
            >
              <Rule seed={seed + 1 + i} />
              <h2 className="legal__h2" id={`${s.id}-title`}>
                <span className="legal__num">{num(i)}</span>
                {s.title}
              </h2>
              <div className="legal__text">{s.body}</div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
