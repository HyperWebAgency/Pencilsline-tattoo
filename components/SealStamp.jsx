'use client';

import { useId } from 'react';

/**
 * Hanko-style call to action: a red seal block with a rough stamped edge.
 * The edge is displaced turbulence (same technique as the branches); the text
 * stays crisp on top, like carved characters inside a rough impression.
 */
export default function SealStamp({ href = '#', seed = 3, small = false, children, className }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const fid = `seal-${uid}`;

  return (
    <a href={href} className={`stamp${small ? ' stamp--sm' : ''}${className ? ` ${className}` : ''}`}>
      <svg viewBox="0 0 200 52" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <filter id={fid} filterUnits="userSpaceOnUse" x="-8" y="-8" width="216" height="68">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.11"
              numOctaves="2"
              seed={seed % 1000}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3.4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        <rect x="3" y="3" width="194" height="46" rx="2.5" filter={`url(#${fid})`} />
      </svg>
      <span>{children}</span>
    </a>
  );
}
