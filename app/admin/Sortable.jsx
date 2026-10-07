'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { flushSync } from 'react-dom'

// Auto-scroll at the screen's top and bottom edges while a row is dragged:
// the band's height, the speed right at the edge in px per ms, and how much
// faster it gets, at most, as it is held there (+1 per second).
const EDGE_SHARE = 0.18
const EDGE_MIN = 60
const EDGE_MAX = 160
const SCROLL_SPEED = 1.6
const SCROLL_BOOST = 1.5

/**
 * Reordering for the admin lists: drag a row by its grip, or use the arrows.
 * Every move is one POST of the whole new order.
 *
 * Pointer events rather than HTML5 drag, which does nothing on a phone. Only
 * the grip has touch-action: none, so a finger anywhere else on the list
 * still scrolls the page. Rows are moved with transforms while dragging and
 * put in their new order on release.
 *
 * `save(ids)` stores the order and resolves true, or shows its own error and
 * resolves false. The new order shows at once and stays until router.refresh()
 * brings the server's back; on failure the list falls back to `items`.
 */
export function useSortable(items, save) {
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [saving, setSaving] = useState(false)
  const [refreshing, startRefresh] = useTransition()
  const [dragging, setDragging] = useState(null)
  const listRef = useRef(null)
  const drag = useRef(null)

  // One move at a time: the next waits for the server's order to come back,
  // so two requests never race.
  const locked = saving || refreshing
  const list = locked && order ? arrange(items, order) : items

  // Tab switched mid-drag: stop listening, the rows are gone anyway.
  useEffect(() => () => drag.current?.teardown(), [])

  async function persist(ids) {
    const ok = await save(ids).catch(() => false)
    setSaving(false)
    // In a transition, so the server's order replaces ours in the same render.
    if (ok) startRefresh(() => router.refresh())
  }

  function commit(current, from, to) {
    const next = current.map((item) => item.id)
    next.splice(to, 0, ...next.splice(from, 1))
    // Synchronous, so the caller sees the rows in their new places.
    flushSync(() => {
      setOrder(next)
      setSaving(true)
    })
    persist(next)
  }

  /** The arrow buttons. */
  function moveTo(from, to) {
    if (locked || drag.current || to === from || to < 0 || to >= list.length) return
    const focused = document.activeElement
    commit(list, from, to)
    // Moving a row in the DOM can blur the button just pressed, and one now
    // disabled (the row is first or last) loses focus. Keep the keyboard on
    // that button, or on an enabled one beside it.
    if (
      listRef.current?.contains(focused) &&
      (focused.disabled || document.activeElement !== focused)
    ) {
      const target = focused.disabled
        ? focused.parentElement?.querySelector('button:not(:disabled)')
        : focused
      target?.focus({ preventScroll: true })
    }
  }

  /** pointerdown on a row's grip. */
  function grab(event, index) {
    if (locked || drag.current || list.length < 2) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const listEl = listRef.current
    const nodes = Array.from(listEl?.children ?? [])
    const node = nodes[index]
    if (!node) return
    event.preventDefault()

    const grip = event.currentTarget
    try {
      grip.setPointerCapture(event.pointerId)
    } catch {}

    // Measured once, in page coordinates, so scrolling does not invalidate them.
    const scrollY = window.scrollY
    const mids = nodes.map((n) => {
      const r = n.getBoundingClientRect()
      return r.top + scrollY + r.height / 2
    })
    const own = node.getBoundingClientRect()
    const area = listEl.getBoundingClientRect()
    const gap = parseFloat(getComputedStyle(listEl).rowGap) || 0
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const d = {
      pointerId: event.pointerId,
      from: index,
      to: index,
      items: list,
      // The dragged row passes a row once its leading edge crosses that
      // row's middle.
      mids,
      top: own.top + scrollY,
      height: own.height,
      // How far the others step aside to make room.
      shift: own.height + gap,
      startY: event.clientY + scrollY,
      y: event.clientY,
      // The row stays within the list.
      minDy: area.top - own.top,
      maxDy: area.bottom - own.bottom,
      listTop: area.top + scrollY,
      listBottom: area.bottom + scrollY,
      carry: 0,
      held: 0,
      last: performance.now(),
      frame: 0,
    }

    function place() {
      const dy = Math.min(Math.max(d.y + window.scrollY - d.startY, d.minDy), d.maxDy)
      node.style.transform = `translateY(${dy}px)`

      const top = d.top + dy
      let to = d.from
      while (to < d.mids.length - 1 && top + d.height > d.mids[to + 1]) to++
      if (to === d.from) while (to > 0 && top < d.mids[to - 1]) to--
      if (to === d.to) return
      d.to = to

      nodes.forEach((n, i) => {
        if (i === d.from) return
        const step =
          i > d.from && i <= to ? -d.shift : i < d.from && i >= to ? d.shift : 0
        n.style.transform = step ? `translateY(${step}px)` : ''
      })
    }

    function tick(now) {
      const dt = Math.min(Math.max(now - d.last, 0), 64)
      d.last = now

      // Near an edge, scroll, faster the closer the finger gets, and only
      // while there is more of the list past that edge. Held there, it
      // speeds up: 50 rows are a long way on a phone.
      const vh = window.innerHeight
      const edge = Math.min(Math.max(vh * EDGE_SHARE, EDGE_MIN), EDGE_MAX)
      const top = window.scrollY
      let speed = 0
      if (d.y < edge && d.listTop < top + edge) {
        speed = -Math.min(1, (edge - d.y) / edge)
      } else if (d.y > vh - edge && d.listBottom > top + vh - edge) {
        speed = Math.min(1, (d.y - vh + edge) / edge)
      }
      d.held = speed ? d.held || now : 0
      if (speed) speed *= 1 + Math.min(SCROLL_BOOST, (now - d.held) / 1000)
      // Whole pixels only: some browsers drop a fractional scroll.
      d.carry += speed * SCROLL_SPEED * dt
      const px = Math.trunc(d.carry)
      if (px) {
        d.carry -= px
        window.scrollBy(0, px)
      }

      place()
      d.frame = requestAnimationFrame(tick)
    }

    function finish(keep) {
      if (drag.current !== d) return
      d.teardown()

      const before = node.getBoundingClientRect().top
      for (const n of nodes) {
        n.style.transform = ''
        n.style.transition = ''
      }
      // Styles cleared and rows reordered in the same task: the browser never
      // paints the list between the two.
      flushSync(() => setDragging(null))
      if (keep && d.to !== d.from) commit(d.items, d.from, d.to)
      const delta = before - node.getBoundingClientRect().top
      // Back into scroll anchoring once the new order has been laid out.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!drag.current) listEl.style.overflowAnchor = ''
        })
      )

      // Glide the row from where it was let go into its place.
      if (smooth && Math.abs(delta) > 1) {
        node.style.transform = `translateY(${delta}px)`
        node.getBoundingClientRect()
        node.style.transition = 'transform 180ms ease'
        node.style.transform = ''
        const settle = (e) => {
          if (e.target !== node) return
          node.style.transition = ''
          node.removeEventListener('transitionend', settle)
        }
        node.addEventListener('transitionend', settle)
      }
    }

    const onMove = (e) => {
      if (e.pointerId === d.pointerId) d.y = e.clientY
    }
    const onUp = (e) => {
      if (e.pointerId === d.pointerId) finish(true)
    }
    const onCancel = (e) => {
      if (e.pointerId === d.pointerId) finish(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') finish(false)
    }
    // Belt and braces with touch-action for iOS: the page must not pan
    // under a dragged row.
    const noPan = (e) => e.preventDefault()

    d.teardown = () => {
      drag.current = null
      cancelAnimationFrame(d.frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchmove', noPan)
      try {
        grip.releasePointerCapture(d.pointerId)
      } catch {}
    }

    for (const n of nodes) {
      n.style.transition = n === node || !smooth ? 'none' : 'transform 160ms ease'
    }
    // Out of scroll anchoring until the drop is laid out, so the browser
    // cannot anchor the page to a row that is about to move.
    listEl.style.overflowAnchor = 'none'
    drag.current = d
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchmove', noPan, { passive: false })
    d.frame = requestAnimationFrame(tick)
    setDragging(list[index].id)
  }

  return { list, locked, dragging, listRef, grab, moveTo }
}

