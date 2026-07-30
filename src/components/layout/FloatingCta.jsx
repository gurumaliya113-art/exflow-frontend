import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { durationNames } from '../../lib/tokens'
import { useMotionSafe } from '../../hooks/useMotionSafe'

/**
 * Scroll offset that reveals the CTA, carried over verbatim from the inline
 * implementations in `NewHomePage` and `PortfolioPage` (Requirement 11.1).
 */
export const FLOATING_CTA_SCROLL_THRESHOLD_PX = 20

/** Label text, unchanged from the pages this component replaces. */
export const FLOATING_CTA_LABEL = 'Book A Call'

/** The window event the existing pages use to open the Enquiry_Modal. */
export const ENQUIRY_EVENT = 'open-enquire'

/** Token the layout adds on top of the CTA height as breathing room. */
export const FLOATING_CTA_GAP_VAR = '--space-5'

/** framer-motion takes a bezier array, not a `cubic-bezier()` string. */
const EASE_OUT = [0.22, 1, 0.36, 1]

/** Default activation: the existing enquiry bridge (Requirement 7.1). */
function dispatchEnquiry() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(ENQUIRY_EVENT))
}

function readScrollY() {
  if (typeof window === 'undefined') return 0
  return typeof window.scrollY === 'number' ? window.scrollY : 0
}

function measure(node) {
  if (!node) return 0
  const rect = typeof node.getBoundingClientRect === 'function' ? node.getBoundingClientRect() : null
  const height = rect && Number.isFinite(rect.height) ? rect.height : 0
  return Math.round(height || node.offsetHeight || 0)
}

/**
 * Bottom inset a layout must reserve so a visible fixed CTA never permanently
 * obscures page content (Requirement 3.9).
 *
 * Usage from a layout:
 *   `const { inset, onHeightChange } = useFloatingCtaInset()`
 * then pass `onHeightChange` to `FloatingCta` and apply `inset` as the
 * bottom padding of the scrollable region. `inset` is `0px` while the CTA is
 * hidden and `calc(<height>px + var(--space-5))` while it is visible.
 *
 * @returns {{ inset: string, height: number, onHeightChange: (height: number) => void }}
 *
 * Requirements: 3.9
 */
export function useFloatingCtaInset() {
  const [height, setHeight] = useState(0)

  const onHeightChange = useCallback((next) => {
    const value = Number.isFinite(next) && next > 0 ? Math.round(next) : 0
    setHeight((current) => (current === value ? current : value))
  }, [])

  const inset = height > 0 ? `calc(${height}px + var(${FLOATING_CTA_GAP_VAR}))` : '0px'

  return { inset, height, onHeightChange }
}

/**
 * `FloatingCta` - the fixed conversion action that appears once the page has
 * been scrolled past `threshold`.
 *
 * Overlap compensation (Requirement 3.9): the component measures its own
 * rendered node and reports the height through `onHeightChange`, reporting `0`
 * whenever it is hidden. `useFloatingCtaInset` turns that number into the
 * bottom padding the enclosing layout applies, so every item of page content
 * can still be scrolled into the unobscured viewport area.
 *
 * Activation (Requirement 7.1): `onActivate` defaults to dispatching the
 * existing `open-enquire` window event, which the current pages already use to
 * open the Enquiry_Modal. Once `EnquiryProvider` lands, the layout can pass
 * `openEnquiry` instead.
 *
 * Motion (Requirements 9.3, 9.5): the fade/lift entrance is decorative, stays
 * inside the token duration scale (all values are 600ms or less), and is
 * replaced by a plain, statically positioned node under
 * Reduced_Motion_Preference.
 *
 * @param {object} props
 * @param {number} [props.threshold=20] Scroll offset in px that reveals the CTA.
 * @param {string} [props.label='Book A Call'] Visible button label.
 * @param {() => void} [props.onActivate] Activation handler.
 * @param {(height: number) => void} [props.onHeightChange] Height reporter.
 * @param {string} [props.className] Extra classes for the fixed wrapper.
 *
 * Requirements: 3.9, 7.1, 9.3, 9.5, 11.1
 */
export function FloatingCta({
  threshold = FLOATING_CTA_SCROLL_THRESHOLD_PX,
  label = FLOATING_CTA_LABEL,
  onActivate,
  onHeightChange,
  className,
  ...rest
}) {
  const motionSafe = useMotionSafe()
  const [visible, setVisible] = useState(() => readScrollY() > threshold)
  const nodeRef = useRef(null)
  const reportRef = useRef(onHeightChange)

  reportRef.current = onHeightChange

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleScroll = () => {
      setVisible(readScrollY() > threshold)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  // Report the rendered height while visible, and 0 while hidden, so the
  // layout only reserves space when something is actually covering content.
  useEffect(() => {
    const report = (value) => {
      if (typeof reportRef.current === 'function') reportRef.current(value)
    }

    if (!visible) {
      report(0)
      return undefined
    }

    const node = nodeRef.current
    report(measure(node))

    const remeasure = () => report(measure(nodeRef.current))

    let observer
    if (node && typeof window !== 'undefined' && typeof window.ResizeObserver === 'function') {
      observer = new window.ResizeObserver(remeasure)
      observer.observe(node)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', remeasure)
    }

    return () => {
      if (observer) observer.disconnect()
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', remeasure)
      }
      report(0)
    }
  }, [visible])

  const handleClick = () => {
    if (typeof onActivate === 'function') {
      onActivate()
      return
    }
    dispatchEnquiry()
  }

  const wrapperClass = cn(
    'fixed bottom-[var(--space-5)] right-[var(--space-5)] z-40',
    className,
  )

  const button = (
    <Button
      type="button"
      variant="brand"
      size="lg"
      onClick={handleClick}
      className="rounded-[var(--radius-pill)] shadow-float"
      data-slot="floating-cta-button"
    >
      {label}
    </Button>
  )

  if (!visible) return null

  if (!motionSafe) {
    return (
      <div
        ref={nodeRef}
        data-slot="floating-cta"
        data-motion="static"
        className={wrapperClass}
        style={{ opacity: 1, transform: 'none', transition: 'none' }}
        {...rest}
      >
        {button}
      </div>
    )
  }

  const durationMs = Math.min(durationNames.base, 600)

  return (
    <motion.div
      ref={nodeRef}
      data-slot="floating-cta"
      data-motion="animated"
      data-motion-duration={durationMs}
      className={cn(wrapperClass, 'will-change-transform')}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: durationMs / 1000, ease: EASE_OUT }}
      {...rest}
    >
      {button}
    </motion.div>
  )
}

export default FloatingCta
