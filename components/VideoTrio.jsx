'use client';

import { useEffect, useRef, useState } from 'react';

/** Middle one is the tall centrepiece; the outer two sit lower. */
const CLIPS = [
  { src: '/videos/atelier-1', label: "Tatouage en cours à l'encre de Chine" },
  { src: '/videos/atelier-2', label: "Alexandra dessine le motif à l'atelier" },
  { src: '/videos/atelier-3', label: 'Détail du tracé sur la peau' },
];

/**
 * Three clips below the hero, revealed on scroll, each played on click.
 *
 * No animation library: the project has none, and this needs one
 * IntersectionObserver — the same hand-rolled approach as CursorTrail and
 * TransitionProvider. Lenis only drives scrolling, it does not do reveals.
 *
 * preload="none" plus a poster means the page carries three small stills and
 * nothing else; a clip is fetched the moment someone asks for it. Starting one
 * pauses the others, so two soundtracks never overlap.
 */
export default function VideoTrio({ heading = "L'atelier en mouvement" }) {
  const sectionRef = useRef(null);
  const videoRefs = useRef([]);
  const [revealed, setRevealed] = useState(false);
  const [playing, setPlaying] = useState(null); // index, or null

  // Reveal once, then stop watching.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    if (!('IntersectionObserver' in window)) {
      setRevealed(true);
      return undefined;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const play = (i) => {
    const video = videoRefs.current[i];
    if (!video) return;

    videoRefs.current.forEach((other, j) => {
      if (other && j !== i) other.pause();
    });

    setPlaying(i);
    video.play().catch(() => {
      // Refused playback leaves the poster and the button in place.
      setPlaying(null);
    });
  };

  return (
    <section
      className={`trio${revealed ? ' is-revealed' : ''}`}
      ref={sectionRef}
      aria-label={heading}
    >
      <ul className="trio__grid">
        {CLIPS.map((clip, i) => (
          <li
            key={clip.src}
            className={`trio__cell${i === 1 ? ' trio__cell--tall' : ''}`}
            style={{ '--trio-delay': `${i * 120}ms` }}
          >
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              className="trio__video"
              poster={`${clip.src}-poster.jpg`}
              preload="none"
              playsInline
              controls={playing === i}
              onEnded={() => setPlaying(null)}
              onPause={() => setPlaying((cur) => (cur === i ? null : cur))}
            >
              {/* Always rendered: preload="none" is what withholds the bytes,
                  and sources injected later would need an explicit load(). */}
              <source src={`${clip.src}.webm`} type="video/webm" />
              <source src={`${clip.src}.mp4`} type="video/mp4" />
            </video>

            {playing !== i && (
              <button
                type="button"
                className="trio__play"
                onClick={() => play(i)}
                aria-label={`Lire la vidéo : ${clip.label}`}
              >
                <span className="trio__disc" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M9 6.5 L17.5 12 L9 17.5 Z" fill="currentColor" />
                  </svg>
                </span>
                {/* Only on the centre clip: one prompt is enough for the row,
                    and on a phone it is the only one shown. aria-hidden because
                    the button's own label already says what it does. */}
                {i === 1 && (
                  <span className="trio__hint" aria-hidden="true">
                    Cliquer pour voir la vidéo
                  </span>
                )}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
