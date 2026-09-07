'use client';

import { useRef, useState } from 'react';

/**
 * The atelier clip, in the right of the hero.
 *
 * preload="none" is the whole point: nothing but the poster is fetched until
 * someone presses play, so the ~4 MB never competes with the hero's own paint.
 * The poster is a small JPEG precisely because it IS fetched eagerly.
 *
 * Two sources — WebM first for Chrome/Firefox/Edge, H.264 as the universal
 * fallback. The phone footage is HEVC, which most browsers refuse to decode.
 *
 * Native controls appear once it is playing; before that a brush-styled button
 * covers it, so the default control bar never sits over the poster.
 */
export default function HeroVideo({
  src = '/videos/atelier',
  poster = '/videos/atelier-poster.jpg',
  label = "Voir l'atelier en vidéo",
}) {
  const videoRef = useRef(null);
  const [started, setStarted] = useState(false);

  const play = () => {
    const el = videoRef.current;
    if (!el) return;
    setStarted(true);
    // The click is the user gesture, so this is allowed to play with sound.
    el.play().catch(() => {
      // Autoplay policies vary; the native controls are the fallback.
    });
  };

  return (
    <div className={`hero__video${started ? ' is-playing' : ''}`}>
      <video
        ref={videoRef}
        className="hero__video-el"
        preload="none"
        poster={poster}
        playsInline
        controls={started}
        onEnded={() => setStarted(false)}
      >
        <source src={`${src}.webm`} type="video/webm" />
        <source src={`${src}.mp4`} type="video/mp4" />
      </video>

      {!started && (
        <button type="button" className="hero__video-play" onClick={play}>
          <span className="hero__video-disc" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M9 6.5 L17.5 12 L9 17.5 Z" fill="currentColor" />
            </svg>
          </span>
          <span className="hero__video-label">{label}</span>
        </button>
      )}
    </div>
  );
}
