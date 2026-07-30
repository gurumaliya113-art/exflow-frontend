import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { setMediaQuery, setReducedMotion } from '../../test/setup'
import { useMediaQuery } from '../useMediaQuery'
import { useMotionSafe, REDUCED_MOTION_QUERY } from '../useMotionSafe'

describe('useMediaQuery', () => {
  it('reports the current match state on mount', () => {
    setMediaQuery('(min-width: 768px)', true)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(true)
  })

  it('reacts when the query flips', () => {
    setMediaQuery('(min-width: 768px)', false)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)

    act(() => setMediaQuery('(min-width: 768px)', true))
    expect(result.current).toBe(true)

    act(() => setMediaQuery('(min-width: 768px)', false))
    expect(result.current).toBe(false)
  })

  it('unsubscribes on unmount', () => {
    const list = window.matchMedia('(min-width: 1024px)')
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 1024px)'))
    expect(list.__listeners.size).toBe(1)
    unmount()
    expect(list.__listeners.size).toBe(0)
  })
})

describe('useMotionSafe', () => {
  it('allows motion while the reduced-motion preference is inactive', () => {
    setReducedMotion(false)
    const { result } = renderHook(() => useMotionSafe())
    expect(result.current).toBe(true)
  })

  it('inverts the reduced-motion preference when it flips on and off', () => {
    setReducedMotion(false)
    const { result } = renderHook(() => useMotionSafe())
    expect(result.current).toBe(true)

    act(() => setReducedMotion(true))
    expect(result.current).toBe(false)

    act(() => setReducedMotion(false))
    expect(result.current).toBe(true)
  })

  it('reads the reduced-motion query', () => {
    expect(REDUCED_MOTION_QUERY).toBe('(prefers-reduced-motion: reduce)')
    setReducedMotion(true)
    const { result } = renderHook(() => useMotionSafe())
    expect(result.current).toBe(false)
  })
})
