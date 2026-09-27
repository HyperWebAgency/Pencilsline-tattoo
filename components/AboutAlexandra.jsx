import Image from 'next/image';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (v) => Math.round(v * 100) / 100;

const TAU = Math.PI * 2;
const deg = (rad) => f((rad * 360) / TAU);

/**
 * A blossom and its bud beside each offset photo — the same five-petal
 * geometry, colours and soft roughening as the hero branches' flowers, just
 * detached from a branch. Deterministic per seed, safe to server-render; the
 * filter id is passed in because useId is off-limits in a server component.
 */
function Bloom({ id, seed = 3, petal = '#b31b1b', center = '#4a0707' }) {
  const rnd = mulberry32(seed * 2654435761 + 13);

  const bloom = { x: 26, y: 33, r: 11.5, rot: rnd() * TAU };
  const petals = [];
  for (let k = 0; k < 5; k += 1) {
    const a = bloom.rot + (k * TAU) / 5;
    const px = bloom.x + Math.cos(a) * bloom.r * 0.62;
    const py = bloom.y + Math.sin(a) * bloom.r * 0.62;
    petals.push(
      <ellipse
        key={k}
        cx={f(px)}
        cy={f(py)}
        rx={f(bloom.r * 0.54)}
        ry={f(bloom.r * 0.42)}
        transform={`rotate(${deg(a)} ${f(px)} ${f(py)})`}
        fill={petal}
      />,
    );
  }

  const bud = { x: 46, y: 15, r: 6, rot: rnd() * TAU };

  return (
    <svg className="about__bloom" viewBox="0 0 60 60" aria-hidden="true" focusable="false">
      <defs>
        {/* The blossoms' soft filter from InkBranch, verbatim. */}
        <filter id={id} filterUnits="userSpaceOnUse" x="-6" y="-6" width="72" height="72">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.14"
            numOctaves="2"
            seed={seed}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="1.9"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>
        <g fillOpacity="0.92">
          {petals}
          <circle cx={bloom.x} cy={bloom.y} r={f(bloom.r * 0.26)} fill={center} />
        </g>
        <g fillOpacity="0.88">
          <ellipse
            cx={bud.x}
            cy={bud.y}
            rx={f(bud.r * 0.5)}
            ry={f(bud.r * 0.68)}
            transform={`rotate(${deg(bud.rot)} ${bud.x} ${bud.y})`}
            fill={petal}
          />
          <circle cx={bud.x} cy={bud.y} r={f(bud.r * 0.15)} fill={center} />
        </g>
      </g>
    </svg>
  );
}

/**
 * Alexandra's presentation: her pitch in the centre, three small photos
 * zigzagging around it — left, right, left. Entirely static — the collage is
 * composition, not animation.
 */
export default function AboutAlexandra() {
  return (
    <section className="about" aria-labelledby="about-title">
      <div className="about__stage">
        <div className="about__minis">
          <div className="about__aside about__aside--tl">
            <figure className="about__mini">
              <Image
                src="/about/alexandra-tatoueuse-brush-japonais-lemontattoo-castelnau-le-lez.webp"
                alt="Portrait d'Alexandra, tatoueuse spécialisée dans le brush japonais et le fineline, chez Lemon Tattoo à Castelnau-le-Lez"
                fill
                sizes="(max-width: 640px) 28vw, 200px"
              />
            </figure>
            <Bloom id="about-bloom-a" seed={11} />
          </div>

          <div className="about__aside about__aside--ml">
            <figure className="about__mini">
              <Image
                src="/about/tatoueuse-montpellier-alexandra-en-seance.webp"
                alt="Alexandra, tatoueuse fineline et graphique, pendant une séance de tatouage à l'atelier de Castelnau-le-Lez, près de Montpellier"
                fill
                sizes="(max-width: 640px) 28vw, 216px"
              />
            </figure>
          </div>

          <div className="about__aside about__aside--br">
            <figure className="about__mini">
              <Image
                src="/about/tatouage-montpellier-dragon-encre-de-chine-bras.webp"
                alt="Tatouage brush d'inspiration chinoise réalisé par Alexandra : dragon à l'encre de Chine sur le bras"
                fill
                sizes="(max-width: 640px) 28vw, 216px"
              />
            </figure>
            <Bloom id="about-bloom-b" seed={27} />
          </div>
        </div>

        <div className="about__body">
          <h2 className="about__claim" id="about-title">
            <span className="about__claim-line">Ton histoire prend vie</span>{' '}
            <span className="about__claim-line">sous mon pinceau</span>
          </h2>

          <p className="about__text">
            Spécialisée dans le tatouage fineline et d&apos;inspiration japonaise
            et chinoise, je travaille l&apos;encre comme au pinceau : traits fins,
            traits libres, lavis, mouvement. Chaque projet commence par une conversation — tu
            m&apos;apportes ton idée, tes envies, tes références — puis je la
            traduis en un dessin que nous ajustons ensemble jusqu&apos;à la pièce
            finale. Je ne tatoue qu&apos;une personne à la fois, pour que chaque
            tatouage reçoive toute mon attention.
          </p>
        </div>
      </div>
    </section>
  );
}
