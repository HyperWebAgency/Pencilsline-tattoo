'use client';

import { useEffect, useRef } from 'react';
import InkStroke from './InkStroke';

/**
 * Small modal notice. Used for the Univers link, which points at a section that
 * has not been built yet — better to say so plainly than to scroll nowhere.
 *
 * Keyboard-complete: focus moves in on open, Escape closes, Tab is trapped, and
 * the caller restores focus to whatever opened it.
 */
export default function NoticeDialog({
  title = 'Section en construction',
  children,
  closeLabel = 'Compris',
  onClose,
}) {
  const cardRef = useRef(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cardRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusables = cardRef.current?.querySelectorAll('button, a[href]') ?? [];
    if (!focusables.length) return;
    e.preventDefault();
    const list = [...focusables];
    const i = list.indexOf(document.activeElement);
    const next = e.shiftKey
      ? list[(i - 1 + list.length) % list.length]
      : list[(i + 1) % list.length];
    next.focus();
  };

  return (
    <div
      className="notice-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="notice-modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-title"
        tabIndex={-1}
        ref={cardRef}
        onKeyDown={onKeyDown}
      >
        <span className="notice-modal__seal" aria-hidden="true" />

        <h2 className="notice-modal__title" id="notice-title">
          {title}
        </h2>

        <div className="notice-modal__body">{children}</div>

        <button type="button" className="notice-modal__btn" onClick={onClose}>
          {closeLabel}
          <span className="notice-modal__dash" aria-hidden="true">
            <InkStroke length={120} thickness={2.8} seed={61} color="#b31b1b" />
          </span>
        </button>
      </div>
    </div>
  );
}
