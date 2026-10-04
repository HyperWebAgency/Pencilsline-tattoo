'use client';

import { useEffect, useRef, useState } from 'react';
import { isLite } from '@/lib/lite';

/*
 * "Merci" as the pen travels it, stroke by stroke in writing order: the M,
 * "er", "ci", then the dot of the i. From the single-line font EMS Allure
 * (SIL Open Font License; a derivative of Allura by Rob Leuschke), its
 * polylines smoothed into curves and flipped to y-down. Baked in here, so no
 * font ships with the page.
 */
const VIEWBOX = '-77.8 -739 2747.1 838.9';

const STROKES = [
  // M
  'M224 -536C224 -536 280.9 -556.8 302 -570C318.8 -580.5 330.3 -592.3 343 -605C355.7 -617.7 367.5 -631.4 378 -646C388.5 -660.7 395.4 -685 406 -693C412.8 -698.2 424.5 -702.8 428 -699C437.8 -688.3 387 -589 365 -529C340.3 -461.8 315.2 -381.2 287 -315C261.5 -255.2 232.8 -199.6 205 -148C180 -101.7 156.1 -52.3 129 -18.9C108.1 6.8 86.3 27.8 63 41C43 52.3 17.1 64.9 0 59.9C-16.1 55.2 -34.2 32.9 -37.8 15.8C-41.7 -2.4 -31.5 -23.5 -18.9 -47.2C1.8 -86.2 53.1 -138 94.5 -186C141.4 -240.4 193.1 -299.2 249 -356C309.8 -417.8 386.4 -496.7 447 -542C490.9 -574.8 532.5 -598.9 570 -614C598.3 -625.4 623.5 -634.7 649 -633C673.8 -631.3 703.4 -622.7 721 -605C740.8 -585 750.7 -550.2 756 -513C763.5 -460.2 746.8 -373.5 740 -315C734.6 -268.2 730.1 -229.6 721 -189C712.2 -149.9 678.4 -84.6 687 -75.6C691 -71.4 703 -75.3 712 -81.9C732.6 -97 754.2 -151.7 784 -198C829.5 -268.7 914.1 -394.6 961 -463C991.1 -506.8 1009.3 -542.5 1036.3 -570C1058.2 -592.3 1083.3 -615.3 1105.7 -621C1122.9 -625.4 1144.2 -621 1156.1 -614C1165.4 -608.5 1169.9 -599.4 1174.9 -589C1181.3 -575.7 1188.4 -558.8 1187.6 -539C1186.4 -509.1 1163.5 -461.4 1149.8 -428C1138 -399.3 1124.9 -377.3 1111.9 -350C1097.6 -320 1079.2 -285.2 1067.8 -255C1058 -228.9 1049.5 -205.6 1045.8 -180C1042.1 -154.3 1040 -126.7 1045.8 -101C1051.9 -74 1062.3 -33.2 1083.6 -22C1106.3 -10.1 1150.1 -23.2 1181.2 -37.8C1217.9 -55.1 1261.1 -101 1285.2 -129C1301.6 -148.1 1319.8 -183 1319.8 -183',
  // e
  'M1417.4 -170C1417.4 -170 1473.3 -197.3 1499.3 -211C1523.4 -223.7 1550.7 -232.2 1568.3 -249C1584.5 -264.5 1600.9 -287.7 1603.3 -306C1605.3 -321.2 1600.7 -341.4 1590.3 -350C1578.5 -359.8 1553.4 -360.8 1531.3 -356C1497.9 -348.7 1444.2 -306.8 1414.3 -287C1394.6 -274 1382.3 -266.3 1367.1 -252C1349.6 -235.5 1330.9 -212 1316.7 -192C1304.1 -174.3 1291.4 -157.1 1285.2 -139C1279.5 -122.5 1276.2 -104.1 1278.9 -88.2C1281.6 -72.6 1288 -56.2 1300.9 -44.1C1318.2 -27.9 1351.5 -11.9 1382.8 -9.4C1422.5 -6.4 1489.3 -27.5 1521.3 -44.1C1541.7 -54.7 1549.3 -68.3 1565.3 -81.9C1584.4 -98.1 1610.7 -116.8 1628.3 -135C1643.5 -150.7 1666.3 -183 1666.3 -183',
  // r
  'M1665.8 -183C1665.8 -183 1706.3 -248 1731.9 -287C1765.5 -338.2 1859.6 -454.7 1851.3 -463C1844.8 -469.5 1755.5 -411.8 1744.5 -391C1739.5 -381.7 1741.4 -371 1744.5 -365C1746.9 -360.4 1749.8 -358.4 1757.2 -356C1783.5 -347.4 1943.4 -378.5 1955.3 -353C1966.6 -328.8 1873 -259.2 1842.3 -214C1816.2 -175.5 1784.8 -136.3 1779.2 -101C1774.8 -73.2 1778.5 -34.5 1794.9 -22C1812.1 -8.9 1854.4 -15.7 1883.3 -28.4C1921 -45 1966.2 -102.7 1993.3 -132C2011.1 -151.3 2034.3 -183 2034.3 -183',
  // c
  'M2309.3 -306C2309.3 -306 2312.9 -340.2 2305.3 -350C2297.8 -359.8 2280.8 -365.1 2264.3 -365C2238.8 -364.8 2198.9 -348.8 2167.3 -328C2127.2 -301.6 2076.7 -237.2 2050.5 -208C2036.3 -192.2 2028.1 -184.9 2019.1 -170C2008.8 -152.9 1996.3 -128.8 1993.9 -110C1991.9 -94.5 1996 -80.2 2000.2 -66.1C2004.4 -51.9 2006.3 -34.2 2019.1 -25.2C2038.6 -11.4 2086.9 -11.9 2123 -15.8C2164.2 -20.3 2215.6 -37 2252.3 -56.7C2284.6 -74.1 2311.8 -100.1 2334.3 -123C2353.4 -142.4 2381.3 -183 2381.3 -183',
  // i
  'M2380.8 -183C2380.8 -183 2434.9 -212.6 2450.1 -236C2466 -260.4 2474.9 -327.1 2472.2 -328C2467.6 -329.5 2377 -140.1 2374.5 -85.1C2373.2 -57.5 2379.1 -35.2 2393.4 -22C2408.6 -8 2442.4 -0.8 2465.8 -6.3C2493 -12.7 2521.8 -47.5 2544.3 -69.3C2564.2 -88.6 2580.6 -109.1 2595.3 -129C2608.5 -147 2629.3 -183 2629.3 -183',
  // i
  'M2535.3 -476L2506.8 -438',
];

