// Unit tests for the resilient image primitive.
// Requirements: 12.1, 12.2, 12.3, 12.4
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import SafeImage from '../SafeImage'

function box(wrapper) {
  return {
    aspectRatio: wrapper.style.aspectRatio,
    width: wrapper.style.width,
    height: wrapper.style.height,
  }
}

describe('SafeImage', () => {
  it('reserves the box from explicit width/height and covers it without stretching', () => {
    const { container } = render(
      <SafeImage src="/portfolio/fleet.png" alt="Fleet dashboard" width={640} height={360} />
    )

    const wrapper = container.querySelector('[data-safe-image]')
    expect(wrapper).toHaveStyle({ width: '640px', height: '360px' })
    expect(wrapper.style.aspectRatio).toBe('640 / 360')
    expect(wrapper.className).toContain('overflow-hidden')

    const img = screen.getByAltText('Fleet dashboard')
    expect(img).toHaveAttribute('width', '640')
    expect(img).toHaveAttribute('height', '360')
    expect(img.className).toContain('object-cover')
    expect(img.className).toContain('h-full')
    expect(img.className).toContain('w-full')
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('decoding', 'async')
  })

  it('reserves the box from a ratio aspect wrapper', () => {
    const { container } = render(
      <SafeImage src="/portfolio/gtc.png" alt="GTC case study" ratio="16/9" />
    )

    const wrapper = container.querySelector('[data-safe-image]')
    expect(wrapper.style.aspectRatio).toBe('16 / 9')
    expect(wrapper.className).toContain('w-full')
  })

  it('keeps the identical reserved box and shows alt text when the image fails to load', () => {
    const { container } = render(
      <SafeImage src="/missing.png" alt="Scrapco operations console" width={480} height={270} />
    )

    const wrapper = container.querySelector('[data-safe-image]')
    const before = box(wrapper)
    expect(wrapper).toHaveAttribute('data-state', 'ok')

    fireEvent.error(screen.getByAltText('Scrapco operations console'))

    const after = container.querySelector('[data-safe-image]')
    expect(after).toBe(wrapper)
    expect(after).toHaveAttribute('data-state', 'error')
    expect(box(after)).toEqual(before)
    expect(box(after)).toEqual({ aspectRatio: '480 / 270', width: '480px', height: '270px' })

    const placeholder = container.querySelector('[data-safe-image-placeholder]')
    expect(placeholder).not.toBeNull()
    expect(placeholder).toHaveTextContent('Scrapco operations console')
    expect(placeholder).not.toHaveAttribute('aria-hidden')
    expect(placeholder.className).toContain('absolute')
    expect(placeholder.className).toContain('inset-0')
    expect(container.querySelector('img')).toBeNull()
  })

  it('renders an aria-hidden placeholder with no text when the alt is empty', () => {
    const { container } = render(
      <SafeImage src="/motif.svg" alt="" ratio="1/1" width={120} height={120} />
    )

    const img = container.querySelector('img')
    expect(img).toHaveAttribute('alt', '')
    expect(img).toHaveAttribute('aria-hidden', 'true')

    fireEvent.error(img)

    const placeholder = container.querySelector('[data-safe-image-placeholder]')
    expect(placeholder).toHaveAttribute('aria-hidden', 'true')
    expect(placeholder.textContent).toBe('')
    expect(container.querySelector('[data-safe-image]').style.aspectRatio).toBe('1 / 1')
  })

  it('does not hide or block sibling route content when a decorative asset fails', () => {
    const { container } = render(
      <section>
        <h2>Our work</h2>
        <SafeImage src="/motif.svg" alt="" ratio="3/2" />
        <p>Eight shipped systems.</p>
        <button type="button">Book A Call</button>
      </section>
    )

    fireEvent.error(container.querySelector('img'))

    expect(screen.getByRole('heading', { name: 'Our work' })).toBeVisible()
    expect(screen.getByText('Eight shipped systems.')).toBeVisible()
    const cta = screen.getByRole('button', { name: 'Book A Call' })
    expect(cta).toBeVisible()
    expect(cta).toBeEnabled()
  })

  it('warns in development when no box is reserved', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(<SafeImage src="/portfolio/fogg.png" alt="Fogg storefront" />)

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[SafeImage]'))
    warn.mockRestore()
  })
})
