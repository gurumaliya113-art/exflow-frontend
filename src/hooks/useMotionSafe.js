import { useMediaQuery } from './useMediaQuery'

/** The media query that expresses Reduced_Motion_Preference. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Whether decorative motion is allowed - the inverse of
 * `(prefers-reduced-motion: reduce)`.
 *
 * Callers gate decorative transforms, entrance animations, parallax, and
 * autoplay movement on this value. State feedback (hover, focus, selection,
 * loading, success, error) must render regardless of it.
 *
 * @returns {boolean} `false` while Reduced_Motion_Preference is active.
 *
 * Requirements: 9.5, 9.6, 10.15
 */
export function useMotionSafe() {
  return !useMediaQuery(REDUCED_MOTION_QUERY)
}

export default useMotionSafe