/** Ink line width, in viewBox units (the word is about 840 units tall). */
const LINE = 24;
/** Writing pace in viewBox units per millisecond, and the pause when the pen
 *  lifts between strokes that don't join. */
const SPEED = 3.8;
const LIFT_MS = 170;
const START_MS = 350;
/** Strokes closer than this, end to start, are one continuous movement. */
const JOIN = 20;
/** Fully hidden dash offset. Just past 1, with a dash array of "1 2" (see
 *  .merci-ink__line): at exactly 1 the round cap of an empty dash still
 *  printed a dot at the end of every unwritten stroke. */
const HIDDEN = 1.01;

/**
 * Writes « Merci » letter by letter: each stroke's line is revealed along the
 * pen's path at a steady pace, pausing where the pen lifts between strokes
 * that don't join. Plays once. Under prefers-reduced-motion, or in lite
 * mode, the word is simply there.
 *
 * The line starts hidden in CSS (pathLength="1" makes the dash maths
 * length-free), so the word never flashes complete before it is written;
 * the page carries a <noscript> rule that shows it without JavaScript.
 */
export default function InkMerci() {
  const pathRefs = useRef([]);
  const [still, setStill] = useState(false);

  useEffect(() => {
    // Lite mode (lib/lite.js): re-filtering the ink every frame is too dear.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || isLite()) {
      setStill(true);
      return undefined;
    }

    const paths = pathRefs.current;
    if (paths.some((p) => !p)) {
      setStill(true);
      return undefined;
    }

    // The timeline: each stroke's start time and duration, with a pause
    // before it when the pen has to lift to get there.
    const lengths = paths.map((p) => p.getTotalLength());
    let t = START_MS;
    const plan = paths.map((path, i) => {
      if (i > 0) {
        const end = paths[i - 1].getPointAtLength(lengths[i - 1]);
        const start = path.getPointAtLength(0);
        if (Math.hypot(start.x - end.x, start.y - end.y) > JOIN) t += LIFT_MS;
      }
      const step = { start: t, duration: lengths[i] / SPEED };
      t += step.duration;
      return step;
    });
    const end = t;

    let frame = 0;
    let begun = null;

    // Done strokes whole, the current one up to the pen, the rest hidden.
    const draw = (now) => {
      if (begun === null) begun = now;
      const elapsed = now - begun;
      plan.forEach((step, i) => {
        const p = Math.min(1, Math.max(0, (elapsed - step.start) / step.duration));
        paths[i].style.strokeDashoffset = String(HIDDEN * (1 - p));
      });
      if (elapsed <= end) frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <span className={`merci-ink${still ? ' is-still' : ''}`} aria-hidden="true">
      <svg viewBox={VIEWBOX} focusable="false">
        <defs>
          {/* The site's one brush: the same turbulence-displaced edge as
              InkStroke and the branches, scaled to this viewBox. */}
          <filter id="merci-rough" filterUnits="userSpaceOnUse" x="-120" y="-780" width="2830" height="920">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="17" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter="url(#merci-rough)">
          {STROKES.map((d, i) => (
            <path
              key={d}
              ref={(el) => {
                pathRefs.current[i] = el;
              }}
              className="merci-ink__line"
              d={d}
              pathLength="1"
              strokeWidth={LINE}
            />
          ))}
        </g>
      </svg>
    </span>
  );
}
