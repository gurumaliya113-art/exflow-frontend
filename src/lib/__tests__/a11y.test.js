import { describe, it, expect } from 'vitest'
import {
  contrastRatio,
  relativeLuminance,
  isLargeText,
  isBoldWeight,
  requiredContrast,
  headingOutline,
  parseColor,
} from '../a11y'

describe('contrastRatio', () => {
  it('returns 21 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
  })

  it('returns 1 for identical colors', () => {
    expect(contrastRatio('#22D3EE', '#22D3EE')).toBeCloseTo(1, 10)
  })

  it('is symmetric', () => {
    expect(contrastRatio('#F3F6FC', '#070B14')).toBeCloseTo(
      contrastRatio('#070B14', '#F3F6FC'),
      10
    )
  })

  it('matches the WCAG reference ratio for #777 on white', () => {
    // 4.47:1 is the canonical mid-grey example from the WCAG techniques.
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2)
  })

  it('accepts shorthand hex, alpha hex, and rgb strings', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#000000ff', '#ffffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('rgb(0, 0, 0)', 'rgb(255, 255, 255)')).toBeCloseTo(21, 5)
  })

  it('rejects unsupported color formats', () => {
    expect(() => contrastRatio('rebeccapurple', '#fff')).toThrow(/Unsupported color/)
  })
})

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 10)
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 10)
  })

  it('weights green above red above blue', () => {
    expect(relativeLuminance('#00ff00')).toBeGreaterThan(relativeLuminance('#ff0000'))
    expect(relativeLuminance('#ff0000')).toBeGreaterThan(relativeLuminance('#0000ff'))
  })
})

describe('parseColor', () => {
  it('expands shorthand hex channels', () => {
    expect(parseColor('#abc')).toEqual([0xaa, 0xbb, 0xcc])
  })
})

describe('isLargeText', () => {
  it('treats unbolded text as large at or above 24px', () => {
    expect(isLargeText(24, 400)).toBe(true)
    expect(isLargeText(23.99, 400)).toBe(false)
  })

  it('treats bolded text as large at or above 18.66px', () => {
    expect(isLargeText(18.66, 700)).toBe(true)
    expect(isLargeText(18.65, 700)).toBe(false)
    expect(isLargeText(18.66, 400)).toBe(false)
  })

  it('accepts keyword weights', () => {
    expect(isLargeText(20, 'bold')).toBe(true)
    expect(isLargeText(20, 'normal')).toBe(false)
  })

  it('defaults to the unbolded threshold', () => {
    expect(isLargeText(24)).toBe(true)
    expect(isLargeText(20)).toBe(false)
  })

  it('rejects non-numeric sizes', () => {
    expect(isLargeText(Number.NaN)).toBe(false)
    expect(isLargeText(undefined)).toBe(false)
  })
})

describe('isBoldWeight', () => {
  it('uses 700 as the bold boundary', () => {
    expect(isBoldWeight(699)).toBe(false)
    expect(isBoldWeight(700)).toBe(true)
    expect(isBoldWeight('800')).toBe(true)
  })
})

describe('requiredContrast', () => {
  it('requires 4.5 for normal text and 3 for large text', () => {
    expect(requiredContrast(16, 400)).toBe(4.5)
    expect(requiredContrast(32, 400)).toBe(3)
    expect(requiredContrast(19, 700)).toBe(3)
  })
})

describe('headingOutline', () => {
  function render(html) {
    const container = document.createElement('div')
    container.innerHTML = html
    return container
  }

  it('returns heading levels in DOM order', () => {
    const container = render(`
      <h1>Page</h1>
      <section>
        <h2>First</h2>
        <h3>Nested</h3>
      </section>
      <h2>Second</h2>
    `)

    expect(headingOutline(container)).toEqual([1, 2, 3, 2])
  })

  it('ignores non-heading text', () => {
    expect(headingOutline(render('<p>Eyebrow</p><div>Copy</div>'))).toEqual([])
  })

  it('reads aria-level from role="heading" elements', () => {
    const container = render(`
      <h1>Page</h1>
      <div role="heading" aria-level="3">ARIA heading</div>
      <div role="heading">Defaulted</div>
    `)

    expect(headingOutline(container)).toEqual([1, 3, 2])
  })

  it('returns an empty outline for missing containers', () => {
    expect(headingOutline(null)).toEqual([])
    expect(headingOutline(undefined)).toEqual([])
  })
})
