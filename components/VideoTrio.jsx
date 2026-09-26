'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The clips below the hero, as Alexandra arranges them in /admin (see
 * lib/videos.js), revealed on scroll and each played on click. Up to three sit
 * side by side; more wrap onto the next row. The first one leads: it carries
 * the prompt, and it is the only one shown on a phone.
 *
 * No animation library: the project has none, and this needs one
 * IntersectionObserver — the same hand-rolled approach as CursorTrail and
 * TransitionProvider. Lenis only drives scrolling, it does not do reveals.
 *
 * preload="none" plus a poster means the page carries a few small stills and
 * nothing else; a clip is fetched the moment someone asks for it. A clip whose
 * still could not be made at upload preloads its metadata instead, so the
 * browser shows its opening frame rather than a black box. Starting one
 * pauses the others, so two soundtracks never overlap.
 */
export default function VideoTrio({ videos = [], heading = "L'atelier en mouvement" }) {
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

    // On a phone the hero stops short so the top of the clip already shows on
    // arrival. It has to reveal from its first pixel there, or that peek would
    // be an empty band of paper.
    const phone = window.matchMedia('(max-width: 640px)').matches;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      phone ? { threshold: 0 } : { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
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

  // All removed from /admin: no row, rather than an empty band of paper.
  if (!videos.length) return null;

  return (
    <section
      className={`trio${revealed ? ' is-revealed' : ''}`}
      ref={sectionRef}
      aria-label={heading}
    >
      <ul className="trio__grid" style={{ '--trio-cols': Math.min(videos.length, 3) }}>
        {videos.map((clip, i) => (
          <li
            key={clip.id}
            className={`trio__cell${i === 0 ? ' trio__cell--lead' : ''}`}
            style={{ '--trio-delay': `${(i % 3) * 120}ms` }}
          >
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              className="trio__video"
              poster={clip.poster ?? undefined}
              preload={clip.poster ? 'none' : 'metadata'}
              playsInline
              controls={playing === i}
              onEnded={() => setPlaying(null)}
              onPause={() => setPlaying((cur) => (cur === i ? null : cur))}
            >
              {/* Always rendered: preload="none" is what withholds the bytes,
                  and sources injected later would need an explicit load().
                  #t=0.1 makes a poster-less clip show a real frame, not the
                  often-black first one. */}
              <source src={clip.poster ? clip.src : `${clip.src}#t=0.1`} type={clip.type} />
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
                {/* Only on the lead clip: one prompt is enough for the row,
                    and on a phone it is the only one shown. aria-hidden because
                    the button's own label already says what it does. */}
                {i === 0 && (
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
