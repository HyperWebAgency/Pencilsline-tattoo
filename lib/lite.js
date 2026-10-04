/**
 * Lite mode: the site without its costlier motion, for a device that can't
 * keep up with it — <html data-lite>. Off: Lenis's eased scroll, the process
 * cards' scroll-driven flight, the ink cursor, the review crawl, the navbar's
 * blur, the polaroid deal and the handwritten Merci. Left: every page, every
 * image, plain native scrolling and the one-off fades.
 *
 * Measured on a CPU slowed to a weak laptop's, scrolling the home page spent
 * ten times longer painting and compositing with the full motion than without
 * it. The two biggest shares: Lenis re-scrolling the page from JavaScript
 * every frame, and the process cards being moved from that same scroll.
 *
 * Two ways in. A device that is weak on paper (two cores, 2 GB, or data saver)
 * starts lite, before first paint — LITE_BOOT, inlined in the layout's head.
 * Any other is judged on its frames while the visitor scrolls (watchFrames):
 * one that keeps missing them switches over on the spot. Either way the
 * verdict is kept for two weeks, so a slow laptop isn't made to stutter again
 * on every visit.
 *
 * No React here: the layout, a server component, imports LITE_BOOT.
 */

const KEY = 'pencilsline-lite'
const KEEP_MS = 14 * 24 * 60 * 60 * 1000
export const LITE_EVENT = 'pencilsline:lite'

/**
 * Runs in <head> before the page paints. Must stay self-contained: it is
 * inlined as a string, nothing here is in scope there.
 */
export const LITE_BOOT = `(function(){try{var d=document.documentElement,n=navigator,c=n.connection;var weak=(n.hardwareConcurrency&&n.hardwareConcurrency<=2)||(n.deviceMemory&&n.deviceMemory<=2)||(c&&c.saveData);var t=+localStorage.getItem('${KEY}');if(t&&Date.now()-t<${KEEP_MS})d.setAttribute('data-lite','kept');else if(weak)d.setAttribute('data-lite','device');}catch(e){}})();`

export function isLite() {
  return typeof document !== 'undefined' && document.documentElement.hasAttribute('data-lite')
}

export function enableLite(reason) {
  if (isLite()) return
  document.documentElement.setAttribute('data-lite', reason)
  try {
    localStorage.setItem(KEY, String(Date.now()))
  } catch {
    // Private mode or blocked storage: lite for this page only.
  }
  window.dispatchEvent(new Event(LITE_EVENT))
}

/** Calls fn once lite is on: now if it already is. Returns an unsubscribe. */
export function onLite(fn) {
  if (isLite()) {
    fn()
    return () => {}
  }
  window.addEventListener(LITE_EVENT, fn, { once: true })
  return () => window.removeEventListener(LITE_EVENT, fn)
}

/** A frame later than this missed the display's refresh, at 60 Hz or above. */
const LATE_MS = 25
/** Frames sampled before a verdict: about four seconds of scrolling. */
const SAMPLE = 240
/** Share of late frames that tips into lite, and the earlier, surer cut. */
const LATE_SHARE = 0.2
const EARLY = { frames: 120, share: 0.3 }
/** Gaps longer than this are a hidden tab or a pause, not a slow frame. */
const IGNORE_MS = 250

/**
 * Counts frames while the visitor scrolls, the moment the costly motion all
 * runs at once, and turns lite on if too many arrive late. Idle until a
 * scroll, quiet between scrolls, and done for good once it has a verdict,
 * so a capable machine pays for a few seconds of timestamps and no more.
 * Returns a stop function.
 */
export function watchFrames() {
  if (typeof window === 'undefined' || isLite()) return () => {}

  let frames = 0
  let late = 0
  let raf = 0
  let last = 0
  let quietTimer = 0
  let done = false

  const verdict = () => {
    const share = late / frames
    if ((frames >= EARLY.frames && share >= EARLY.share) || (frames >= SAMPLE && share >= LATE_SHARE)) {
      enableLite('slow')
      stop()
    } else if (frames >= SAMPLE) {
      stop()
    }
  }

  const tick = (now) => {
    if (last) {
      const gap = now - last
      if (gap < IGNORE_MS) {
        frames += 1
        if (gap > LATE_MS) late += 1
      }
    }
    last = now
    verdict()
    if (!done) raf = requestAnimationFrame(tick)
  }

  const onScroll = () => {
    if (done) return
    if (!raf) {
      last = 0
      raf = requestAnimationFrame(tick)
    }
    clearTimeout(quietTimer)
    quietTimer = setTimeout(() => {
      cancelAnimationFrame(raf)
      raf = 0
    }, 200)
  }

  function stop() {
    done = true
    cancelAnimationFrame(raf)
    clearTimeout(quietTimer)
    window.removeEventListener('scroll', onScroll)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  return stop
}
