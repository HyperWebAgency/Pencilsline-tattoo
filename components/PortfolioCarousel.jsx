'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import GalleryTransition from './GalleryTransition';
import Lightbox from './Lightbox';

/** Empty slots until real photos are passed in — no drawn placeholders. */
const DEFAULT_COUNT = 6;

/** Which offsets are on screen: three across, plus one peeking off the right. */
const FIRST_VISIBLE = -1;
const LAST_VISIBLE = 2;

const Chevron = ({ dir }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d={dir === 'prev' ? 'M15 5 L8 12 L15 19' : 'M9 5 L16 12 L9 19'}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Portfolio carousel with a folded-panorama perspective.
 *
 * `images` accepts plain src strings or { src, alt } objects. With no images,
 * empty paper slots render so the layout can be judged before photos exist.
 *
 * 3D: the viewport is the perspective parent (slides are its direct children,
 * `transform-style: preserve-3d`); each slide carries ONE combined transform —
 * translate3d(step) rotateY(±rot) scale(s) — with transform-origin on the
 * inner edge. Positive rotateY on the left slide brings its outer edge toward
 * the viewer; the right slide mirrors with the negative angle.
 *
 * Slides are absolutely stacked and pushed apart with translate3d, so looping
 * is modular arithmetic — no cloned nodes. Only transform and opacity animate.
 */
export default function PortfolioCarousel({
  images = [],
  heading = 'Réalisations',
  id = 'realisations',
  galleryHref = '/portfolio',
}) {
  const items = images.length
    ? images.map((im, i) =>
        typeof im === 'string' ? { src: im, alt: `Réalisation ${i + 1}` } : im
      )
    : Array.from({ length: DEFAULT_COUNT }, () => null);
  const count = items.length;

  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(null); // lightbox index, or null
  const viewportRef = useRef(null);
  const openerRef = useRef(null);
  // `moved` distinguishes a swipe from a tap, so a drag never opens a photo.
  const drag = useRef({ on: false, startX: 0, dx: 0, moved: false });
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const go = useCallback((dir) => setActive((a) => (a + dir + count) % count), [count]);

  // Shortest way round the ring, so slide 0 sits next to slide n-1.
  const offsetOf = (i) => {
    let d = i - active;
    if (d > count / 2) d -= count;
    if (d < -count / 2) d += count;
    return d;
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    }
  };

  // Drag/swipe writes a CSS variable instead of React state: no re-render per
  // pointermove, so the slides track the finger at full frame rate.
  const setDragOffset = (px) => {
    viewportRef.current?.style.setProperty('--pf-drag', `${px}px`);
  };

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    // Never start a drag on the arrows: capturing the pointer would retarget
    // pointerup to the viewport and swallow the button's click. The slides are
    // buttons too, so this must target the arrows specifically — otherwise
    // dragging dies the moment the slides become clickable.
    if (e.target.closest('.pf__arrow')) return;
    drag.current = {
      on: true,
      startX: e.clientX,
      dx: 0,
      moved: false,
      // Remembered because pointer capture retargets pointerup to the viewport,
      // so a slide's own click event never fires on desktop.
      target: e.target.closest('.pf__open'),
    };
    viewportRef.current?.classList.add('is-dragging');
    try {
      viewportRef.current?.setPointerCapture(e.pointerId);
    } catch {
      // Capture is a nicety; dragging still works without it.
    }
  };

  const onPointerMove = (e) => {
    if (!drag.current.on) return;
    drag.current.dx = e.clientX - drag.current.startX;
    if (Math.abs(drag.current.dx) > 5) drag.current.moved = true;
    setDragOffset(drag.current.dx);
  };

  /**
   * Centre slide opens the photo; a side slide steps to it first.
   * Runs from pointerup (desktop, where capture eats the click) and from the
   * real click event (keyboard). Both paths are idempotent.
   */
  const activateSlide = (el) => {
    if (!el) return;
    const i = Number(el.dataset.i);
    const pos = Number(el.dataset.pos);
    if (pos === 0) {
      openerRef.current = el;
      setZoomed(i);
    } else {
      setActive(i);
    }
  };

  const endDrag = () => {
    if (!drag.current.on) return;
    const { dx, moved, target } = drag.current;
    drag.current.on = false;
    viewportRef.current?.classList.remove('is-dragging');
    setDragOffset(0);
    if (dx <= -55) go(1);
    else if (dx >= 55) go(-1);
    else if (!moved) activateSlide(target); // a tap, not a swipe
  };

  useEffect(() => () => setDragOffset(0), []);

  return (
    <section className="pf" id={id} aria-labelledby={`pf-title-${uid}`}>
      <h2 className="pf__title" id={`pf-title-${uid}`}>
        {heading}
      </h2>

      <div className="pf__dots" role="tablist" aria-label="Choisir une réalisation">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            className={`pf__dot${i === active ? ' is-active' : ''}`}
            aria-selected={i === active}
            aria-label={`Aller à la réalisation ${i + 1} sur ${count}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>

      {/* The arrows live here, outside the viewport: inside it, preserve-3d
          sorts by 3D position and the slides paint over them whatever the
          z-index says. */}
      <div className="pf__stage">
      <div
        className="pf__viewport"
        ref={viewportRef}
        role="group"
        aria-roledescription="carrousel"
        aria-label={heading}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        {items.map((item, i) => {
          const pos = offsetOf(i);
          const onScreen = pos >= FIRST_VISIBLE && pos <= LAST_VISIBLE;
          const side = pos === 0 ? 0 : Math.sign(pos);

          // Inner edge is the pivot: left slide pivots on its right edge,
          // right slides on their left edge.
          const origin = pos === 0 ? '50% 50%' : side < 0 ? 'right center' : 'left center';
          // ONE combined transform. +rot on the left slide swings its outer
          // (left) edge toward the viewer; the right side mirrors it.
          const fold =
            pos === 0
              ? 'rotateY(0deg) scale(1)'
              : `rotateY(calc(${side < 0 ? '1' : '-1'} * var(--pf-rot))) scale(var(--pf-side-scale))`;
          const step = pos === 0 ? '0px' : `(${pos} * var(--pf-step))`;

          return (
            <div
              key={i}
              className={`pf__slide${pos === 0 ? ' is-active' : ''}${
                pos === LAST_VISIBLE ? ' is-peek' : ''
              }`}
              role="group"
              aria-roledescription="diapositive"
              aria-label={`${i + 1} sur ${count}`}
              aria-hidden={!onScreen || !item}
              style={{
                transformOrigin: origin,
                transform: `translate3d(calc(-50% + ${step} + var(--pf-drag, 0px)), -50%, 0) ${fold}`,
                opacity: onScreen ? undefined : 0,
                pointerEvents: onScreen ? undefined : 'none',
                willChange: onScreen ? 'transform, opacity' : 'auto',
                zIndex: onScreen ? 10 - Math.abs(pos) : 0,
              }}
            >
              {item && (
                <button
                  type="button"
                  className="pf__open"
                  tabIndex={onScreen ? 0 : -1}
                  data-i={i}
                  data-pos={pos}
                  aria-label={
                    pos === 0 ? `Agrandir : ${item.alt}` : `Voir la réalisation ${i + 1}`
                  }
                  onClick={(e) => activateSlide(e.currentTarget)}
                >
                  <img
                    src={item.src}
                    alt={item.alt || ''}
                    draggable={false}
                    loading={Math.abs(pos) <= 1 ? 'eager' : 'lazy'}
                  />
                </button>
              )}
            </div>
          );
        })}
      </div>

        <button
          type="button"
          className="pf__arrow pf__arrow--prev"
          aria-label="Réalisation précédente"
          onClick={() => go(-1)}
        >
          <Chevron dir="prev" />
        </button>
        <button
          type="button"
          className="pf__arrow pf__arrow--next"
          aria-label="Réalisation suivante"
          onClick={() => go(1)}
        >
          <Chevron dir="next" />
        </button>
      </div>

      {galleryHref ? (
        <GalleryTransition images={items.filter(Boolean)} href={galleryHref} />
      ) : null}

      {zoomed !== null && (
        <Lightbox
          photos={items.filter(Boolean)}
          index={zoomed}
          onClose={() => {
            setZoomed(null);
            openerRef.current?.focus();
          }}
          onIndexChange={(i) => {
            setZoomed(i);
            setActive(i); // keep the carousel in step with what was viewed
          }}
        />
      )}

      <p className="visually-hidden" aria-live="polite">
        Réalisation {active + 1} sur {count}
      </p>
    </section>
  );
}
