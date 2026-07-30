/**
 * Accessibility calculations for the techy-ui-redesign design system.
 *
 * Everything here is pure and DOM-independent except `headingOutline`, which
 * reads heading levels from a DOM container.
 *
 * Requirements: 10.2 (large-text thresholds), 10.3 (contrast ratios),
 * 10.5 (heading outline).
 */

/** WCAG_AA large-text threshold in CSS pixels for unbolded text. */
export const LARGE_TEXT_PX = 24

/** WCAG_AA large-text threshold in CSS pixels for bolded text. */
export const LARGE_TEXT_BOLD_PX = 18.66

/** Numeric font weight at or above which text counts as bolded. */
export const BOLD_WEIGHT = 700

const HEX_SHORT = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i
const HEX_LONG = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i
const HEX_LONG_ALPHA = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})[0-9a-f]{2}$/i
const RGB_FUNC = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i

/**
 * Parse a color into 8-bit sRGB channels.
 *
 * Accepts `#rgb`, `#rrggbb`, `#rrggbbaa` (alpha ignored), and
 * `rgb()` / `rgba()` strings. Alpha is ignored because contrast is only
 * meaningful between opaque rendered colors; callers must pass the composited
 * color when translucency is involved.
 *
 * @param {string} color
 * @returns {[number, number, number]} channels in the 0-255 range
 */
export function parseColor(color) {
  if (typeof color !== 'string') {
    throw new TypeError(`Expected a color string, received ${typeof color}`)
  }

  const value = color.trim()

  const short = HEX_SHORT.exec(value)
  if (short) {
    return [
      parseInt(short[1] + short[1], 16),
      parseInt(short[2] + short[2], 16),
      parseInt(short[3] + short[3], 16),
    ]
  }

  const long = HEX_LONG.exec(value) || HEX_LONG_ALPHA.exec(value)
  if (long) {
    return [parseInt(long[1], 16), parseInt(long[2], 16), parseInt(long[3], 16)]
  }

  const func = RGB_FUNC.exec(value)
  if (func) {
    return [clampChannel(func[1]), clampChannel(func[2]), clampChannel(func[3])]
  }

  throw new Error(`Unsupported color format: ${color}`)
}

function clampChannel(raw) {
  const n = Number(raw)
  if (!Number.isFinite(n)) return 0
  return Math.min(255, Math.max(0, n))
}

/**
 * WCAG 2.x relative luminance of a color.
 *
 * L = 0.2126 R + 0.7152 G + 0.0722 B, where each channel is linearized from
 * its 8-bit sRGB value.
 *
 * @param {string} color
 * @returns {number} luminance in the 0-1 range
 */
export function relativeLuminance(color) {
  const [r, g, b] = parseColor(color).map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * WCAG 2.x contrast ratio between a foreground and a background color.
 *
 * The ratio is symmetric and always in the range 1 (identical colors) to 21
 * (black against white).
 *
 * @param {string} fg foreground color (hex or rgb string)
 * @param {string} bg background color (hex or rgb string)
 * @returns {number} contrast ratio from 1 to 21
 */
export function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Whether text at the given size and weight counts as WCAG_AA large text.
 *
 * Requirement 10.2 requires at least 4.5:1 for text smaller than 24 CSS pixels
 * when unbolded, or smaller than 18.66 CSS pixels when bolded, and at least
 * 3:1 for all other text. "All other text" is exactly the large-text set, so
 * this returns true at or above those thresholds.
 *
 * @param {number} sizePx rendered font size in CSS pixels
 * @param {number|string} [weight=400] numeric font weight, or `'bold'` / `'normal'`
 * @returns {boolean}
 */
export function isLargeText(sizePx, weight = 400) {
  const size = Number(sizePx)
  if (!Number.isFinite(size)) return false

  return size >= (isBoldWeight(weight) ? LARGE_TEXT_BOLD_PX : LARGE_TEXT_PX)
}

/**
 * Normalize a CSS font-weight value to the bolded / unbolded distinction.
 *
 * @param {number|string} weight
 * @returns {boolean}
 */
export function isBoldWeight(weight) {
  if (typeof weight === 'number') return weight >= BOLD_WEIGHT

  if (typeof weight === 'string') {
    const value = weight.trim().toLowerCase()
    if (value === 'bold' || value === 'bolder') return true
    if (value === 'normal' || value === 'lighter' || value === '') return false
    const numeric = Number(value)
    return Number.isFinite(numeric) && numeric >= BOLD_WEIGHT
  }

  return false
}

/**
 * The minimum contrast ratio WCAG_AA requires for text of the given size and
 * weight: 3 for large text, 4.5 otherwise.
 *
 * @param {number} sizePx
 * @param {number|string} [weight=400]
 * @returns {number}
 */
export function requiredContrast(sizePx, weight = 400) {
  return isLargeText(sizePx, weight) ? 3 : 4.5
}

/**
 * Heading levels found inside a container, in DOM order.
 *
 * Both native `h1`-`h6` elements and ARIA `role="heading"` elements are
 * collected; an ARIA heading without a valid `aria-level` defaults to level 2,
 * matching the ARIA specification.
 *
 * @param {ParentNode} container element or document fragment to inspect
 * @returns {number[]} heading levels in DOM order
 */
export function headingOutline(container) {
  if (!container || typeof container.querySelectorAll !== 'function') return []

  const nodes = container.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]')

  return Array.from(nodes).map((node) => {
    const tag = String(node.tagName || '').toLowerCase()
    if (/^h[1-6]$/.test(tag) && node.getAttribute('role') !== 'heading') {
      return Number(tag.slice(1))
    }

    const ariaLevel = Number(node.getAttribute('aria-level'))
    if (Number.isInteger(ariaLevel) && ariaLevel >= 1 && ariaLevel <= 6) return ariaLevel

    return /^h[1-6]$/.test(tag) ? Number(tag.slice(1)) : 2
  })
}
