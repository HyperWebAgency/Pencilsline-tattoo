'use client';

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useEffect } from 'react';
import { isLite, onLite, watchFrames } from '@/lib/lite';

/**
 * Lenis smooth scrolling, mounted once in the root layout.
 *
 * Scroll is user-driven, so this is not decor moving on its own — it only
 * changes how the page follows the wheel. Skipped entirely under
 * prefers-reduced-motion, where easing is the wrong answer, and in lite mode,
 * where it is the dearest thing on the page: it re-scrolls from JavaScript on
 * every frame. Mounted on every page, it also runs the frame watch that
 * decides lite mode (lib/lite.js).
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || isLite()) {
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

    let running = true;
    const stopLenis = () => {
      if (running) lenis.destroy();
      running = false;
    };

    // Switched to lite mid-visit: back to native scrolling on the spot.
    const offLite = onLite(stopLenis);
    const stopWatch = watchFrames();

    return () => {
      offLite();
      stopWatch();
      stopLenis();
    };
  }, []);

  return null;
}
