import { useEffect, useRef } from 'react'

/**
 * Width of the classic (layout-affecting) scrollbar, in CSS pixels.
 *
 * `window.innerWidth` includes the scrollbar, `documentElement.clientWidth`
 * does not, so the difference is the gutter that disappears once `overflow`
 * becomes `hidden`. Overlay scrollbars (macOS, mobile) yield 0, and jsdom -
 * which computes no layout - also yields 0. Both cases are correct: there is no
 * gutter to compensate, so no `padding-right` is added.
 *
 * @returns {number} A non-negative pixel width.
 */
export function getScrollbarWidth() {
  if (typeof window === 'undefined' || !document?.documentElement) return 0
  const width = window.innerWidth - document.documentElement.clientWidth
  return Number.isFinite(width) && width > 0 ? width : 0
}

/**
 * Prevent background page scrolling while `active` is true, without moving the
 * background page.
 *
 * The hook records `document.body.style.overflow`, `document.body.style
 * .paddingRight`, and the current scroll offsets before it changes anything,
 * then applies `overflow: hidden` plus a `padding-right` equal to the scrollbar
 * width so removing the scrollbar does not shift the layout. `overflow: hidden`
 * preserves `scrollTop`, so the scroll position is untouched while locked
 * (Requirement 7.4); on release the two inline styles are restored to exactly
 * the recorded values, and the recorded offsets are re-applied as a safety net
 * for browsers that reset them (Requirement 7.5).
 *
 * The recorded values are the raw inline-style strings, empty string included,
 * so a body that had no inline `overflow` goes back to having none rather than
 * being left with a hard-coded `overflow: visible`.
 *
 * No-op while inactive, and the release path also runs on unmount, so a modal
 * that is removed while open cannot leave the page unscrollable.
 *
 * @param {boolean} [active=false] Whether the lock is engaged.
 *
 * Requirements: 7.4, 7.5
 */
export function useScrollLock(active = false) {
  /** Snapshot of what was replaced, so release is an exact inverse. */
  const previousRef = useRef(null)

  useEffect(() => {
    if (!active) return undefined
    if (typeof window === 'undefined' || !document?.body) return undefined

    const { body } = document
    const previous = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      scrollX: window.scrollX ?? window.pageXOffset ?? 0,
      scrollY: window.scrollY ?? window.pageYOffset ?? 0,
    }
    previousRef.current = previous

    const gutter = getScrollbarWidth()
    body.style.overflow = 'hidden'
    if (gutter > 0) {
      body.style.paddingRight = `${gutter}px`
    }

    return () => {
      const recorded = previousRef.current
      previousRef.current = null
      if (!recorded) return

      body.style.overflow = recorded.overflow
      body.style.paddingRight = recorded.paddingRight

      const movedX = (window.scrollX ?? window.pageXOffset ?? 0) !== recorded.scrollX
      const movedY = (window.scrollY ?? window.pageYOffset ?? 0) !== recorded.scrollY
      if ((movedX || movedY) && typeof window.scrollTo === 'function') {
        window.scrollTo(recorded.scrollX, recorded.scrollY)
      }
    }
  }, [active])
}

export default useScrollLock
