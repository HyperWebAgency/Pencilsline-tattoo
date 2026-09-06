'use client';

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useEffect } from 'react';

/**
 * Lenis smooth scrolling, mounted once in the root layout.
 *
 * Scroll is user-driven, so this is not decor moving on its own — it only
 * changes how the page follows the wheel. Skipped entirely under
 * prefers-reduced-motion, where easing is the wrong answer.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.1,
      // Quick to respond, unhurried to settle.
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      // Touch devices have native momentum already; syncing it feels worse.
      syncTouch: false,
      // Let Lenis ease #realisations links instead of the browser jumping.
      anchors: true,
      autoRaf: true,
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
