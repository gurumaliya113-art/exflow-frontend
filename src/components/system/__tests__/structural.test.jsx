import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { containerWidths } from '../../../lib/tokens'
import { Container, CONTAINER_WIDTHS, resolveContainerWidth } from '../Container'
import { Section, SECTION_TONES, sectionTones } from '../Section'
import { SectionHeading, checkSectionHeadingSlots } from '../SectionHeading'
import { Eyebrow } from '../Eyebrow'
import { VisuallyHidden } from '../VisuallyHidden'
import { SkipLink } from '../SkipLink'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Container', () => {
  it('maps every named width to the token value', () => {
    expect(CONTAINER_WIDTHS).toEqual(['prose', 'narrow', 'wide', 'max'])

    for (const width of CONTAINER_WIDTHS) {
      const { unmount } = render(
        <Container width={width} data-testid="c">
          content
        </Container>,
      )
      const el = screen.getByTestId('c')
      expect(el.getAttribute('data-container-width')).toBe(width)
      expect(el.style.maxWidth).toContain(`--container-${width}`)
      expect(el.style.maxWidth).toContain(`${containerWidths[width]}px`)
      unmount()
    }
  })

  it('exposes the documented token widths 640 / 960 / 1200 / 1440', () => {
    expect(CONTAINER_WIDTHS.map((w) => containerWidths[w])).toEqual([640, 960, 1200, 1440])
  })

  it('defaults to the wide width and falls back for unknown names', () => {
    render(<Container data-testid="default">a</Container>)
    expect(screen.getByTestId('default').style.maxWidth).toContain('--container-wide')
    expect(resolveContainerWidth('nonsense')).toBe(resolveContainerWidth('wide'))
  })

  it('is the source of horizontal page padding, stepping at md', () => {
    render(<Container data-testid="c">a</Container>)
    const cls = screen.getByTestId('c').className
    expect(cls).toContain('px-[var(--space-4)]')
    expect(cls).toContain('md:px-[var(--space-5)]')
    expect(cls).toContain('mx-auto')
  })

  it('honors the as prop', () => {
    render(
      <Container as="main" id="main" data-testid="c">
        a
      </Container>,
    )
    expect(screen.getByTestId('c').tagName).toBe('MAIN')
  })
})

describe('Section', () => {
  it('applies a token-backed background per tone', () => {
    expect(SECTION_TONES).toEqual(['canvas', 'surface', 'deep'])

    for (const tone of SECTION_TONES) {
      const { unmount } = render(
        <Section tone={tone} data-testid="s">
          body
        </Section>,
      )
      const el = screen.getByTestId('s')
      expect(el.getAttribute('data-tone')).toBe(tone)
      expect(el.className).toContain(sectionTones[tone].split(' ')[0])
      unmount()
    }
  })

  it('renders a section element with vertical rhythm and no horizontal padding', () => {
    render(<Section data-testid="s">body</Section>)
    const el = screen.getByTestId('s')
    expect(el.tagName).toBe('SECTION')
    expect(el.className).toContain('py-[var(--space-7)]')
    expect(el.className).not.toMatch(/(^|\s|:)px-/)
    expect(el.className).not.toMatch(/(^|\s|:)p-/)
  })

  it('renders a backdrop node in a hidden, non-interactive layer', () => {
    render(
      <Section backdrop={<div data-testid="motif" />} data-testid="s">
        body
      </Section>,
    )
    const layer = screen.getByTestId('motif').parentElement
    expect(layer).toHaveAttribute('aria-hidden', 'true')
    expect(layer.className).toContain('pointer-events-none')
    expect(screen.getByTestId('s')).toHaveTextContent('body')
  })

  it('falls back to known tone and pad names', () => {
    render(
      <Section tone="neon" pad="huge" data-testid="s">
        body
      </Section>,
    )
    const el = screen.getByTestId('s')
    expect(el.getAttribute('data-tone')).toBe('canvas')
    expect(el.getAttribute('data-pad')).toBe('md')
  })
})

