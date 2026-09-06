'use client';

import { useCallback, useEffect, useRef } from 'react';

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
 * Full-screen image viewer, shared by the gallery grid and the home carousel.
 *
 * Keyboard-complete: arrows navigate, Escape closes, Tab cycles inside. Focus
 * moves in on open and the caller restores it on close. Swipe left/right on
 * touch. No captions — the work speaks for itself; alt text carries the
 * meaning for screen readers and image search.
 */
export default function Lightbox({ photos, index, onClose, onIndexChange }) {
  const dialogRef = useRef(null);
  const swipe = useRef({ x: 0, on: false });

  const step = useCallback(
    (dir) => onIndexChange((index + dir + photos.length) % photos.length),
    [index, photos.length, onIndexChange]
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'Tab') {
      const list = [...(dialogRef.current?.querySelectorAll('button') ?? [])];
      if (!list.length) return;
      e.preventDefault();
      const i = list.indexOf(document.activeElement);
      (e.shiftKey ? list[(i - 1 + list.length) % list.length] : list[(i + 1) % list.length]).focus();
    }
  };

  const photo = photos[index];
  if (!photo) return null;

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.alt} — ${index + 1} sur ${photos.length}`}
      ref={dialogRef}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onPointerDown={(e) => {
        swipe.current = { x: e.clientX, on: true };
      }}
      onPointerUp={(e) => {
        if (!swipe.current.on) return;
        const dx = e.clientX - swipe.current.x;
        swipe.current.on = false;
        if (dx <= -55) step(1);
        else if (dx >= 55) step(-1);
      }}
    >
      <figure className="lightbox__figure">
        <img src={photo.src} alt={photo.alt} draggable={false} />
      </figure>

      <p className="lightbox__count" aria-hidden="true">
        {index + 1} / {photos.length}
      </p>

      <button
        type="button"
        className="lightbox__btn lightbox__btn--prev"
        aria-label="Photo précédente"
        onClick={() => step(-1)}
      >
        <Chevron dir="prev" />
      </button>
      <button
        type="button"
        className="lightbox__btn lightbox__btn--next"
        aria-label="Photo suivante"
        onClick={() => step(1)}
      >
        <Chevron dir="next" />
      </button>
      <button
        type="button"
        className="lightbox__btn lightbox__btn--close"
        aria-label="Fermer"
        onClick={onClose}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
