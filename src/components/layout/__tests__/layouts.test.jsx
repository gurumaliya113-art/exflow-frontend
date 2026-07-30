// Feature: techy-ui-redesign, task 8.5 - PublicLayout / LegacyLayout page shells
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import PublicLayout from '../PublicLayout'
import LegacyLayout from '../LegacyLayout'
import { MAIN_CONTENT_ID } from '../../system/SkipLink'

const CTA_HEIGHT = 56

const FOCUSABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'

function renderPublic(ui = <p>Public content</p>, props = {}) {
  return render(
    <MemoryRouter initialEntries={['/portfolio']}>
      <PublicLayout {...props}>{ui}</PublicLayout>
    </MemoryRouter>,
  )
}

function renderLegacy(ui = <p>Legacy content</p>, props = {}) {
  return render(
    <MemoryRouter initialEntries={['/partner']}>
      <LegacyLayout {...props}>{ui}</LegacyLayout>
    </MemoryRouter>,
  )
}

/** jsdom reports 0 for every box, so the measured CTA height is stubbed. */
function stubHeight(height = CTA_HEIGHT) {
  return vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    height,
    width: 180,
    top: 0,
    left: 0,
    right: 180,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => {},
  })
}

function scrollTo(y) {
  Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true })
  act(() => {
    fireEvent.scroll(window)
  })
}

beforeEach(() => {
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('skip control', () => {
  it('is the first focusable node of the public shell and targets the main landmark', () => {
    const { container } = renderPublic()

    const first = container.querySelector(FOCUSABLE)
    expect(first).toHaveAttribute('data-slot', 'skip-link')
    expect(first).toHaveAttribute('href', `#${MAIN_CONTENT_ID}`)
  })

  it('is the first focusable node of the legacy shell and targets the main landmark', () => {
    const { container } = renderLegacy()

    const first = container.querySelector(FOCUSABLE)
    expect(first).toHaveAttribute('data-slot', 'skip-link')
    expect(first).toHaveAttribute('href', `#${MAIN_CONTENT_ID}`)
  })
})

describe('main landmark', () => {
  it('carries the id the skip control resolves to in both shells', () => {
    const { unmount } = renderPublic()
    expect(screen.getByRole('main')).toHaveAttribute('id', MAIN_CONTENT_ID)
    unmount()

    renderLegacy()
    expect(screen.getByRole('main')).toHaveAttribute('id', MAIN_CONTENT_ID)
  })

  it('renders route content inside main', () => {
    renderPublic(<p>Public content</p>)

    const main = screen.getByRole('main')
    expect(main).toContainElement(screen.getByText('Public content'))
  })

  it('renders legacy route content inside main', () => {
    renderLegacy(<p>Legacy content</p>)

    const main = screen.getByRole('main')
    expect(main).toContainElement(screen.getByText('Legacy content'))
  })
})

describe('PublicLayout composition', () => {
  it('renders the public header, the full footer, and the floating CTA', () => {
    const { container } = renderPublic()

    expect(container.querySelector('[data-slot="site-header"]')).toHaveAttribute(
      'data-variant',
      'public',
    )
    expect(container.querySelector('footer')).toHaveAttribute('data-footer-variant', 'full')

    scrollTo(120)
    expect(document.querySelector('[data-slot="floating-cta"]')).not.toBeNull()
  })

  it('reserves bottom padding once the floating CTA reports a height', () => {
    stubHeight(CTA_HEIGHT)
    const { container } = renderPublic()

    const shell = container.querySelector('[data-slot="public-layout"]')
    expect(shell.style.paddingBottom).toBe('0px')

    scrollTo(120)
    expect(shell.style.paddingBottom).toBe(`calc(${CTA_HEIGHT}px + var(--space-5))`)
  })
})

describe('LegacyLayout composition', () => {
  it('renders the legacy header and the compact footer', () => {
    const { container } = renderLegacy()

    expect(container.querySelector('[data-slot="site-header"]')).toHaveAttribute(
      'data-variant',
      'legacy',
    )
    expect(container.querySelector('footer')).toHaveAttribute('data-footer-variant', 'compact')
  })

  it('renders no floating CTA, even when scrolled', () => {
    renderLegacy()
    scrollTo(400)

    expect(document.querySelector('[data-slot="floating-cta"]')).toBeNull()
  })
})
