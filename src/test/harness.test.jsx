// Harness smoke test: proves the Vitest/jsdom/Testing Library/fast-check/axe
// stack boots and that `lib/supabase` is mocked at the module boundary.
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import fc from 'fast-check'
import { axe } from 'vitest-axe'
import { setReducedMotion } from './setup.js'

vi.mock('@/lib/supabase', () => import('@/test/mocks/supabase'))
const { getSupabase, insertCalls, resetSupabaseMock } = await import('./mocks/supabase.js')

describe('test harness', () => {
  it('renders React with jest-dom matchers', () => {
    render(<button type="button">Book A Call</button>)
    expect(screen.getByRole('button', { name: 'Book A Call' })).toBeInTheDocument()
  })

  it('exposes matchMedia and ResizeObserver', () => {
    setReducedMotion(true)
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true)
    expect(new ResizeObserver(() => {})).toBeTruthy()
  })

  it('runs fast-check properties', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (n) => n % n === 0),
      { numRuns: 100 }
    )
  })

  it('runs axe matchers', async () => {
    const { container } = render(
      <main>
        <h1>Heading</h1>
      </main>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('mocks supabase at the module boundary', async () => {
    resetSupabaseMock()
    const { error } = await getSupabase().from('enquiries').insert([{ name: 'a' }])
    expect(error).toBeNull()
    expect(insertCalls).toEqual([{ table: 'enquiries', rows: [{ name: 'a' }] }])
  })
})
