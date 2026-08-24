'use client';

import { useId, useMemo } from 'react';

const STEP = 7; // px advanced per growth step
const DOWN = Math.PI / 2; // straight down in SVG coords (+y is down)
const MAX_DEPTH = 3;
const TAU = Math.PI * 2;
const KNUCKLE_CHANCE = 0.14;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Shortest signed angular distance from `from` to `to`. */
const angleTo = (to, from) => Math.atan2(Math.sin(to - from), Math.cos(to - from));

const f = (v) => Math.round(v * 100) / 100;
const deg = (rad) => f((rad * 180) / Math.PI);

/**
 * Grows one limb from (x, y) and recurses into children.
 * Everything is generated with the attachment point at (0, 0).
 */
function grow(state, x, y, angle, length, width, depth) {
  const { rnd, opts, out } = state;
  const steps = Math.max(4, Math.round(length / STEP));

  const spine = [];
  let cx = x;
  let cy = y;
  let a = angle;

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    spine.push({ x: cx, y: cy, a, hw: 0.5 * width * Math.pow(1 - t, 0.75) });

    // Wander, then occasionally throw a hard knuckle — the abrupt joints are
    // what make this read as cherry wood rather than a fern.
    a += (rnd() - 0.5) * 0.22;
    if (rnd() < KNUCKLE_CHANCE) a += (rnd() - 0.5) * 1.05;

    // Gravity steers the heading toward vertical instead of rotating the step by
    // a fixed amount, so a limb can travel up-left and still have hanging twigs.
    a += angleTo(DOWN, a) * opts.gravity * (0.15 + 0.55 * t);

    cx += Math.cos(a) * STEP;
    cy += Math.sin(a) * STEP;
  }

  // Filled outline from the centreline offset by half-width on each side, so the
  // taper is real geometry rather than a stroke width.
  const poly = [];
  for (let i = 0; i < spine.length; i += 1) {
    const p = spine[i];
    poly.push([p.x - Math.sin(p.a) * p.hw, p.y + Math.cos(p.a) * p.hw]);
  }
  for (let i = spine.length - 1; i >= 0; i -= 1) {
    const p = spine[i];
    poly.push([p.x + Math.sin(p.a) * p.hw, p.y - Math.cos(p.a) * p.hw]);
  }
  out.branches.push(poly);

  for (let i = 0; i < spine.length; i += 3) out.anchors.push(spine[i]);

  if (depth > 0) {
    const kids = Math.max(1, Math.round((1.6 + rnd() * 1.6) * (0.6 + 0.4 * opts.density)));
    let side = rnd() < 0.5 ? 1 : -1;
    for (let k = 0; k < kids; k += 1) {
      const t = Math.min(0.95, 0.22 + ((k + rnd()) / kids) * 0.72);
      const anchor = spine[Math.max(1, Math.round(t * steps))];
      grow(
        state,
        anchor.x,
        anchor.y,
        anchor.a + side * (0.45 + rnd() * 0.55),
        length * (0.38 + rnd() * 0.26),
        // Taken from the parent's local width at the joint, not its base width,
        // so a child never starts thicker (or hairline-thinner) than its socket.
        Math.max(0.5, anchor.hw * 2 * (0.62 + rnd() * 0.22)),
        depth - 1,
      );
      side *= -1;
    }
    return;
  }

  // Depth-0 twigs carry the blossoms.
  if (rnd() < Math.min(0.9, 0.35 + 0.4 * opts.density)) {
    const anchor = spine[Math.min(steps, Math.round((0.45 + rnd() * 0.55) * steps))];
    const cluster = rnd() < 0.28 ? 3 : 1;
    for (let c = 0; c < cluster; c += 1) {
      const spread = cluster === 1 ? 0 : (3.4 + rnd() * 3.4) * opts.scale;
      const dir = rnd() * TAU;
      out.blossoms.push({
        x: anchor.x + Math.cos(dir) * spread,
        y: anchor.y + Math.sin(dir) * spread,
        r: (3 + rnd() * 1.8) * opts.scale,
        rot: rnd() * TAU,
        bud: rnd() < 0.3,
        o: 0.84 + rnd() * 0.16,
      });
    }
  }
}

function buildGeometry(opts) {
  const rnd = mulberry32(opts.seed * 2654435761 + 101);
  const out = { branches: [], blossoms: [], splatter: [], anchors: [] };
  const state = { rnd, opts, out };

  grow(state, 0, 0, opts.angle, opts.length, opts.width, MAX_DEPTH);

  // ~26 splatter dots, power-law sized: many tiny, a few large.
  const dots = Math.round(26 * (0.55 + 0.45 * opts.density));
  for (let i = 0; i < dots; i += 1) {
    const a = out.anchors[Math.floor(rnd() * out.anchors.length)] || { x: 0, y: 0 };
    const dist = Math.pow(rnd(), 1.7) * 46 * opts.scale;
    const dir = rnd() * TAU;
    out.splatter.push({
      x: a.x + Math.cos(dir) * dist,
      y: a.y + Math.sin(dir) * dist,
      r: (0.3 + Math.pow(rnd(), 3.2) * 2.6) * opts.scale,
      o: 0.72 + rnd() * 0.28,
    });
  }

  if (opts.mirror) {
    for (const poly of out.branches) for (const p of poly) p[0] = -p[0];
    for (const b of out.blossoms) {
      b.x = -b.x;
      b.rot = -b.rot;
    }
    for (const s of out.splatter) s.x = -s.x;
  }

  // viewBox comes from the geometry itself, so CSS placement never needs
  // hand-tuned numbers for a given seed.
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;
  const hit = (x, y) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };
  for (const poly of out.branches) for (const p of poly) hit(p[0], p[1]);
  for (const b of out.blossoms) {
    hit(b.x - b.r * 1.7, b.y - b.r * 1.7);
    hit(b.x + b.r * 1.7, b.y + b.r * 1.7);
  }
  for (const s of out.splatter) {
    hit(s.x - s.r, s.y - s.r);
    hit(s.x + s.r, s.y + s.r);
  }

  const pad = 6 + opts.displace;
  const box = {
    x: f(minX - pad),
    y: f(minY - pad),
    w: f(maxX - minX + pad * 2),
    h: f(maxY - minY + pad * 2),
  };

  const paths = out.branches.map(
    (poly) => `M${poly.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}Z`,
  );

  return { paths, blossoms: out.blossoms, splatter: out.splatter, box };
}

