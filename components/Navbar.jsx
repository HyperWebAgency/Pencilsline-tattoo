'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import InkStroke from './InkStroke';
import PencilslineLogo from './PencilslineLogo';
import SealStamp from './SealStamp';
import { useGalleryTransition } from './TransitionProvider';
import {
  STUDIO_FACEBOOK,
  STUDIO_INSTAGRAM,
  STUDIO_INSTAGRAM_HANDLE,
} from '@/lib/supabase/config';

const GALLERY = '/portfolio';

const HOME = { href: '/', label: 'Accueil' };

const LINKS = [
  { href: '/portfolio', label: 'Réalisations' },
  // « Faire pareil que les autres ? Non. » on the home page (ProcessSteps).
  { href: '#univers', label: 'Univers' },
  { href: '/contact', label: 'Contact' },
];

/**
 * For the mobile menu. Line icons in the weight of the type, not the brands'
 * filled logos: the only solid colour on the site is the seal.
 */
const SOCIALS = [
  {
    href: STUDIO_INSTAGRAM,
    label: `Instagram (${STUDIO_INSTAGRAM_HANDLE})`,
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.25" cy="6.75" r="0.9" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    href: STUDIO_FACEBOOK,
    label: 'Facebook (Pencilsline Tattoo)',
    icon: <path d="M15.5 3H13a4 4 0 0 0-4 4v3H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7.5a1 1 0 0 1 1-1h2z" />,
  },
];

/**
 * Away from the home page, lead with Accueil so there is always a way back,
 * and send in-page anchors home rather than nowhere: a bare "#univers" on
 * /contact scrolls to a section that does not exist there.
 */
function linksFor(pathname) {
  const isHome = pathname === '/';
  const resolved = LINKS.map((l) =>
    !isHome && l.href.startsWith('#') ? { ...l, href: `/${l.href}` } : l
  );
  return isHome ? resolved : [HOME, ...resolved];
}

/**
 * Site chrome in the sumi-e register: no bar, no border — the paper runs
 * through. The only solid colour is the hanko CTA. After some scroll the nav
 * gains a translucent paper backing and a thin brush rule.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const transition = useGalleryTransition();
  const links = linksFor(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Le lien mène à la galerie depuis toutes les pages : on la précharge pour
  // que les portes s'ouvrent sur une page déjà prête.
  useEffect(() => {
    if (pathname !== GALLERY) router.prefetch(GALLERY);
  }, [router, pathname]);

  /**
   * Réalisations passe par la donne de polaroids, comme le bouton de la
   * page d'accueil — sinon le lien de la navbar sautait l'animation. Le
   * provider retombe sur une navigation simple si le mouvement est réduit ou
   * si le jeu est vide, donc le href reste la vraie destination.
   */
  const onNavClick = (event, href) => {
    if (href !== GALLERY || pathname === GALLERY) return;
    if (!transition || transition.active) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

    event.preventDefault();
    setOpen(false);
    transition.start({ href });
  };

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    // Not scrolled-styled while the menu is open: its backdrop-filter, like a
    // transform, makes the header the containing block of fixed children, so
    // the overlay shrank to the height of the bar. The menu covers the page
    // anyway, and it now looks the same whatever the scroll position.
    <header className={`nav${scrolled && !open ? ' nav--scrolled' : ''}`}>
      {/* The mark laid flat, top left. It stays when the phone menu opens: the
          overlay sits below the header row. */}
      <a className="nav__brand" href="/" aria-label="Pencilsline Tattoo, accueil">
        <PencilslineLogo layout="horizontal" seed={8} />
      </a>

      <nav className="nav__links" aria-label="Navigation principale">
        {links.map((l, i) => (
          <a
            key={l.href}
            className="brush-link"
            href={l.href}
            aria-current={l.href === pathname ? 'page' : undefined}
            onClick={(e) => onNavClick(e, l.href)}
          >
            {l.label}
            <span className="brush-link__dash" aria-hidden="true">
              <InkStroke length={70} thickness={2.8} seed={31 + i} color="#b31b1b" />
            </span>
          </a>
        ))}
        <SealStamp href="/contact" seed={9} small>
          Prendre RDV
        </SealStamp>
      </nav>

      <button
        type="button"
        className={`nav__toggle${open ? ' is-open' : ''}`}
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
        // data-lenis-prevent: on a short screen the menu scrolls on its own,
        // which Lenis would otherwise swallow as page scroll.
        <div className="nav__overlay" data-lenis-prevent>
          <nav aria-label="Navigation mobile">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                aria-current={l.href === pathname ? 'page' : undefined}
                onClick={(e) => {
                  onNavClick(e, l.href);
                  setOpen(false);
                }}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <SealStamp href="/contact" seed={9}>
            Prendre rendez-vous
          </SealStamp>

          <div className="nav__social">
            <p className="nav__social-label" id="nav-social-label">
              Me suivre
            </p>
            <ul aria-labelledby="nav-social-label">
              {SOCIALS.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      {s.icon}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="nav__rule" aria-hidden="true">
        <InkStroke length={900} thickness={1.7} seed={77} rough={1.2} />
      </div>
    </header>
  );
}
