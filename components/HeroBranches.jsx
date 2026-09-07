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

  // Anchored into the corner and running off both edges, so it reads as growing
  // in from outside the frame — the same move as the bottom-right branch, which
  // sits at bottom:-50 / right:-60.
  const topLeft = {
    ...shell,
    top: -62,
    left: -145,
    width: 'clamp(170px, 43vw, 415px)',
  };

  return (
    <>
      <div aria-hidden="true" style={topLeft}>
        <InkBranch
          seed={7997}
          /* Mirrors the bottom-right branch. That one grows at 3.62 rad — left
             and slightly up, out of its corner — so the reflection is right and
             slightly down. Gravity matches it too: on the default 0.1 the limb
             folded downwards and slid off the left edge instead of reaching
             across the frame. */
          angle={0.45}
          gravity={0.05}
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
