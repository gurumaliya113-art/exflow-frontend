import { motion } from 'framer-motion'
import { durationNames } from '../../lib/tokens'
import { useMotionSafe } from '../../hooks/useMotionSafe'

/** Upper bound on any decorative animation duration or delay (Requirement 9.3). */
export const MAX_MOTION_MS = 600

/** Entrance duration, taken from the token motion scale. */
export const REVEAL_DURATION_MS = durationNames.base

/** framer-motion takes an easing array, not a `cubic-bezier()` string. */
const EASE_OUT = [0.22, 1, 0.36, 1]

function clampMs(value) {
  const ms = Number(value)
  if (!Number.isFinite(ms) || ms <= 0) return 0
  return Math.min(ms, MAX_MOTION_MS)
}

/**
 * Decorative entrance wrapper: fades and lifts its children into place as they
 * scroll into view.
 *
 * The motion is purely decorative. While Reduced_Motion_Preference is active a
 * plain `div` is rendered in the FINAL visual state - full opacity, no
 * transform, no delay, no transition - so content is present and operable
 * immediately either way (Requirements 9.5, 10.15).
 *
 * @param {object} props
 * @param {number} [props.delay=0] - Entrance delay in ms, clamped to 0-600.
 * @param {number} [props.y=16] - Starting vertical offset in CSS pixels.
 * @param {boolean} [props.once=true] - Animate only the first time in view.
 * @param {import('react').ElementType} [props.as='div'] - Rendered element.
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 *
 * Requirements: 9.3, 9.5, 9.6, 10.15
 */
export function Reveal({
  delay = 0,
  y = 16,
  once = true,
  as = 'div',
  className,
  children,
  ...rest
}) {
  const motionSafe = useMotionSafe()

  if (!motionSafe) {
    const Tag = as
    return (
      <Tag
        className={className}
        data-reveal="static"
        style={{ opacity: 1, transform: 'none', transition: 'none' }}
        {...rest}
      >
        {children}
      </Tag>
    )
  }

  const MotionTag = motion[as] ?? motion.div
  const durationMs = clampMs(REVEAL_DURATION_MS)
  const delayMs = clampMs(delay)

  return (
    <MotionTag
      className={className}
      data-reveal="motion"
      data-reveal-duration={durationMs}
      data-reveal-delay={delayMs}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{
        duration: durationMs / 1000,
        delay: delayMs / 1000,
        ease: EASE_OUT,
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

export default Reveal
