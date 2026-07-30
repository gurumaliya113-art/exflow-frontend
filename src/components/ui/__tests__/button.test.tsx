import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button, buttonVariants } from '../button'

/**
 * Component tests for the token-backed Button primitive (task 6.7).
 * Requirements: 1.3, 3.8, 9.1, 9.2, 9.7
 */

const VARIANTS = ['brand', 'tech', 'outline', 'ghost', 'danger'] as const
const SIZES = ['sm', 'md', 'lg', 'icon'] as const

function classesOf(className: string) {
  return className.split(/\s+/).filter(Boolean)
}

describe('Button variants', () => {
  it('renders every variant as an operable button', () => {
    for (const variant of VARIANTS) {
      const { unmount } = render(<Button variant={variant}>Book A Call</Button>)
      const button = screen.getByRole('button', { name: 'Book A Call' })
      expect(button).toBeEnabled()
      unmount()
    }
  })

  it('paints --color-brand for the brand variant only', () => {
    const brand = classesOf(buttonVariants({ variant: 'brand' }))
    expect(brand).toContain('bg-brand')

    for (const variant of VARIANTS.filter((v) => v !== 'brand')) {
      const classes = classesOf(buttonVariants({ variant }))
      expect(classes.some((c) => /(^|:)bg-brand/.test(c))).toBe(false)
      expect(classes.some((c) => /(^|:)border-brand/.test(c))).toBe(false)
    }
  })

  it('defaults to the tech variant so no unspecified button paints brand', () => {
    const defaults = classesOf(buttonVariants({}))
    expect(defaults).toContain('bg-tech-blue')
    expect(defaults.some((c) => /(^|:)bg-brand/.test(c))).toBe(false)
  })

  it('gives hover, active, disabled, and selected states a non-color signal', () => {
    const classes = classesOf(buttonVariants({ variant: 'brand' }))
    // active -> shadow + shift, disabled -> dashed border, selected -> underline
    expect(classes).toContain('active:shadow-flat')
    expect(classes).toContain('active:translate-y-px')
    expect(classes).toContain('disabled:border-dashed')
    expect(classes).toContain('aria-pressed:underline')
    // hover carries a shadow change on top of the color change
    expect(classes).toContain('hover:shadow-raise')
    // the global :focus-visible ring is not suppressed
    expect(classes.some((c) => c.includes('outline-none'))).toBe(false)
  })
})

describe('Button sizes', () => {
  it('reserves a 44px touch target below md for every size', () => {
    for (const size of SIZES) {
      const classes = classesOf(buttonVariants({ size }))
      expect(classes).toContain('min-h-[var(--size-touch)]')
      // any compaction is gated behind the md breakpoint
      const unprefixedCompaction = classes.filter(
        (c) => /^min-[hw]-\d/.test(c) || /^h-\d/.test(c),
      )
      expect(unprefixedCompaction).toEqual([])
    }
  })

  it('gives the icon size a 44px minimum width as well', () => {
    const classes = classesOf(buttonVariants({ size: 'icon' }))
    expect(classes).toContain('min-w-[var(--size-touch)]')
  })

  it('applies the size classes to the rendered element', () => {
    render(
      <Button size="lg" variant="outline">
        View Portfolio
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'View Portfolio' })
    expect(button.className).toContain('min-h-[var(--size-touch)]')
    expect(button.className).toContain('md:min-h-12')
  })
})

describe('Button loading state', () => {
  it('sets aria-busy, disables the control, and keeps the label text', () => {
    render(<Button loading>Submit Enquiry</Button>)

    const button = screen.getByRole('button', { name: 'Submit Enquiry' })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Submit Enquiry')
    expect(button.querySelector('[data-slot="spinner"]')).not.toBeNull()
  })

  it('does not fire click handlers while loading', async () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Submit Enquiry
      </Button>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Submit Enquiry' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders no spinner and stays enabled when not loading', () => {
    render(<Button>Submit Enquiry</Button>)

    const button = screen.getByRole('button', { name: 'Submit Enquiry' })
    expect(button).not.toHaveAttribute('aria-busy')
    expect(button).toBeEnabled()
    expect(button.querySelector('[data-slot="spinner"]')).toBeNull()
  })

  it('keeps the same size classes loading and idle so the width cannot jump', () => {
    const { rerender, container } = render(<Button size="md">Submit Enquiry</Button>)
    const idle = (container.firstElementChild as HTMLElement).className

    rerender(
      <Button size="md" loading>
        Submit Enquiry
      </Button>,
    )
    expect((container.firstElementChild as HTMLElement).className).toBe(idle)
  })
})

describe('Button asChild', () => {
  it('renders the slotted element with the button classes', () => {
    render(
      <Button asChild variant="outline" size="lg">
        <a href="/portfolio">View Portfolio</a>
      </Button>,
    )

    const link = screen.getByRole('link', { name: 'View Portfolio' })
    expect(link).toHaveAttribute('href', '/portfolio')
    expect(link.className).toContain('border-content-muted')
    expect(link.className).toContain('min-h-[var(--size-touch)]')
    expect(link.tagName).toBe('A')
  })

  it('expresses loading on a slotted element without a disabled attribute', () => {
    render(
      <Button asChild loading>
        <a href="/enquire">Enquire Now</a>
      </Button>,
    )

    const link = screen.getByRole('link', { name: 'Enquire Now' })
    expect(link).toHaveAttribute('aria-busy', 'true')
    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).not.toHaveAttribute('disabled')
  })
})
