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
  layout = 'vertical',
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
  if (layout === 'horizontal') {
    return (
      <HorizontalMark
        {...{ uid, ink, seal, paper, seed, className, style, title }}
      />
    );
  }

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

// The horizontal mark's geometry, in viewBox units. Frame and field keep the
// vertical mark's relations: the frame's centre line 5.3 outside the field,
// a 4.5 stroke, so the same paper gap shows between them.
const H_FIELD = { x: 40.5, y: 7.5, w: 236, h: 34 };
// Paper left inside the field at each end, so the first P and the last E
// don't run into the frame once the stamp filter roughens the edges.
const H_FIELD_PAD = 7;
const H_FONT_SIZE = 27;
// Stretched wide like the vertical mark's letters, which is what makes them
// read as carved seal script; narrow glyphs stretch less.
const H_WIDTH_FRACTION = { I: 0.5, L: 0.8 };
const H_DEFAULT_FRACTION = 0.9;
// Thinner than the vertical mark's erosion: at navbar size the full stroke ate
// the letters down to hairlines.
const H_EROSION = 0.85;

/**
 * The same mark laid out in a row, for the navbar: the ink dot, then the hanko
 * on its side with PENCILSLINE reading left to right — letters upright, so it
 * still reads as a name — then TATTOO tracked out after it. Sized by height:
 * give it one and the width follows the viewBox (420 × 49).
 */
function HorizontalMark({ uid, ink, seal, paper, seed, className, style, title }) {
  const stampId = `logo-stamp-h-${uid}`;
  const { x, y, w, h } = H_FIELD;
  const cell = (w - 2 * H_FIELD_PAD) / LETTERS.length;

  return (
    <svg
      viewBox="0 0 420 49"
      role="img"
      aria-label={title}
      className={className}
      style={{ display: 'block', height: '100%', width: 'auto', ...style }}
    >
      <defs>
        <filter id={stampId} filterUnits="userSpaceOnUse" x={x - 9} y="0" width={w + 18} height="49">
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

      {/* round ink dot, a touch above centre as it sits a touch off-axis in
          the vertical mark */}
      <circle cx="9.5" cy="22" r="9.5" fill={ink} />

      <g filter={`url(#${stampId})`}>
        <rect
          x={x - 5.3}
          y={y - 5.3}
          width={w + 10.6}
          height={h + 10.6}
          rx="2"
          fill="none"
          stroke={seal}
          strokeWidth="4.5"
        />
        <rect x={x} y={y} width={w} height={h} fill={seal} />
        {LETTERS.map((ch, i) => (
          <text
            key={`${ch}${i}`}
            x={x + H_FIELD_PAD + cell * (i + 0.5)}
            y={y + h / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill={paper}
            fontFamily="var(--font-seal), 'Roboto Slab', Georgia, serif"
            fontSize={H_FONT_SIZE}
            textLength={(cell * (H_WIDTH_FRACTION[ch] ?? H_DEFAULT_FRACTION)).toFixed(1)}
            lengthAdjust="spacingAndGlyphs"
            stroke={seal}
            strokeWidth={H_EROSION}
            strokeLinejoin="round"
          >
            {ch}
          </text>
        ))}
      </g>

      <text
        x={x + w + 5.3 + 2.25 + 13}
        y={y + h / 2}
        dominantBaseline="central"
        fill={ink}
        fontFamily="var(--font-serif), Georgia, serif"
        fontWeight="500"
        fontSize="21"
        letterSpacing="0.34em"
        stroke={ink}
        strokeWidth="0.45"
      >
        TATTOO
      </text>
    </svg>
  );
}
