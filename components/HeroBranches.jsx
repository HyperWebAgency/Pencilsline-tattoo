'use client';

import { useEffect, useState } from 'react';
import InkBranch from './InkBranch';

/**
 * The two hero branches, positioned. Drop inside a `position: relative` hero.
 * Contains no hero markup of its own.
 *
 * Below 640px only the top-left branch renders (two branches squeeze the
 * headline from both sides on a phone) and it drops to `detail="low"`, because
 * SVG filters are expensive on mobile Safari.
 *
 * The branches are fully static: no sway, no pointer parallax.
 */
export default function HeroBranches() {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const shell = { position: 'absolute', pointerEvents: 'none' };

  return (
    <>
      <div
        aria-hidden="true"
        style={{ ...shell, top: -40, left: -70, width: 'clamp(170px, 46vw, 440px)' }}
      >
        <InkBranch
          seed={7997}
          angle={1.05}
          length={215}
          sway={false}
          detail={narrow ? 'low' : 'high'}
        />
      </div>

      {!narrow && (
        <div
          aria-hidden="true"
          style={{ ...shell, bottom: -50, right: -60, width: 'clamp(240px, 30vw, 420px)' }}
        >
          <InkBranch
            seed={8185}
            angle={3.62}
            length={205}
            width={6.2}
            gravity={0.05}
            density={0.42}
            sway={false}
          />
        </div>
      )}
    </>
  );
}
