'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Full-viewport canvas cursor trail.
 *
 * A chain of `points` springs, each pulled toward the point ahead of it and
 * damped by `friction`. Point 0 chases the real pointer with a softer spring so
 * the head trails the cursor instead of snapping onto it. The chain is drawn as
 * one continuous quadratic path whose lineWidth tapers to a point at the tail.
 *
 * Renders nothing when prefers-reduced-motion is set.
 */
export default function CursorTrail({
  points = 40,
  spring = 0.4,
  friction = 0.5,
  widthFactor = 0.3,
  color = '#141414',
  idle = true,
  zIndex = 9999,
  className,
}) {
  const canvasRef = useRef(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reduced) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const n = Math.max(2, Math.round(points));
    const idleOn = idle !== false && idle !== 0;
    const idleSpeed = typeof idle === 'number' ? idle : 1;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let frame = 0;
    let moved = false;
    const started = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const pointer = { x: width / 2, y: height / 2 };
    const trail = new Array(n);
    for (let i = 0; i < n; i += 1) {
      trail[i] = { x: pointer.x, y: pointer.y, dx: 0, dy: 0 };
    }

    // Sizing the bitmap resets every context property, so styles are re-applied here.
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
    };

    const setPointer = (x, y) => {
      moved = true;
      pointer.x = x;
      pointer.y = y;
    };

    const onMouseMove = (e) => setPointer(e.clientX, e.clientY);
    const onClick = (e) => setPointer(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        setPointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const render = (now) => {
      frame = window.requestAnimationFrame(render);

      if (!moved && idleOn) {
        const t = (now - started) * 0.001 * idleSpeed;
        pointer.x = width * 0.5 + Math.sin(t * 1.1) * width * 0.32;
        pointer.y = height * 0.5 + Math.sin(t * 1.7 + Math.PI / 3) * height * 0.28;
      }

      let lead = pointer;
      for (let i = 0; i < n; i += 1) {
        const p = trail[i];
        const k = i === 0 ? spring * 0.4 : spring;
        p.dx += (lead.x - p.x) * k;
        p.dy += (lead.y - p.y) * k;
        p.dx *= friction;
        p.dy *= friction;
        p.x += p.dx;
        p.y += p.dy;
        lead = p;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);

      for (let i = 1; i < n - 1; i += 1) {
        const mx = (trail[i].x + trail[i + 1].x) * 0.5;
        const my = (trail[i].y + trail[i + 1].y) * 0.5;
        ctx.quadraticCurveTo(trail[i].x, trail[i].y, mx, my);
        ctx.lineWidth = Math.max(0.1, widthFactor * (n - i));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mx, my);
      }

      ctx.lineTo(trail[n - 1].x, trail[n - 1].y);
      ctx.lineWidth = Math.max(0.1, widthFactor);
      ctx.stroke();
    };

    resize();
    frame = window.requestAnimationFrame(render);

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('click', onClick);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('click', onClick);
    };
  }, [reduced, points, spring, friction, widthFactor, color, idle]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex,
      }}
    />
  );
}
