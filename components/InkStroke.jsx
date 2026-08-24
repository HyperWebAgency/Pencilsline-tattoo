'use client';

import { useId, useMemo } from 'react';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (v) => Math.round(v * 100) / 100;

/**
 * A single dry-brush dash: a tapered filled outline (real geometry, not a
 * stroke) roughened by the same feTurbulence + feDisplacementMap treatment as
 * the branches, so every line on the site comes from the same brush.
 * Deterministic per seed — safe to server-render.
 */
export default function InkStroke({
  length = 120,
  thickness = 3,
  seed = 1,
  color = '#171514',
  rough,
  vertical = false,
  className,
  style,
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const scale = rough ?? Math.min(2.6, 0.6 + thickness * 0.55);

  const geom = useMemo(() => {
    const rnd = mulberry32(seed * 2654435761 + 13);
    const steps = Math.max(7, Math.round(length / 12));
    const pts = [];
    // Slightly asymmetric width profile: full near the start, pulled out to a
    // point at the tail, like a stroke lifted off the paper.
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const along = t * length;
      const waver = (rnd() - 0.5) * thickness * 0.42;
      const hw = Math.max(
        0.14,
        0.5 * thickness * Math.pow(Math.sin(Math.PI * (0.06 + 0.94 * t)), 0.5) * (1 - 0.35 * t),
      );
      pts.push(vertical ? { x: waver, y: along, hw } : { x: along, y: waver, hw });
    }
    const side = (p, s) => (vertical ? `${f(p.x + s * p.hw)} ${f(p.y)}` : `${f(p.x)} ${f(p.y + s * p.hw)}`);
    const top = pts.map((p) => side(p, -1));
    const bot = [...pts].reverse().map((p) => side(p, 1));
    return `M${top.join('L')}L${bot.join('L')}Z`;
  }, [length, thickness, seed, vertical]);

  const pad = scale + 2;
  const w = vertical ? thickness : length;
  const h = vertical ? length : thickness;
  const box = { x: f(-pad), y: f(-pad), w: f(w + pad * 2), h: f(h + pad * 2) };
  const fid = `stroke-${uid}`;

  return (
    <svg
      viewBox={`${box.x} ${vertical ? box.y : f(-thickness / 2 - pad)} ${box.w} ${vertical ? box.h : f(thickness + pad * 2)}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    >
      <defs>
        <filter
          id={fid}
          filterUnits="userSpaceOnUse"
          x={box.x}
          y={vertical ? box.y : f(-thickness / 2 - pad)}
          width={box.w}
          height={vertical ? box.h : f(thickness + pad * 2)}
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.16"
            numOctaves="2"
            seed={seed % 1000}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={f(scale)}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <path d={geom} fill={color} filter={`url(#${fid})`} />
    </svg>
  );
}
