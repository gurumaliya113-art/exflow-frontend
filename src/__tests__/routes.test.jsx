/**
 * Route wiring tests for task 8.7.
 *
 * The route table must stay byte-identical to the pre-redesign one; only the
 * shell each group renders inside changed. These tests pin both halves: the
 * exact path set (Requirements 8.11, 8.12, 11.1, 11.2) and the shell each path
 * renders inside (Requirement 8.1).
 *
 * The pages still carry their own inline chrome at this point in the migration
 * (removed by tasks 12.x / 14.1), so the assertions target the shell's own
 * markers - `data-slot`, `data-variant`, `data-footer-variant` - which only the
 * new layout components emit.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'

// No test performs network I/O: EnquireModal, ContactPage, and EnquirePage all
// reach for the Supabase client at module load.
vi.mock('@/lib/supabase', () => import('@/test/mocks/supabase'))

import {
  AppRoutes,
  PUBLIC_ROUTE_PATHS,
  LEGACY_ROUTE_PATHS,
  REDIRECT_ROUTE_PATHS,
} from '../App'
import { resetSupabaseMock } from '@/test/mocks/supabase'

/** The pre-change route table, transcribed from the source baseline. */
const BASELINE_PUBLIC_PATHS = [
  '/',
  '/portfolio',
  '/solutions',
  '/industries',
  '/about',
  '/blogs',
  '/contact',
]

const BASELINE_LEGACY_PATHS = [
  '/home-old',
  '/partner',
  '/partner-benefits',
  '/enquire',
  '/work-benefits',
]

const BASELINE_REDIRECT_PATHS = ['/our-work', '*']

let currentPath = null

function LocationProbe() {
  const location = useLocation()
  currentPath = location.pathname
  return null
}

function renderAt(path) {
  currentPath = null
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LocationProbe />
      <AppRoutes />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  resetSupabaseMock()
})

describe('route table', () => {
  it('defines exactly the pre-change path set', () => {
    expect(PUBLIC_ROUTE_PATHS).toEqual(BASELINE_PUBLIC_PATHS)
    expect(LEGACY_ROUTE_PATHS).toEqual(BASELINE_LEGACY_PATHS)
    expect(REDIRECT_ROUTE_PATHS).toEqual(BASELINE_REDIRECT_PATHS)
  })
})

describe('Public_Routes render inside the public shell', () => {
  it.each(BASELINE_PUBLIC_PATHS)('%s uses PublicLayout', (path) => {
    const { container } = renderAt(path)

    expect(currentPath).toBe(path)
    expect(container.querySelector('[data-slot="public-layout"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="legacy-layout"]')).toBeNull()

    const header = container.querySelector('[data-slot="site-header"]')
    expect(header).not.toBeNull()
    expect(header).toHaveAttribute('data-variant', 'public')

    expect(container.querySelectorAll('[data-footer-variant="full"]')).toHaveLength(1)
    expect(container.querySelector('[data-footer-variant="compact"]')).toBeNull()
  })
})

describe('Legacy_Routes render inside the legacy shell', () => {
  it.each(BASELINE_LEGACY_PATHS)('%s uses LegacyLayout', (path) => {
    const { container } = renderAt(path)

    expect(currentPath).toBe(path)
    expect(container.querySelector('[data-slot="legacy-layout"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="public-layout"]')).toBeNull()

    const header = container.querySelector('[data-slot="site-header"]')
    expect(header).not.toBeNull()
    expect(header).toHaveAttribute('data-variant', 'legacy')

    expect(container.querySelectorAll('[data-footer-variant="compact"]')).toHaveLength(1)
    expect(container.querySelector('[data-footer-variant="full"]')).toBeNull()
  })
})

describe('redirects', () => {
  it('sends /our-work to /portfolio without rendering /our-work content', () => {
    const { container } = renderAt('/our-work')

    expect(currentPath).toBe('/portfolio')
    // The redirect target owns the render: the public shell, not a legacy one.
    expect(container.querySelector('[data-slot="public-layout"]')).not.toBeNull()
    expect(screen.queryByText(/our-work/i)).toBeNull()
  })

  it.each(['/does-not-exist', '/portfolio/extra', '/partner/apply', '/blog'])(
    'sends the undefined path %s to /',
    (path) => {
      renderAt(path)
      expect(currentPath).toBe('/')
    },
  )
})
