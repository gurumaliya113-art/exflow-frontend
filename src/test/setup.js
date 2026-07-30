// Vitest global setup for the techy-ui-redesign test harness.
// Loaded via `test.setupFiles` in vite.config.js.
import '@testing-library/jest-dom/vitest'
import * as axeMatchers from 'vitest-axe/matchers'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

expect.extend(axeMatchers)

/**
 * jsdom implements neither matchMedia nor ResizeObserver. Both are required by
 * the reduced-motion hooks, the responsive layout primitives, and recharts.
 * `matchMedia` is mocked as a controllable store so tests can flip
 * `prefers-reduced-motion` and viewport queries.
 */
const mediaQueryState = new Map()

function normalizeQuery(query) {
  return String(query).trim()
}

function createMediaQueryList(query) {
  const listeners = new Set()
  const list = {
    media: query,
    get matches() {
      return mediaQueryState.get(normalizeQuery(query)) === true
    },
    onchange: null,
    addEventListener: (type, listener) => {
      if (type === 'change') listeners.add(listener)
    },
    removeEventListener: (type, listener) => {
      if (type === 'change') listeners.delete(listener)
    },
    // Deprecated API kept for libraries that still call it.
    addListener: (listener) => listeners.add(listener),
    removeListener: (listener) => listeners.delete(listener),
    dispatchEvent: (event) => {
      listeners.forEach((listener) => listener(event))
      if (typeof list.onchange === 'function') list.onchange(event)
      return true
    },
    __listeners: listeners,
  }
  return list
}

const mediaQueryLists = new Map()

/** Set the match result for a media query and notify subscribers. */
export function setMediaQuery(query, matches) {
  const key = normalizeQuery(query)
  mediaQueryState.set(key, matches)
  const list = mediaQueryLists.get(key)
  if (list) {
    list.dispatchEvent({ type: 'change', matches, media: key })
  }
}

/** Reset every mocked media query back to "does not match". */
export function resetMediaQueries() {
  mediaQueryState.clear()
}

/** Convenience helper for the reduced-motion properties. */
export function setReducedMotion(enabled) {
  setMediaQuery('(prefers-reduced-motion: reduce)', enabled)
}

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query) => {
      const key = normalizeQuery(query)
      if (!mediaQueryLists.has(key)) {
        mediaQueryLists.set(key, createMediaQueryList(key))
      }
      return mediaQueryLists.get(key)
    },
  })
}

class ResizeObserverMock {
  constructor(callback) {
    this.callback = callback
    this.observed = new Set()
  }
  observe(target) {
    this.observed.add(target)
  }
  unobserve(target) {
    this.observed.delete(target)
  }
  disconnect() {
    this.observed.clear()
  }
}

if (!window.ResizeObserver) {
  window.ResizeObserver = ResizeObserverMock
  globalThis.ResizeObserver = ResizeObserverMock
}

if (!window.IntersectionObserver) {
  class IntersectionObserverMock {
    constructor(callback) {
      this.callback = callback
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  window.IntersectionObserver = IntersectionObserverMock
  globalThis.IntersectionObserver = IntersectionObserverMock
}

if (!window.scrollTo) {
  window.scrollTo = () => {}
}

// jsdom has no canvas implementation. axe-core probes `getContext` while
// checking for icon ligatures, which logs a noisy "not implemented" error.
// Contrast is asserted from `lib/tokens.js` (Property 1), not by pixel sampling.
if (typeof window.HTMLCanvasElement !== 'undefined') {
  window.HTMLCanvasElement.prototype.getContext = () => null
}

afterEach(() => {
  cleanup()
  resetMediaQueries()
  vi.clearAllMocks()
})
