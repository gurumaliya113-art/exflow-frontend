// Feature: techy-ui-redesign, task 8.6 - FloatingCta with overlap compensation
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { FloatingCta, useFloatingCtaInset, ENQUIRY_EVENT } from '../FloatingCta'
import { setReducedMotion } from '../../../test/setup'

const CTA_HEIGHT = 56

/** jsdom reports 0 for every box, so the measured height is stubbed. */
function stubHeight(height = CTA_HEIGHT) {
  return vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValue({
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

function findCta() {
  return document.querySelector('[data-slot="floating-cta"]')
}

beforeEach(() => {
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('FloatingCta visibility', () => {
  it('is hidden before the scroll threshold', () => {
    render(<FloatingCta />)
    expect(screen.queryByRole('button', { name: 'Book A Call' })).not.toBeInTheDocument()
  })

  it('is visible once the page is scrolled past the threshold', () => {
    render(<FloatingCta />)
    scrollTo(21)
    expect(screen.getByRole('button', { name: 'Book A Call' })).toBeInTheDocument()
  })

  it('stays hidden exactly at the threshold', () => {
    render(<FloatingCta />)
    scrollTo(20)
    expect(screen.queryByRole('button', { name: 'Book A Call' })).not.toBeInTheDocument()
  })
})

describe('FloatingCta activation', () => {
  it('dispatches the enquiry event by default', () => {
    const listener = vi.fn()
    window.addEventListener(ENQUIRY_EVENT, listener)
    render(<FloatingCta />)
    scrollTo(120)

    fireEvent.click(screen.getByRole('button', { name: 'Book A Call' }))

    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener(ENQUIRY_EVENT, listener)
  })

  it('calls onActivate instead when provided', () => {
    const onActivate = vi.fn()
    const listener = vi.fn()
    window.addEventListener(ENQUIRY_EVENT, listener)
    render(<FloatingCta onActivate={onActivate} />)
    scrollTo(120)

    fireEvent.click(screen.getByRole('button', { name: 'Book A Call' }))

    expect(onActivate).toHaveBeenCalledTimes(1)
    expect(listener).not.toHaveBeenCalled()
    window.removeEventListener(ENQUIRY_EVENT, listener)
  })
})

describe('FloatingCta overlap compensation', () => {
  it('reports the rendered height while visible and 0 while hidden', () => {
    stubHeight(CTA_HEIGHT)
    const onHeightChange = vi.fn()
    render(<FloatingCta onHeightChange={onHeightChange} />)

    expect(onHeightChange).toHaveBeenLastCalledWith(0)

    scrollTo(120)
    expect(onHeightChange).toHaveBeenLastCalledWith(CTA_HEIGHT)
  })

  it('surfaces the height as a bottom inset through useFloatingCtaInset', () => {
    stubHeight(CTA_HEIGHT)

    function Harness() {
      const { inset, onHeightChange } = useFloatingCtaInset()
      return (
        <div>
          <div data-testid="inset" data-inset={inset} />
          <FloatingCta onHeightChange={onHeightChange} />
        </div>
      )
    }

    render(<Harness />)
    expect(screen.getByTestId('inset')).toHaveAttribute('data-inset', '0px')

    scrollTo(120)
    expect(screen.getByTestId('inset')).toHaveAttribute(
      'data-inset',
      `calc(${CTA_HEIGHT}px + var(--space-5))`,
    )
  })
})

describe('FloatingCta styling and motion', () => {
  it('renders the conversion action with the brand variant', () => {
    render(<FloatingCta />)
    scrollTo(120)

    const button = screen.getByRole('button', { name: 'Book A Call' })
    expect(button.className).toContain('bg-brand')
    expect(button.className).toContain('text-brand-ink')
  })

  it('applies no decorative motion when reduced motion is active', () => {
    setReducedMotion(true)
    render(<FloatingCta />)
    scrollTo(120)

    const cta = findCta()
    expect(cta).not.toBeNull()
    expect(cta).toHaveAttribute('data-motion', 'static')
    expect(cta.className).not.toContain('will-change')
    expect(cta.style.transform).toBe('none')
    expect(cta.style.transition).toBe('none')
  })

  it('animates within the allowed duration budget when motion is allowed', () => {
    setReducedMotion(false)
    render(<FloatingCta />)
    scrollTo(120)

    const cta = findCta()
    expect(cta).toHaveAttribute('data-motion', 'animated')
    expect(Number(cta.getAttribute('data-motion-duration'))).toBeLessThanOrEqual(600)
  })
})
