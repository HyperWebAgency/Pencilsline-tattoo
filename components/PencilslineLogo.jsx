'use client';

import { useId } from 'react';

const LETTERS = 'PENCILSLINE'.split('');

// Measured from the artist's reference: letters are stretched horizontally to
// fill the seal (like carved seal script). Width as a fraction of the field,
// per letter — narrow glyphs stretch a little less.
const WIDTH_FRACTION = { I: 0.63, L: 0.68 };
const DEFAULT_FRACTION = 0.74;

// One dial for the carved letters' size. Height, width and the erosion stroke
// all scale together, so shrinking them doesn't also make them look thinner.
const LETTER_SCALE = 0.9;
const BASE_FONT_SIZE = 26;
const BASE_EROSION = 1.4;

/**
 * The Pencilsline mark, rebuilt as vector from the artist's reference:
 * a round black dot over a tall red hanko — PENCILSLINE carved vertically in
 * paper (white-on-red intaglio, ultra-bold slab serif stretched to fill the
 * seal) inside a stamped frame — with TATTOO tracked out underneath.
 * Geometry follows the reference crop (170 × 406).
 */
export default function PencilslineLogo({
  ink = '#171514',
  seal = '#791010',
  paper = '#f3efe5',
  caption = true,
  seed = 6,
  className,
  style,
  title = 'Pencilsline Tattoo',
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const stampId = `logo-stamp-${uid}`;

  const viewH = caption ? 406 : 352;
  const fieldW = 45;

  return (
    <svg
      viewBox={`0 0 170 ${viewH}`}
      role="img"
      aria-label={title}
      className={className}
      style={{ display: 'block', width: '100%', height: 'auto', ...style }}
    >
      <defs>
        <filter id={stampId} filterUnits="userSpaceOnUse" x="38" y="47" width="94" height="300">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.055"
            numOctaves="2"
            seed={seed + 11}
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {/* round ink dot */}
      <circle cx="69" cy="27" r="12" fill={ink} />

      {/* hanko: frame, inset paper gap, solid field, carved letters */}
      <g filter={`url(#${stampId})`}>
        <rect x="48.2" y="57.2" width="55.6" height="278.6" rx="2" fill="none" stroke={seal} strokeWidth="4.5" />
        <rect x="53.5" y="62.5" width={fieldW} height="268" fill={seal} />
        {LETTERS.map((ch, i) => (
          <text
            key={`${ch}${i}`}
            x="76"
            y={62.5 + (268 / LETTERS.length) * (i + 0.5)}
            textAnchor="middle"
            dominantBaseline="central"
            fill={paper}
            fontFamily="var(--font-seal), 'Roboto Slab', Georgia, serif"
            fontSize={(BASE_FONT_SIZE * LETTER_SCALE).toFixed(2)}
            textLength={(
              fieldW *
              (WIDTH_FRACTION[ch] ?? DEFAULT_FRACTION) *
              LETTER_SCALE
            ).toFixed(1)}
            lengthAdjust="spacingAndGlyphs"
            stroke={seal}
            strokeWidth={(BASE_EROSION * LETTER_SCALE).toFixed(2)}
            strokeLinejoin="round"
          >
            {ch}
          </text>
        ))}
      </g>

      {caption && (
        <text
          x="82"
          y="384"
          textAnchor="middle"
          fill={ink}
          fontFamily="var(--font-serif), Georgia, serif"
          fontWeight="500"
          fontSize="15.5"
          letterSpacing="0.42em"
          stroke={ink}
          strokeWidth="0.45"
        >
          TATTOO
        </text>
      )}
    </svg>
  );
}
