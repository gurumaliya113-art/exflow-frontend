import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SiteHeader, {
  DESKTOP_CTA_CLASS,
  DESKTOP_NAV_CLASS,
  ENQUIRY_EVENT,
} from '@/components/layout/SiteHeader'
import { BRAND_NAME } from '@/components/layout/BrandMark'
import { FOOTER_BRAND, LEGACY_NAV, PUBLIC_NAV } from '@/content/site'

/**
 * Component tests for the shared header (task 8.3).
 * Requirements: 2.1, 2.3, 2.5, 2.10
 */

function renderHeader({ initialPath = '/', ...props } = {}) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <SiteHeader {...props} />
    </MemoryRouter>,
  )
}

const getHeader = () => screen.getByRole('banner')
const getDesktopNav = () => document.querySelector('[data-slot="site-header-nav"]')
const getCta = () => document.querySelector('[data-slot="site-header-cta"]')
const getMobileWrapper = () => document.querySelector('[data-slot="mobile-menu"]')

afterEach(() => {
  vi.restoreAllMocks()
})

describe('SiteHeader public variant', () => {
  it('renders the header landmark with brand, six nav items, and one CTA', () => {
    renderHeader()

    const header = getHeader()
    expect(header.tagName).toBe('HEADER')

    // Brand control: owl mark + EXFLOW name, pointing at `/`.
    const brand = within(header).getByRole('link', { name: new RegExp(BRAND_NAME) })
    expect(brand).toHaveAttribute('href', '/')

    const nav = getDesktopNav()
    const navLinks = within(nav).getAllByRole('link')
    expect(navLinks).toHaveLength(6)
    expect(navLinks.map((link) => link.getAttribute('href'))).toEqual(
      PUBLIC_NAV.map((item) => item.to),
    )
    expect(navLinks.map((link) => link.textContent)).toEqual(
      PUBLIC_NAV.map((item) => item.label),
    )

    // Exactly one Primary_CTA in the desktop chrome.
    expect(
      document.querySelectorAll('[data-slot="site-header-cta"]'),
    ).toHaveLength(1)
    expect(getCta()).toHaveTextContent(FOOTER_BRAND.ctaLabel)
  })

  it.each([
    ['/', '/'],
    ['/portfolio', '/portfolio'],
    ['/solutions', '/solutions'],
    ['/industries', '/industries'],
    ['/about', '/about'],
    ['/blogs', '/blogs'],
    ['/contact', '/contact'],
  ])('marks exactly one destination as the current page on %s', (path, href) => {
    renderHeader({ initialPath: path })

    const current = within(getHeader()).getAllByRole('link', { current: 'page' })
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveAttribute('href', href)
  })

  it('marks nothing when the path is outside the nav config', () => {
    renderHeader({ initialPath: '/partner' })

    expect(
      within(getHeader()).queryAllByRole('link', { current: 'page' }),
    ).toHaveLength(0)
  })
})

describe('SiteHeader viewport split', () => {
  it('gates the desktop nav and CTA to the md breakpoint and up', () => {
    renderHeader()

    for (const utility of DESKTOP_NAV_CLASS.split(' ')) {
      expect(getDesktopNav().className.split(' ')).toContain(utility)
    }
    for (const utility of DESKTOP_CTA_CLASS.split(' ')) {
      expect(getCta().className.split(' ')).toContain(utility)
    }
  })

  it('renders exactly one mobile control, hidden from md up', () => {
    renderHeader()

    const wrapper = getMobileWrapper()
    expect(document.querySelectorAll('[data-slot="mobile-menu"]')).toHaveLength(1)
    expect(wrapper.className.split(' ')).toContain('md:hidden')

    const toggles = screen.getAllByRole('button', { name: /navigation menu/i })
    expect(toggles).toHaveLength(1)
    expect(toggles[0]).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('SiteHeader legacy variant', () => {
  it('renders the legacy destinations verbatim, mismatched labels included', () => {
    renderHeader({ variant: 'legacy' })

    const navLinks = within(getDesktopNav()).getAllByRole('link')
    expect(navLinks).toHaveLength(6)
    expect(
      navLinks.map((link) => [link.textContent, link.getAttribute('href')]),
    ).toEqual([
      ['Our Work', '/#work'],
      ['Solutions', '/partner'],
      ['Industries', '/partner-benefits'],
      ['About', '/work-benefits'],
      ['Blogs', '/enquire'],
      ['Contact', '/enquire'],
    ])
    // The config itself is the source of truth for those destinations.
    expect(navLinks.map((link) => link.textContent)).toEqual(
      LEGACY_NAV.map((item) => item.label),
    )
  })

  it('still marks only one destination when two legacy items share a path', () => {
    renderHeader({ variant: 'legacy', initialPath: '/enquire' })

    const current = within(getHeader()).getAllByRole('link', { current: 'page' })
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveTextContent('Blogs')
  })
})

describe('SiteHeader Primary_CTA activation', () => {
  it('dispatches the enquiry event by default', async () => {
    const user = userEvent.setup()
    const listener = vi.fn()
    window.addEventListener(ENQUIRY_EVENT, listener)

    try {
      renderHeader()
      await user.click(getCta())
      expect(listener).toHaveBeenCalledTimes(1)
    } finally {
      window.removeEventListener(ENQUIRY_EVENT, listener)
    }
  })

  it('calls the override instead of dispatching when one is supplied', async () => {
    const user = userEvent.setup()
    const listener = vi.fn()
    const onCtaActivate = vi.fn()
    window.addEventListener(ENQUIRY_EVENT, listener)

    try {
      renderHeader({ onCtaActivate })
      await user.click(getCta())
      expect(onCtaActivate).toHaveBeenCalledTimes(1)
      expect(listener).not.toHaveBeenCalled()
    } finally {
      window.removeEventListener(ENQUIRY_EVENT, listener)
    }
  })
})
