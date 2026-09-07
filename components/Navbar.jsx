'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import InkStroke from './InkStroke';
import NoticeDialog from './NoticeDialog';
import SealStamp from './SealStamp';
import { useGalleryTransition } from './TransitionProvider';

const GALLERY = '/portfolio';
/** Univers has no section to scroll to yet — say so instead of going nowhere. */
const UNBUILT = '#univers';

const HOME = { href: '/', label: 'Accueil' };

const LINKS = [
  { href: '/portfolio', label: 'Réalisations' },
  { href: '#univers', label: 'Univers' },
  { href: '/contact', label: 'Contact' },
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
  const [notice, setNotice] = useState(false);
  const noticeOpener = useRef(null);
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
    if (href.endsWith(UNBUILT)) {
      event.preventDefault();
      noticeOpener.current = event.currentTarget;
      setOpen(false);
      setNotice(true);
      return;
    }

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
    <header className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
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
        </div>
      )}

      <div className="nav__rule" aria-hidden="true">
        <InkStroke length={900} thickness={1.7} seed={77} rough={1.2} />
      </div>

      {notice && (
        <NoticeDialog
          title="Section en construction"
          onClose={() => {
            setNotice(false);
            noticeOpener.current?.focus();
          }}
        >
          <p>
            La section <em>Univers</em> n&apos;est pas encore en ligne : elle
            reste à construire.
          </p>
          <p>
            En attendant, les <strong>Réalisations</strong> montrent le travail,
            et la page <strong>Contact</strong> permet de prendre rendez-vous.
          </p>
        </NoticeDialog>
      )}
    </header>
  );
}
