'use client';

import { useEffect, useState } from 'react';
import InkStroke from './InkStroke';

/**
 * Opening title card for the contact page: the artist's name settles onto the
 * washi, an ink stroke sweeps under it, then the whole sheet lifts away.
 *
 * Plays once per browser tab (sessionStorage) so navigating back to the page
 * doesn't replay it, is skippable with a click or any key, and is skipped
 * entirely under prefers-reduced-motion.
 */
/**
 * The card's last line lands at ~1.14s (tail: 0.52s delay + 0.62s rise), so
 * this is that plus a short beat to read it — not a stall.
 *
 * This only holds because the CSS animations are gated on .intro--playing,
 * which is added in the same commit that starts this timer. Left ungated they
 * began at first paint while the timer began at hydration, so the two drifted
 * apart and the card sat there longer the slower the device.
 */
const HOLD_MS = 1400;
/** Must match the .intro transition duration in globals.css. */
const LIFT_MS = 550;

export default function ContactIntro({ artist = 'Alexandra', studio = 'Pencilsline', tail = 'Tattoo' }) {
  // `null` = undecided (first paint, before the motion preference is known).
  const [phase, setPhase] = useState(null);

  useEffect(() => {
    // Plays on every visit to the page — it is the door to the contact page,
    // not a one-off splash. Only a motion preference suppresses it.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('done');
      return undefined;
    }

    setPhase('playing');
    document.body.style.overflow = 'hidden';

    const lift = setTimeout(() => setPhase('lifting'), HOLD_MS);
    const end = setTimeout(() => setPhase('done'), HOLD_MS + LIFT_MS);

    return () => {
      clearTimeout(lift);
      clearTimeout(end);
      document.body.style.overflow = '';
    };
  }, []);

  // Let people out early — but only once the card has actually had a moment on
  // screen. Binding immediately lets a stray pointer event left over from the
  // click that navigated here dismiss the intro before it is even visible.
  useEffect(() => {
    if (phase !== 'playing') return undefined;

    let bound = false;
    const skip = () => setPhase('lifting');
    const arm = setTimeout(() => {
      bound = true;
      window.addEventListener('pointerdown', skip);
      window.addEventListener('keydown', skip);
    }, 450);

    return () => {
      clearTimeout(arm);
      if (bound) {
        window.removeEventListener('pointerdown', skip);
        window.removeEventListener('keydown', skip);
      }
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'done') document.body.style.overflow = '';
    if (phase === 'lifting') {
      const t = setTimeout(() => setPhase('done'), LIFT_MS);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      className={`intro${phase === 'lifting' ? ' intro--lifting' : ''}${
        phase === null ? ' intro--hold' : ' intro--playing'
      }`}
      role="presentation"
      aria-hidden="true"
    >
      <div className="intro__card">
        <span className="intro__artist">{artist}</span>
        <span className="intro__studio">{studio}</span>
        <span className="intro__stroke">
          <InkStroke length={300} thickness={6} seed={61} rough={2.4} />
        </span>
        <span className="intro__tail">{tail}</span>
      </div>
    </div>
  );
}
