'use client';

import { useEffect, useId, useRef } from 'react';
import InkStroke from './InkStroke';
import { isLite, onLite } from '@/lib/lite';
import SealStamp from './SealStamp';

/**
 * Placeholder copy. `rest` is the angle each card settles at: alternating, so
 * the finished pile looks dropped on a table rather than squared up.
 */
const STEPS = [
  {
    title: 'Parlons-en',
    rest: 0,
    text: "Envoie-moi ton idée, quelques références et l'endroit où tu l'imagines sur ton corps. On parle ensemble de la taille, de l'emplacement et du budget, et je te dis franchement ce qui vieillira bien sur la peau.",
  },
  {
    title: 'Le dessin',
    rest: 4,
    text: "Je dessine la pièce pour toi et pour cet emplacement, jamais d'après un catalogue. Tu découvres le croquis quelques jours avant la séance, et on l'ajuste ensemble jusqu'à ce qu'il te ressemble.",
  },
  {
    title: 'Le jour de la séance',
    rest: -4,
    text: 'Une seule personne à la fois, dans un atelier calme. On vérifie le stencil sur ta peau, on le déplace si besoin, puis je tatoue au rythme que demande la pièce.',
  },
  {
    title: 'Cicatrisation et soins',
    rest: 3,
    text: 'Tu repars avec ton tatouage protégé et des consignes de soin claires. Les semaines suivantes, je reste disponible pour répondre à tes questions et voir comment il cicatrise.',
  },
];

/* Motion tuning. Distances, sizes and spacing are CSS variables on .process. */

/** Angle a card enters at, on the side it will come to rest. */
const ENTER_TILT = 9.5;
/** Extra rise in px on top of the scroll itself, eased away as a card lands. */
const FLOAT = 80;
/** What a card shrinks to once the next one lands on it. */
const UNDER_SCALE = 0.95;
/** Share of the remaining distance covered per 60fps frame. Higher is snappier. */
const LERP = 0.14;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (t) => 1 - (1 - t) ** 3;

/**
 * A card's paper: a sheet of the page's own washi, lifted a shade like the
 * contact form's fields, with a deckled edge from the site's one brush filter
 * (turbulence + displacement, as on SealStamp and InkStroke) and a shadow
 * that follows that edge rather than a clean box. Rendered once — the card's
 * transform only moves the finished sheet around.
 */
function Sheet({ seed }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const paper = `sheet-paper-${uid}`;
  const edge = `sheet-edge-${uid}`;

  return (
    <svg
      className="process__sheet"
      viewBox="0 0 400 400"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id={paper} patternUnits="userSpaceOnUse" width="600" height="600">
          <image href="/textures/paper.svg" width="600" height="600" />
        </pattern>
        <filter id={edge} filterUnits="userSpaceOnUse" x="-40" y="-40" width="480" height="500">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.045"
            numOctaves="4"
            seed={seed}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="7"
            xChannelSelector="R"
            yChannelSelector="G"
            result="sheet"
          />
          {/* The polaroids' two shadows: a tight contact one and a soft lift. */}
          <feDropShadow in="sheet" dx="0" dy="2" stdDeviation="2.5" floodOpacity="0.12" result="near" />
          <feDropShadow in="near" dx="0" dy="10" stdDeviation="13" floodOpacity="0.17" />
        </filter>
      </defs>
      <g filter={`url(#${edge})`}>
        <rect x="8" y="8" width="384" height="384" fill={`url(#${paper})`} />
        <rect className="process__sheet-wash" x="8" y="8" width="384" height="384" />
      </g>
    </svg>
  );
}

/**
 * The heading pins on the left while four cards rise one by one into the
 * same sticky spot on the right and pile up.
 *
 * Nothing here moves on its own: every value is a function of scroll position,
 * and the loop only runs until the cards have caught up with it. Lenis (see
 * SmoothScroll) drives native scroll, so sticky positioning is untouched.
 */
