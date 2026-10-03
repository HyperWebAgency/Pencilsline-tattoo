'use client';

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

/**
 * Phone only (see .hero__play): the video row is not shown there, and this
 * play button in the middle of Alexandra's photo stands in for it. It opens
 * the lead clip — the first in /admin, the one the row puts first — over the
 * page, and closes on ×, Escape, a tap beside the clip, or when it ends.
 *
 * The clip is rendered and started inside the tap itself (flushSync), so the
 * browser counts play() as the visitor's own act and lets it start with sound.
 */
export default function HeroVideo({ video }) {
  const [open, setOpen] = useState(false);
  const videoRef = useRef(null);
  const buttonRef = useRef(null);
  const closeRef = useRef(null);

  const start = () => {
    flushSync(() => setOpen(true));
    videoRef.current?.play().catch(() => {
      // Refused: the controls are there to start it by hand.
    });
  };

  useEffect(() => {
    if (!open) return undefined;

    const button = buttonRef.current;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      button?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="hero__play"
        onClick={start}
        aria-label={`Lire la vidéo : ${video.label}`}
      >
        <span className="hero__play-disc" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M9 6.5 L17.5 12 L9 17.5 Z" fill="currentColor" />
          </svg>
        </span>
        {/* aria-hidden: the button's own label already says what it does. */}
        <span className="hero__play-label" aria-hidden="true">
          Voir la vidéo
        </span>
      </button>

      {open && (
        // data-lenis-prevent: the page must not scroll under the clip.
        <div
          className="hero-video"
          role="dialog"
          aria-modal="true"
          aria-label={video.label}
          data-lenis-prevent
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <video
            ref={videoRef}
            className="hero-video__clip"
            poster={video.poster ?? undefined}
            controls
            playsInline
            onEnded={() => setOpen(false)}
          >
            <source src={video.src} type={video.type} />
          </video>
          <button
            ref={closeRef}
            type="button"
            className="hero-video__close"
            onClick={() => setOpen(false)}
            aria-label="Fermer la vidéo"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
