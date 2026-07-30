import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useScrollLock, getScrollbarWidth } from '../useScrollLock'

/**
 * jsdom computes no layout, so `innerWidth - clientWidth` is 0 and the gutter
 * compensation is a no-op here. These tests therefore assert the recorded and
 * restored values rather than pixel math: the lock must be an exact inverse of
 * whatever the body carried before it engaged.
 */
function setScroll(x, y) {
  Object.defineProperty(window, 'scrollX', { configurable: true, writable: true, value: x })
  Object.defineProperty(window, 'pageXOffset', { configurable: true, writable: true, value: x })
  Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: y })
  Object.defineProperty(window, 'pageYOffset', { configurable: true, writable: true, value: y })
}

describe('getScrollbarWidth', () => {
  it('never reports a negative width', () => {
    expect(getScrollbarWidth()).toBeGreaterThanOrEqual(0)
  })
})

describe('useScrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
    setScroll(0, 0)
  })

  afterEach(() => {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  })

  it('applies overflow hidden to the body while locked', () => {
    renderHook(() => useScrollLock(true))
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('is a no-op while inactive', () => {
    document.body.style.overflow = 'auto'
    renderHook(() => useScrollLock(false))
    expect(document.body.style.overflow).toBe('auto')
  })

  it('restores the original inline overflow on release', () => {
    document.body.style.overflow = 'auto'
    const { rerender } = renderHook(({ active }) => useScrollLock(active), {
      initialProps: { active: true },
    })
    expect(document.body.style.overflow).toBe('hidden')

    rerender({ active: false })
    expect(document.body.style.overflow).toBe('auto')
  })

  it('leaves the body with no inline overflow when there was none before', () => {
    const { rerender } = renderHook(({ active }) => useScrollLock(active), {
      initialProps: { active: true },
    })
    rerender({ active: false })
    expect(document.body.style.overflow).toBe('')
    expect(document.body.style.paddingRight).toBe('')
  })

  it('preserves the background scroll position across a lock and release cycle', () => {
    setScroll(0, 640)
    const { rerender } = renderHook(({ active }) => useScrollLock(active), {
      initialProps: { active: true },
    })
    // `overflow: hidden` keeps scrollTop, so nothing moves while locked.
    expect(window.scrollY).toBe(640)

    rerender({ active: false })
    expect(window.scrollY).toBe(640)
  })

  it('re-applies the recorded offsets when the page moved while locked', () => {
    setScroll(0, 640)
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    const { rerender } = renderHook(({ active }) => useScrollLock(active), {
      initialProps: { active: true },
    })
    // Simulate a browser that reset the offset while the lock was engaged.
    setScroll(0, 0)
    rerender({ active: false })

    expect(scrollTo).toHaveBeenCalledWith(0, 640)
    scrollTo.mockRestore()
  })

  it('releases the lock on unmount', () => {
    document.body.style.overflow = 'scroll'
    const { unmount } = renderHook(() => useScrollLock(true))
    expect(document.body.style.overflow).toBe('hidden')

    unmount()
    expect(document.body.style.overflow).toBe('scroll')
  })
})
