import CursorTrail from '@/components/CursorTrail';
import HeroBranches from '@/components/HeroBranches';
import InkStroke from '@/components/InkStroke';
import PencilslineLogo from '@/components/PencilslineLogo';
import SealStamp from '@/components/SealStamp';

/** A few flecks thrown off the headline's final stroke. */
function Splatter() {
  return (
    <svg className="hero__splat" viewBox="0 0 54 40" aria-hidden="true" focusable="false">
      <circle cx="8" cy="26" r="2.1" fill="#171514" fillOpacity="0.72" />
      <circle cx="24" cy="12" r="1.1" fill="#171514" fillOpacity="0.55" />
      <circle cx="40" cy="31" r="0.8" fill="#171514" fillOpacity="0.5" />
    </svg>
  );
}

export default function Page() {
  return (
    <main>
      <section className="hero">
        <HeroBranches />

        <div className="hero__content">
          <p className="hero__kicker">
            <span className="seal-dot" aria-hidden="true" />
            Tatoueuse à Montpellier
          </p>

          <h1 className="hero__title">
            Encre, geste,{' '}
            <span className="hero__word">
              ligne.
              <span className="hero__underline" aria-hidden="true">
                <InkStroke length={230} thickness={7} seed={41} rough={2.6} />
              </span>
              <Splatter />
            </span>
          </h1>

          <p className="hero__sub">
            Tatouage graphique, brush, abstrait et fineline — l&apos;esprit de
            l&apos;encre de Chine, une influence japonaise.
          </p>

          <div className="hero__actions">
            <SealStamp href="#contact" seed={5}>
              Prendre rendez-vous
            </SealStamp>
            <a className="brush-link" href="#realisations">
              Voir les réalisations
              <span className="brush-link__dash" aria-hidden="true">
                <InkStroke length={120} thickness={2.8} seed={44} color="#b31b1b" />
              </span>
            </a>
          </div>
        </div>

        <aside className="hero__rail">
          <div className="hero__logo">
            <PencilslineLogo />
          </div>
          <p className="hero__vertical">Sur rendez-vous uniquement</p>
        </aside>

        <div className="hero__scroll" aria-hidden="true">
          <span className="hero__scroll-stroke">
            <InkStroke vertical length={46} thickness={2.6} seed={23} />
          </span>
          <span className="hero__scroll-label">défiler</span>
        </div>
      </section>

      <CursorTrail />
    </main>
  );
}
