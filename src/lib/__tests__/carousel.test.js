import { describe, it, expect } from 'vitest'
import {
  nextIndex,
  prevIndex,
  clampIndex,
  positionLabel,
} from '../carousel'

const N = 8 // the portfolio ships eight projects

describe('clampIndex', () => {
  it('keeps in-range indices unchanged', () => {
    expect(clampIndex(0, N)).toBe(0)
    expect(clampIndex(3, N)).toBe(3)
    expect(clampIndex(N - 1, N)).toBe(N - 1)
  })

  it('pulls out-of-range indices to the nearest end', () => {
    expect(clampIndex(-5, N)).toBe(0)
    expect(clampIndex(N, N)).toBe(N - 1)
    expect(clampIndex(999, N)).toBe(N - 1)
  })

  it('returns 0 for an empty list and non-finite input', () => {
    expect(clampIndex(2, 0)).toBe(0)
    expect(clampIndex(2, -3)).toBe(0)
    expect(clampIndex(NaN, N)).toBe(0)
    expect(clampIndex(Infinity, N)).toBe(N - 1)
    expect(clampIndex(1, NaN)).toBe(0)
    expect(clampIndex(undefined, undefined)).toBe(0)
  })
})

describe('nextIndex', () => {
  it('advances to the immediately following project', () => {
    expect(nextIndex(0, N)).toBe(1)
    expect(nextIndex(6, N)).toBe(7)
  })

  it('wraps from the final project to the first', () => {
    expect(nextIndex(N - 1, N)).toBe(0)
  })

  it('stays on the only project in a single-item list', () => {
    expect(nextIndex(0, 1)).toBe(0)
  })

  it('returns 0 for an empty list or invalid input', () => {
    expect(nextIndex(0, 0)).toBe(0)
    expect(nextIndex(NaN, NaN)).toBe(0)
  })
})

describe('prevIndex', () => {
  it('steps back to the immediately preceding project', () => {
    expect(prevIndex(1, N)).toBe(0)
    expect(prevIndex(7, N)).toBe(6)
  })

  it('wraps from the first project to the final one', () => {
    expect(prevIndex(0, N)).toBe(N - 1)
  })

  it('stays on the only project in a single-item list', () => {
    expect(prevIndex(0, 1)).toBe(0)
  })

  it('returns 0 for an empty list or invalid input', () => {
    expect(prevIndex(0, 0)).toBe(0)
    expect(prevIndex(undefined, undefined)).toBe(0)
  })
})

describe('nextIndex and prevIndex are mutual inverses', () => {
  it('round-trips every index in both directions', () => {
    for (let i = 0; i < N; i += 1) {
      expect(prevIndex(nextIndex(i, N), N)).toBe(i)
      expect(nextIndex(prevIndex(i, N), N)).toBe(i)
    }
  })

  it('returns to the start after n steps in either direction', () => {
    let forward = 0
    let backward = 0
    for (let step = 0; step < N; step += 1) {
      forward = nextIndex(forward, N)
      backward = prevIndex(backward, N)
    }
    expect(forward).toBe(0)
    expect(backward).toBe(0)
  })

  it('always produces an in-range index', () => {
    for (let i = -3; i < N + 3; i += 1) {
      expect(nextIndex(i, N)).toBeGreaterThanOrEqual(0)
      expect(nextIndex(i, N)).toBeLessThan(N)
      expect(prevIndex(i, N)).toBeGreaterThanOrEqual(0)
      expect(prevIndex(i, N)).toBeLessThan(N)
    }
  })
})

describe('positionLabel', () => {
  it('renders the one-based index, total count, and project name', () => {
    expect(positionLabel(2, 8, 'EzDry')).toBe('Project 3 of 8: EzDry')
    expect(positionLabel(0, 8, 'Fleet')).toBe('Project 1 of 8: Fleet')
    expect(positionLabel(7, 8, 'Gurtron')).toBe('Project 8 of 8: Gurtron')
  })

  it('clamps an out-of-range index before formatting', () => {
    expect(positionLabel(99, 8, 'ScrapCo')).toBe('Project 8 of 8: ScrapCo')
    expect(positionLabel(-1, 8, 'ScrapCo')).toBe('Project 1 of 8: ScrapCo')
  })

  it('renders an empty name without throwing', () => {
    expect(positionLabel(0, 1, '')).toBe('Project 1 of 1: ')
    expect(positionLabel(0, 1, undefined)).toBe('Project 1 of 1: ')
  })
})
