'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import PolaroidCard from './PolaroidCard';

/** Une carte de plus toutes les 130 ms, pause table pleine, puis les portes. */
const CARD_MS = 130;
const HOLD_MS = 380;
/** Doit rester égal à la transition de .deal__half dans globals.css. */
const DOOR_MS = 750;

/**
 * 12 zones lâches (4 colonnes × 3 lignes) en fractions de l'espace DISPONIBLE
 * (100 % moins la carte) : 1 = collée au bord, jamais coupée. Mélangées à
 * chaque lancement — le pur aléatoire ferait des paquets, la grille mélangée
 * garantit du haut-gauche ET du bas-droite.
 */
const ZONES = [];
for (let row = 0; row < 3; row += 1) {
  for (let col = 0; col < 4; col += 1) {
    ZONES.push({ fx: col / 3, fy: row / 2 });
  }
}

const jittered = (f) => Math.min(1, Math.max(0, f + Math.random() * 0.08 - 0.04));

/** Fisher-Yates. Appelé au clic, jamais au rendu — pas de souci d'hydratation. */
function shuffled(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Premier mot parlant de la description, pour le tag bas-droite. */
function tagWord(alt) {
  const word = (alt || '').split(/\s+/).find((w) => w.length > 3) || 'encre';
  return word.toLowerCase().replace(/[^a-zà-ÿ-]/gi, '');
}

const TransitionContext = createContext(null);

export function useGalleryTransition() {
  return useContext(TransitionContext);
}

/**
 * Monté dans le layout racine, au-dessus des pages : l'overlay survit ainsi au
 * changement de route, ce qui permet d'ouvrir les deux battants PAR-DESSUS la
 * galerie déjà affichée. Déroulé : les polaroids s'accumulent (dealing), la
 * navigation part (pushed), et dès que la galerie est là, la table se fend au
 * milieu et s'ouvre comme une porte (opening).
 *
 * Chaque battant fait 50 % de large avec overflow caché, et contient un pane
 * pleine largeur portant la MÊME table de cartes — les deux moitiés se
 * raccordent au pixel près, et glissent chacune vers son bord.
 */
export default function TransitionProvider({ children, photos = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState('idle'); // idle | dealing | pushed | opening
  const [deal, setDeal] = useState(null);
  const [shown, setShown] = useState(0);
  const hrefRef = useRef('/portfolio');

  const start = ({ images = [], href = '/portfolio' }) => {
    // Une donne à la fois — le bouton est aussi désactivé, ceinture et bretelles.
    if (phase !== 'idle') return;

    hrefRef.current = href;

    // Sans images fournies (lien de la navbar), on retombe sur le jeu chargé
    // par le layout : la donne marche donc depuis n'importe quelle page.
    const deck = images.length ? images : photos;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || deck.length === 0) {
      router.push(href);
      return;
    }

    // Au moins 8 cartes pour que la table paraisse pleine : avec peu de photos,
    // certaines reviennent deux fois, à une autre place et un autre angle.
    const zones = shuffled(ZONES);
    const count = Math.min(zones.length, Math.max(deck.length, 8));
    const pool = shuffled(deck);

    setShown(0);
    setDeal(
      Array.from({ length: count }, (_, i) => {
        const image = pool[i % pool.length];
        const zone = zones[i];
        return {
          ...image,
          fx: jittered(zone.fx),
          fy: jittered(zone.fy),
          rotation: Math.random() * 10 - 5,
          num: String(i + 1).padStart(3, '0'),
          tag: tagWord(image.alt),
        };
      })
    );
    setPhase('dealing');
  };

  // La donne : une carte par tick, puis courte pause et navigation.
  useEffect(() => {
    if (phase !== 'dealing' || !deal) return undefined;

    if (shown < deal.length) {
      const next = setTimeout(() => setShown((s) => s + 1), CARD_MS);
      return () => clearTimeout(next);
    }

    const leave = setTimeout(() => {
      setPhase('pushed');
      router.push(hrefRef.current);
    }, HOLD_MS);
    return () => clearTimeout(leave);
  }, [phase, deal, shown, router]);

  // La galerie est là : on ouvre les portes par-dessus.
  useEffect(() => {
    if (phase === 'pushed' && pathname === hrefRef.current) {
      setPhase('opening');
    }
  }, [phase, pathname]);

  // Filet de sécurité : si la navigation cale, on ouvre quand même plutôt que
  // de laisser l'écran couvert indéfiniment.
  useEffect(() => {
    if (phase !== 'pushed') return undefined;
    const bail = setTimeout(() => setPhase('opening'), 3000);
    return () => clearTimeout(bail);
  }, [phase]);

  // Portes ouvertes : tout ranger.
  useEffect(() => {
    if (phase !== 'opening') return undefined;
    const done = setTimeout(() => {
      setPhase('idle');
      setDeal(null);
    }, DOOR_MS);
    return () => clearTimeout(done);
  }, [phase]);

  const renderCards = (side) =>
    (deal ? deal.slice(0, shown) : []).map((card, i) => (
      <PolaroidCard
        key={`${side}-${card.num}`}
        src={card.src}
        alt=""
        tagLeft={`[ ${card.num} ]`}
        tagRight={`[ ${card.tag} ]`}
        rotation={card.rotation}
        className="deal__card"
        style={{
          left: `calc((100% - var(--deal-card-w)) * ${card.fx})`,
          top: `calc((100% - var(--deal-card-h)) * ${card.fy})`,
          zIndex: i,
        }}
      />
    ));

  return (
    <TransitionContext.Provider value={{ start, active: phase !== 'idle' }}>
      {children}
      {deal ? (
        <div
          className={`deal${phase === 'opening' ? ' deal--open' : ''}`}
          role="presentation"
          aria-hidden="true"
        >
          <div className="deal__half deal__half--left">
            <div className="deal__pane">{renderCards('l')}</div>
          </div>
          <div className="deal__half deal__half--right">
            <div className="deal__pane">{renderCards('r')}</div>
          </div>
        </div>
      ) : null}
    </TransitionContext.Provider>
  );
}