export default function ProcessSteps() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const intro = section.querySelector('.process__intro');
    const slots = [...section.querySelectorAll('.process__slot')];
    const cards = slots.map((slot) => slot.firstElementChild);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    const current = slots.map(() => ({ y: 0, r: 0, s: 1 }));
    let pinAt = [];
    // Where the heading pins, or null where it doesn't (the one-column layout).
    let introPinAt = null;
    let navHidden = false;
    let frame = 0;
    let last = 0;
    let visible = false;
    // Jump straight to the scroll-derived pose, e.g. after a reload mid-page,
    // instead of animating there on nobody's input.
    let snap = true;

    const measure = () => {
      pinAt = slots.map((slot) => parseFloat(getComputedStyle(slot).top) || 0);
      const introStyle = getComputedStyle(intro);
      introPinAt = introStyle.position === 'sticky' ? parseFloat(introStyle.top) : null;
    };

    const isPinned = (el, at) => Math.abs(el.getBoundingClientRect().top - at) < 1;

    // The navbar steps aside for as long as the stack is pinned: from the
    // heading (card 01 on phones) locking in place until the pile lets go.
    // globals.css slides it away while <html> carries data-nav-hidden.
    const syncNav = () => {
      const hide =
        visible &&
        (isPinned(slots[0], pinAt[0]) || (introPinAt !== null && isPinned(intro, introPinAt)));
      if (hide === navHidden) return;
      navHidden = hide;
      document.documentElement.toggleAttribute('data-nav-hidden', hide);
    };

    // Progress per card: 0 as its slot enters at the viewport bottom, 1 once
    // it reaches its sticky position (where a pinned slot then stays).
    const targets = () => {
      const vh = window.innerHeight;
      const p = slots.map((slot, i) =>
        clamp01((vh - slot.getBoundingClientRect().top) / (vh - pinAt[i])),
      );

      return p.map((pi, i) => {
        const e = easeOut(pi);
        const { rest } = STEPS[i];
        const enter = (Math.sign(rest) || 1) * ENTER_TILT;
        const covered = easeOut(p[i + 1] ?? 0);
        return {
          y: FLOAT * (1 - e),
          r: enter + (rest - enter) * e,
          s: 1 - (1 - UNDER_SCALE) * covered,
        };
      });
    };

    const tick = (now) => {
      const dt = last ? Math.min(64, now - last) : 1000 / 60;
      last = now;
      const k = snap ? 1 : 1 - (1 - LERP) ** (dt / (1000 / 60));
      snap = false;

      let moving = false;
      targets().forEach((goal, i) => {
        const c = current[i];
        c.y += (goal.y - c.y) * k;
        c.r += (goal.r - c.r) * k;
        c.s += (goal.s - c.s) * k;

        const settled =
          Math.abs(goal.y - c.y) < 0.05 &&
          Math.abs(goal.r - c.r) < 0.005 &&
          Math.abs(goal.s - c.s) < 0.0002;
        if (settled) Object.assign(c, goal);
        else moving = true;

        cards[i].style.transform = `translate3d(0, ${c.y.toFixed(2)}px, 0) rotate(${c.r.toFixed(3)}deg) scale(${c.s.toFixed(4)})`;
      });

      if (moving) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
        last = 0;
      }
    };

    // Reduced motion or lite mode (lib/lite.js): the cards rest at their angle.
    const still = () => reduced.matches || isLite();

    const kick = () => {
      if (!frame && visible && !still()) frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };

    const onScroll = () => {
      kick();
      syncNav();
    };

    const onResize = () => {
      measure();
      snap = true;
      kick();
      syncNav();
    };

    // Reduced motion or lite: no loop at all, and the CSS resting angle shows
    // through. Lite is one way, so it only ever lands in the first branch.
    const onMotionPref = () => {
      if (still()) {
        stop();
        cards.forEach((card) => {
          card.style.transform = '';
        });
      } else {
        snap = true;
        kick();
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          snap = true;
          kick();
        } else {
          stop();
        }
        syncNav();
      },
      { rootMargin: '25% 0px' },
    );

    // The pinned heading is centred from its own height (see .process__intro).
    // contentRect leaves out the padding that height drives, so no feedback.
    const introSize = new ResizeObserver(([entry]) => {
      section.style.setProperty('--process-intro-h', `${entry.contentRect.height}px`);
      measure();
      syncNav();
    });

    measure();
    io.observe(section);
    introSize.observe(intro);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    reduced.addEventListener('change', onMotionPref);
    const offLite = onLite(onMotionPref);

    return () => {
      offLite();
      stop();
      io.disconnect();
      introSize.disconnect();
      // Leaving mid-stack (the CTA, say) must not strand the navbar offscreen.
      document.documentElement.removeAttribute('data-nav-hidden');
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      reduced.removeEventListener('change', onMotionPref);
    };
  }, []);

  return (
    <section
      className="process"
      id="univers"
      aria-labelledby="process-title"
      ref={sectionRef}
    >
      <div className="process__inner">
        <div className="process__intro">
          {/* Narrow no-break spaces before "?", as French typography wants,
              so a question mark never wraps onto a line of its own. */}
          <h2 className="process__title" id="process-title">
            <span className="process__line">
              Faire pareil que les autres{'\u202f'}? Non.
            </span>{' '}
            <span className="process__line">
              Se démarquer{'\u202f'}?{' '}
              <span className="process__word">
                Oui
                <span className="process__underline" aria-hidden="true">
                  <InkStroke length={110} thickness={7} seed={59} rough={2.6} />
                </span>
              </span>
              .
            </span>
          </h2>
          <p className="process__sub">
            Mon univers tourne autour de la ligne, du mouvement et du geste du
            pinceau, dans l&apos;esprit de l&apos;encre de Chine. Graphique,
            fineline, brush ou abstrait, souvent d&apos;inspiration japonaise&nbsp;:
            chaque tatouage est une pièce unique, composée pour ton corps.
          </p>
          <div className="process__actions">
            <SealStamp href="/contact" seed={21}>
              Prendre rendez-vous
            </SealStamp>
          </div>
        </div>

        <ol className="process__list">
          {STEPS.map((step, i) => (
            <li className="process__slot" key={step.title}>
              <article
                className="process__card"
                style={{ '--process-rest': `${step.rest}deg` }}
              >
                <Sheet seed={7 + i * 12} />
                <span className="process__num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="process__body">
                  <h3 className="process__name">{step.title}</h3>
                  <span className="process__dash" aria-hidden="true">
                    <InkStroke length={96} thickness={3.2} seed={62 + i} color="#b31b1b" />
                  </span>
                  <p className="process__text">{step.text}</p>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
