'use client';

import { useEffect, useId, useRef, useState } from 'react';

/** Below this many reviews the row stands still: looping one or two would
 *  just parade the same card past, over and over. */
const LOOP_FROM = 3;
/** Cards per copy of the loop, repeating the reviews to reach it, so one copy
 *  is always wider than the screen and the seam never shows. */
const MIN_CARDS = 8;
/** Crawl speed. The duration scales with the card count, so the pace is the
 *  same however many reviews there are. */
const SECONDS_PER_CARD = 7;

/** French spacing: a narrow no-break space keeps "!!" off a line of its own. */
const fr = (text) => text.replace(/\s+([!?;])/g, ' $1');

/** Google's "G" in its own colours — where every review comes from. */
function GoogleG() {
  return (
    <svg className="review__g" viewBox="0 0 48 48" role="img" aria-label="Avis Google" focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/** The review's own rating: filled stars up to it, faint ones after. */
function Stars({ rating }) {
  return (
    <span className="review__stars" role="img" aria-label={`${rating} étoiles sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" focusable="false" className={i < rating ? undefined : 'is-empty'}>
          <path
            d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.5l1.1-6.5L2.6 9.4l6.5-.9z"
            fill="currentColor"
          />
        </svg>
      ))}
    </span>
  );
}

function Review({ review, index, long, open, echo, onToggle }) {
  const textId = useId();

  return (
    <article className={`review${open ? ' is-open' : ''}`}>
      <header className="review__head">
        {review.photo ? (
          // The name sits right beside it, so the picture adds nothing to read.
          <img
            className="review__avatar"
            src={review.photo}
            alt=""
            width={44}
            height={44}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="review__avatar review__avatar--initial" aria-hidden="true">
            {review.name.trim().charAt(0)}
          </span>
        )}
        <div className="review__who">
          <p className="review__name">{review.name}</p>
          <Stars rating={review.rating} />
        </div>
        <GoogleG />
      </header>

      {/* data-clamped marks the text for the overflow check below; an open
          card is not clamped, so it cannot be measured. */}
      <p
        id={textId}
        className="review__text"
        data-review={index}
        data-clamped={open ? undefined : ''}
      >
        {fr(review.text)}
      </p>

      {(long || open) && (
        <button
          type="button"
          className="review__more"
          aria-expanded={open}
          aria-controls={textId}
          // Echoes are hidden from assistive tech, so they leave the tab order.
          tabIndex={echo ? -1 : undefined}
          onClick={onToggle}
        >
          {open ? 'Réduire' : 'Lire la suite'}
        </button>
      )}
    </article>
  );
}

/**
 * The reviews as an endless row that crawls sideways: two identical copies
 * side by side, the track sliding left by exactly one copy and starting over.
 * CSS runs it (see .reviews__track), so it costs no JavaScript per frame.
 *
 * It pauses under the pointer, while the keyboard is inside it, while a
 * review is open — nobody can read a card that is moving away — and while it
 * is off screen. Under prefers-reduced-motion, or in lite mode (lib/lite.js),
 * it does not move at all and scrolls by hand instead.
 *
 * Long reviews are clamped to five lines, with « Lire la suite ». Whether a
 * review is long is measured, not guessed from its length: the card's width
 * and the font decide where the lines break.
 */
export default function ReviewCarousel({ reviews }) {
  const rootRef = useRef(null);
  const [long, setLong] = useState(() => new Set());
  const [open, setOpen] = useState(null);
  // Keyboard focus only. A clicked « Réduire » keeps focus too, and pausing
  // on any focus held the row still until the next click somewhere else.
  const [keyboard, setKeyboard] = useState(false);
  // Off screen, a crawl nobody can see would still cost the compositor every
  // frame for as long as the page stays open. Starts paused: the row is below
  // the fold on arrival, and the observer reports at once anyway.
  const [offscreen, setOffscreen] = useState(true);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !('IntersectionObserver' in window)) {
      setOffscreen(false);
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting));
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const loop = reviews.length >= LOOP_FROM;
  const repeats = loop ? Math.ceil(MIN_CARDS / reviews.length) : 1;
  const cards = Array.from({ length: repeats }, () => reviews).flat();
  const copies = loop ? [0, 1] : [0];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const measure = () => {
      const next = new Set();
      root.querySelectorAll('.review__text[data-clamped]').forEach((el) => {
        if (el.scrollHeight - el.clientHeight > 1) next.add(el.dataset.review);
      });
      setLong((prev) =>
        prev.size === next.size && [...next].every((k) => prev.has(k)) ? prev : next
      );
    };

    measure();
    // The serif arrives after first paint, and it wraps differently.
    document.fonts?.ready.then(measure);
    const resize = new ResizeObserver(measure);
    resize.observe(root);
    return () => resize.disconnect();
  }, [reviews]);

  return (
    <div
      className={`reviews__viewport${loop ? ' is-looping' : ''}`}
      ref={rootRef}
      onFocus={(e) => setKeyboard(e.target.matches(':focus-visible'))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setKeyboard(false);
      }}
    >
      <div
        className={`reviews__track${open || keyboard || offscreen ? ' is-paused' : ''}`}
        style={{ '--reviews-duration': `${cards.length * SECONDS_PER_CARD}s` }}
      >
        {copies.map((copy) => (
          <ul className="reviews__group" key={copy}>
            {cards.map((review, i) => {
              const key = `${copy}-${i}`;
              const index = i % reviews.length;
              // Each review is announced once. Every later appearance — the
              // repeats and the whole second copy — is only there to be seen.
              const echo = copy > 0 || i >= reviews.length;
              return (
                <li key={key} aria-hidden={echo || undefined}>
                  <Review
                    review={review}
                    index={index}
                    long={long.has(String(index))}
                    open={open === key}
                    echo={echo}
                    onToggle={() => setOpen((cur) => (cur === key ? null : key))}
                  />
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </div>
  );
}
