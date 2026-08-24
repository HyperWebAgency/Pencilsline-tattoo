'use client';

import { useEffect, useState } from 'react';
import InkStroke from './InkStroke';
import SealStamp from './SealStamp';

const LINKS = [
  { href: '#realisations', label: 'Réalisations' },
  { href: '#univers', label: 'Univers' },
  { href: '#apropos', label: 'À propos' },
];

/** Small red monogram seal next to the wordmark. */
function SealMark() {
  return (
    <svg className="nav__seal" viewBox="0 0 26 26" aria-hidden="true" focusable="false">
      <defs>
        <filter id="pl-sealmark" filterUnits="userSpaceOnUse" x="-4" y="-4" width="34" height="34">
          <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <rect x="1.5" y="1.5" width="23" height="23" rx="2" fill="#791010" filter="url(#pl-sealmark)" />
      <text
        x="13"
        y="14"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#f3efe5"
        fontSize="14"
        fontFamily="var(--font-serif), Georgia, serif"
        fontWeight="500"
      >
        P
      </text>
    </svg>
  );
}

/**
 * Site chrome in the sumi-e register: no bar, no border — the paper runs
 * through. The only solid colour is the hanko CTA. After some scroll the nav
 * gains a translucent paper backing and a thin brush rule.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <a className="nav__brand" href="/" aria-label="Pencilsline — accueil">
        <span className="nav__wordmark">Pencilsline</span>
        <SealMark />
      </a>

      <nav className="nav__links" aria-label="Navigation principale">
        {LINKS.map((l, i) => (
          <a key={l.href} className="brush-link" href={l.href}>
            {l.label}
            <span className="brush-link__dash" aria-hidden="true">
              <InkStroke length={70} thickness={2.8} seed={31 + i} color="#b31b1b" />
            </span>
          </a>
        ))}
        <SealStamp href="#contact" seed={9} small>
          Prendre RDV
        </SealStamp>
      </nav>

      <button
        type="button"
        className="nav__toggle"
        aria-expanded={open}
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        onClick={() => setOpen((v) => !v)}
      >
        <span style={{ width: 26 }}>
          <InkStroke length={26} thickness={2.6} seed={51} />
        </span>
        <span style={{ width: 17 }}>
          <InkStroke length={17} thickness={2.4} seed={52} />
        </span>
        <span style={{ width: 22 }}>
          <InkStroke length={22} thickness={2.5} seed={53} />
        </span>
      </button>

      {open && (
        <div className="nav__overlay">
          <nav aria-label="Navigation mobile">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
          </nav>
          <SealStamp href="#contact" seed={9}>
            Prendre rendez-vous
          </SealStamp>
        </div>
      )}

      <div className="nav__rule" aria-hidden="true">
        <InkStroke length={900} thickness={1.7} seed={77} rough={1.2} />
      </div>
    </header>
  );
}