function Blossom({ b, petal, center }) {
  if (b.bud) {
    return (
      <g fillOpacity={b.o}>
        <ellipse
          cx={f(b.x)}
          cy={f(b.y)}
          rx={f(b.r * 0.5)}
          ry={f(b.r * 0.68)}
          transform={`rotate(${deg(b.rot)} ${f(b.x)} ${f(b.y)})`}
          fill={petal}
        />
        <circle cx={f(b.x)} cy={f(b.y)} r={f(b.r * 0.15)} fill={center} />
      </g>
    );
  }

  const petals = [];
  for (let k = 0; k < 5; k += 1) {
    const a = b.rot + (k * TAU) / 5;
    const px = b.x + Math.cos(a) * b.r * 0.62;
    const py = b.y + Math.sin(a) * b.r * 0.62;
    petals.push(
      <ellipse
        key={k}
        cx={f(px)}
        cy={f(py)}
        rx={f(b.r * 0.54)}
        ry={f(b.r * 0.42)}
        transform={`rotate(${deg(a)} ${f(px)} ${f(py)})`}
        fill={petal}
      />,
    );
  }

  return (
    <g fillOpacity={b.o}>
      {petals}
      <circle cx={f(b.x)} cy={f(b.y)} r={f(b.r * 0.26)} fill={center} />
    </g>
  );
}

/**
 * Procedural sumi-e cherry branch. Same `seed` always yields the same branch.
 * The attachment point is (0, 0) in user space and is also the sway pivot.
 */
export default function InkBranch({
  seed = 1,
  length = 200,
  width = 7,
  angle = 1.05,
  gravity = 0.1,
  density = 1,
  ink = '#141414',
  petal = '#b31b1b',
  center = '#4a0707',
  sway = true,
  mirror = false,
  detail = 'high',
  className,
  style,
  ...rest
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const low = detail === 'low';

  const rough = low ? { octaves: 2, scale: 1.8 } : { octaves: 4, scale: 2.6 };
  const soft = low ? { octaves: 1, scale: 1.8 } : { octaves: 2, scale: 1.9 };

  const geom = useMemo(
    () =>
      buildGeometry({
        seed,
        length,
        width,
        angle,
        gravity,
        density,
        mirror,
        scale: Math.max(0.75, length / 210),
        displace: Math.max(rough.scale, soft.scale),
      }),
    [seed, length, width, angle, gravity, density, mirror, rough.scale, soft.scale],
  );

  const roughId = `ink-rough-${uid}`;
  const softId = `ink-soft-${uid}`;
  const swayName = `ink-sway-${uid}`;
  const swayClass = `ink-swayer-${uid}`;
  const swayOn = sway !== false && sway !== 0;
  const swayDur = typeof sway === 'number' ? sway : 11;
  const region = { x: geom.box.x, y: geom.box.y, width: geom.box.w, height: geom.box.h };

  return (
    <svg
      viewBox={`${geom.box.x} ${geom.box.y} ${geom.box.w} ${geom.box.h}`}
      className={className}
      style={{ display: 'block', width: '100%', height: 'auto', ...style }}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {swayOn && (
        <style>
          {`@keyframes ${swayName}{0%,100%{transform:rotate(-0.85deg)}50%{transform:rotate(0.85deg)}}` +
            `.${swayClass}{transform-box:view-box;transform-origin:0px 0px;` +
            `animation:${swayName} ${swayDur}s ease-in-out infinite;will-change:transform}` +
            `@media (prefers-reduced-motion: reduce){.${swayClass}{animation:none}}`}
        </style>
      )}

      <defs>
        <filter id={roughId} filterUnits="userSpaceOnUse" {...region}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.07"
            numOctaves={rough.octaves}
            seed={seed % 1000}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={rough.scale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <filter id={softId} filterUnits="userSpaceOnUse" {...region}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.14"
            numOctaves={soft.octaves}
            seed={(seed + 17) % 1000}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={soft.scale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      <g className={swayOn ? swayClass : undefined}>
        <g filter={`url(#${roughId})`} fill={ink}>
          {geom.paths.map((d, i) => (
            <path key={`b${i}`} d={d} />
          ))}
          {geom.splatter.map((s, i) => (
            <circle key={`s${i}`} cx={f(s.x)} cy={f(s.y)} r={f(s.r)} fillOpacity={f(s.o)} />
          ))}
        </g>

        <g filter={`url(#${softId})`}>
          {geom.blossoms.map((b, i) => (
            <Blossom key={`f${i}`} b={b} petal={petal} center={center} />
          ))}
        </g>
      </g>
    </svg>
  );
}