/**
 * `items` in the order of `ids`. Kept as ids so a row edited meanwhile shows
 * its new data; if a row came or went, the server's list wins.
 */
function arrange(items, ids) {
  const byId = new Map(items.map((item) => [item.id, item]))
  const placed = ids.map((id) => byId.get(id)).filter(Boolean)
  return placed.length === items.length ? placed : items
}

/**
 * A row's drag handle: its number, with dots under it. Pointer only, hence
 * hidden from screen readers; the arrow buttons do the same from a keyboard.
 */
export function SortGrip({ index, onPointerDown }) {
  return (
    <span
      className="photo-list__grip"
      onPointerDown={onPointerDown}
      title="Glisser pour déplacer"
      aria-hidden="true"
    >
      <span className="photo-list__pos">{index + 1}</span>
      <svg className="photo-list__dots" viewBox="0 0 10 16" width="10" height="16">
        <circle cx="2.5" cy="3" r="1.5" />
        <circle cx="7.5" cy="3" r="1.5" />
        <circle cx="2.5" cy="8" r="1.5" />
        <circle cx="7.5" cy="8" r="1.5" />
        <circle cx="2.5" cy="13" r="1.5" />
        <circle cx="7.5" cy="13" r="1.5" />
      </svg>
    </span>
  )
}

/**
 * First, up, down, last. Drawn rather than typed for first and last: the
 * arrow-to-bar characters are missing from some phones' fonts.
 */
export function MoveButtons({ index, count, onMove, locked, disabled }) {
  const first = index === 0
  const last = index === count - 1
  // Not `disabled` while saving: that would drop the keyboard focus.
  const wait = locked ? 'true' : undefined

  return (
    <>
      <button
        type="button"
        className="photo-list__move"
        onClick={() => onMove(index, 0)}
        disabled={first || disabled}
        aria-disabled={wait}
        aria-label="Mettre en premier"
        title="Mettre en premier"
      >
        <svg viewBox="0 0 12 14" width="12" height="14" aria-hidden="true">
          <path d="M2 1.5h8M6 13V4.5M2.5 8 6 4.5 9.5 8" />
        </svg>
      </button>
      <button
        type="button"
        className="photo-list__move"
        onClick={() => onMove(index, index - 1)}
        disabled={first || disabled}
        aria-disabled={wait}
        aria-label="Monter"
        title="Monter"
      >
        ↑
      </button>
      <button
        type="button"
        className="photo-list__move"
        onClick={() => onMove(index, index + 1)}
        disabled={last || disabled}
        aria-disabled={wait}
        aria-label="Descendre"
        title="Descendre"
      >
        ↓
      </button>
      <button
        type="button"
        className="photo-list__move"
        onClick={() => onMove(index, count - 1)}
        disabled={last || disabled}
        aria-disabled={wait}
        aria-label="Mettre en dernier"
        title="Mettre en dernier"
      >
        <svg viewBox="0 0 12 14" width="12" height="14" aria-hidden="true">
          <path d="M2 12.5h8M6 1v8.5M2.5 6 6 9.5 9.5 6" />
        </svg>
      </button>
    </>
  )
}
