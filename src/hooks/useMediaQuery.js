import { useEffect, useState } from 'react'

/**
 * Subscribe to a CSS media query and re-render when its match state flips.
 *
 * Returns `false` during SSR or when `matchMedia` is unavailable, so callers
 * get the "no special condition" branch instead of crashing.
 *
 * @param {string} query - A media query string, e.g. `(min-width: 768px)`.
 * @returns {boolean} Whether the query currently matches.
 *
 * Requirements: 9.5, 9.6
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => getMatches(query))

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const list = window.matchMedia(query)
    // Re-sync in case the preference changed between render and subscription.
    setMatches(list.matches)

    const onChange = (event) => {
      setMatches(typeof event?.matches === 'boolean' ? event.matches : list.matches)
    }

    if (typeof list.addEventListener === 'function') {
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    }

    // Safari < 14 and other legacy implementations.
    list.addListener(onChange)
    return () => list.removeListener(onChange)
  }, [query])

  return matches
}

function getMatches(query) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia(query).matches
}

export default useMediaQuery
