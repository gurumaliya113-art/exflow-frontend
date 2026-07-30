/**
 * Pure index arithmetic for the portfolio carousel.
 *
 * Selection is always a single in-range index. `nextIndex` and `prevIndex` are
 * cyclic and mutual inverses, so next from the final project lands on the first
 * and previous from the first lands on the final (Requirements 6.3, 6.4, 6.5).
 *
 * All helpers are defensive: an empty list (`n <= 0`) or a non-finite index or
 * count yields `0` instead of `NaN` or a throw, so a caller rendering an empty
 * carousel never crashes.
 */

/** Coerces a value to a non-negative integer count; anything invalid means 0. */
function toCount(n) {
  const count = Math.trunc(Number(n))
  return Number.isFinite(count) && count > 0 ? count : 0
}

/**
 * Coerces a value to an integer index. `NaN` and non-numeric input mean 0;
 * infinities are kept so `clampIndex` pulls them to the nearest end.
 */
function toIndex(i) {
  const index = Math.trunc(Number(i))
  return Number.isNaN(index) ? 0 : index
}

/**
 * Constrains an index to `[0, n - 1]`. Returns 0 when there is nothing to
 * select. Out-of-range values are pulled to the nearest end rather than wrapped,
 * so a stale index can never point past the end of the list.
 */
export function clampIndex(i, n) {
  const count = toCount(n)
  if (count === 0) return 0
  const index = toIndex(i)
  if (index < 0) return 0
  if (index > count - 1) return count - 1
  return index
}

/**
 * The immediately following project, wrapping from the final project to the
 * first (Requirements 6.3, 6.5).
 */
export function nextIndex(i, n) {
  const count = toCount(n)
  if (count === 0) return 0
  return (clampIndex(i, count) + 1) % count
}

/**
 * The immediately preceding project, wrapping from the first project to the
 * final one (Requirements 6.3, 6.4).
 */
export function prevIndex(i, n) {
  const count = toCount(n)
  if (count === 0) return 0
  return (clampIndex(i, count) - 1 + count) % count
}

/**
 * The live-region announcement for the current carousel position: the selected
 * project's one-based index, the total count, and the project name
 * (Requirement 6.9).
 */
export function positionLabel(i, n, name) {
  const count = toCount(n)
  const index = clampIndex(i, count)
  const label = name == null ? '' : String(name)
  return `Project ${index + 1} of ${count}: ${label}`
}