describe('SectionHeading', () => {
  it('emits exactly one heading at the requested level', () => {
    for (const level of [2, 3, 4]) {
      const { unmount } = render(<SectionHeading level={level} title={`Title ${level}`} />)
      const heading = screen.getByRole('heading', { level })
      expect(heading).toHaveTextContent(`Title ${level}`)
      expect(screen.getAllByRole('heading')).toHaveLength(1)
      unmount()
    }
  })

  it('keeps the eyebrow and lede out of the heading structure', () => {
    render(<SectionHeading title="Services" eyebrow="What we do" lede="Supporting copy." />)
    expect(screen.getAllByRole('heading')).toHaveLength(1)
    expect(screen.getByText('What we do').tagName).toBe('SPAN')
    expect(screen.getByText('Supporting copy.').tagName).toBe('P')
  })

  it('renders at most one action and warns in DEV when given more', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <SectionHeading
        title="Work"
        action={
          <>
            <button type="button">One</button>
            <button type="button">Two</button>
          </>
        }
      />,
    )

    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'One' })).toBeInTheDocument()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('at most one Button')
  })

  it('warns in DEV when a heading element is nested in a slot', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <SectionHeading
        title="Work"
        action={
          <div>
            <h3>Nested</h3>
          </div>
        }
      />,
    )

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('exactly one heading')
  })

  it('does not warn for a single action with one Primary_CTA', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <SectionHeading
        title="Contact"
        action={
          <button type="button" variant="brand">
            Book A Call
          </button>
        }
      />,
    )
    expect(warn).not.toHaveBeenCalled()
  })

  it('reports more than one Primary_CTA through the slot check', () => {
    const warnings = checkSectionHeadingSlots({
      action: (
        <>
          <button type="button" variant="brand">
            A
          </button>
          <button type="button" variant="brand">
            B
          </button>
        </>
      ),
    })
    expect(warnings.some((w) => w.includes('Primary_CTA'))).toBe(true)
  })
})

describe('Eyebrow', () => {
  it('renders a paragraph at meta size, never a heading', () => {
    render(<Eyebrow>Trusted by teams</Eyebrow>)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()

    const el = screen.getByText('Trusted by teams').closest('p')
    expect(el).not.toBeNull()
    expect(el.className).toContain('text-[length:var(--text-meta)]')
    expect(el.className).toContain('text-tech-cyan')
    expect(el.className).not.toMatch(/#[0-9a-f]{3,6}/i)
  })

  it('hides a decorative icon from assistive technology', () => {
    render(<Eyebrow icon={<svg data-testid="glyph" />}>Metrics</Eyebrow>)
    expect(screen.getByTestId('glyph').parentElement).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('VisuallyHidden', () => {
  it('stays in the accessibility tree while being visually hidden', () => {
    render(<VisuallyHidden>Project 1 of 8</VisuallyHidden>)
    const el = screen.getByText('Project 1 of 8')
    expect(el.className).toContain('sr-only')
    expect(el).not.toHaveAttribute('aria-hidden')
    expect(el.className).not.toContain('hidden ')
  })

  it('supports the as prop for live regions', () => {
    render(
      <VisuallyHidden as="div" role="status" aria-live="polite">
        Updated
      </VisuallyHidden>,
    )
    const el = screen.getByRole('status')
    expect(el.tagName).toBe('DIV')
    expect(el).toHaveAttribute('aria-live', 'polite')
  })
})

describe('SkipLink', () => {
  it('targets #main and is hidden until focused', () => {
    render(<SkipLink />)
    const link = screen.getByRole('link', { name: 'Skip to main content' })
    expect(link).toHaveAttribute('href', '#main')
    expect(link.className).toContain('sr-only')
    expect(link.className).toContain('focus-visible:not-sr-only')
  })

  it('is the first focusable node when placed first in a layout', () => {
    render(
      <div>
        <SkipLink />
        <a href="/portfolio">Our Work</a>
        <main id="main">content</main>
      </div>,
    )
    const focusables = Array.from(document.querySelectorAll('a[href], button'))
    expect(focusables[0]).toHaveAttribute('href', '#main')
  })
})
