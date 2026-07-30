/**
 * Pure active-navigation resolution.
 *
 * `resolveActiveNav` is the single source of truth for which destination the
 * header marks as active. It returns EXACTLY ONE identifier so the rendered
 * header can never highlight two destinations at once (Requirement 2.3):
 *
 *   - `'brand'`  for the home route `/`
 *   - `item.id`  for the first nav item whose destination matches the path
 *   - `null`     for any path that is not in the supplied nav config
 *
 * Matching is case-sensitive on paths (routes are case-sensitive), but trailing
 * slashes, `?query` strings, and `#hash` fragments are normalized away first.
 */

/** Identifier returned for the home route, which the brand mark owns. */
export const BRAND_NAV_ID = 'brand'

/** The home route after normalization. */
export const HOME_PATH = '/'

/**
 * Reduce a raw pathname or nav destination to a comparable path.
 *
 * Drops everything from the first `#` or `?`, guarantees a leading slash, and
 * removes trailing slashes (except for the root). Empty, nullish, and
 * non-string inputs normalize to `'/'` so callers never have to guard.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function normalizePath(value) {
  if (typeof value !== 'string') return HOME_PATH

  let path = value.trim()
  if (path === '') return HOME_PATH

  const hash = path.indexOf('#')
  if (hash !== -1) path = path.slice(0, hash)

  const query = path.indexOf('?')
  if (query !== -1) path = path.slice(0, query)

  if (path === '') return HOME_PATH
  if (!path.startsWith('/')) path = `/${path}`

  while (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1)
  }

  return path
}

/**
 * Resolve the one active navigation identifier for a path.
 *
 * When two nav items share a destination (the legacy nav points both "Blogs"
 * and "Contact" at `/enquire`), the first item in config order wins, so the
 * result stays unique and deterministic.
 *
 * @param {string} pathname current location pathname
 * @param {Array<{ id: string, to: string }>} items nav config in render order
 * @returns {'brand' | string | null}
 */
export function resolveActiveNav(pathname, items) {
  const path = normalizePath(pathname)

  if (path === HOME_PATH) return BRAND_NAV_ID
  if (!Array.isArray(items)) return null

  for (const item of items) {
    if (!item || typeof item.id !== 'string') continue
    if (normalizePath(item.to) === path) return item.id
  }

  return null
}
