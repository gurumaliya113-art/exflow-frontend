import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { PUBLIC_NAV, LEGACY_NAV } from '../../../content/site'
import { resolveActiveNav, BRAND_NAV_ID } from '../../../lib/nav'
import { BrandMark, BRAND_NAME } from '../BrandMark'
import { SiteNav } from '../SiteNav'

/**
 * Chrome fragment: the brand control plus the desktop nav, exactly as
 * `SiteHeader` will compose them. Both parts resolve their active state
 * through `resolveActiveNav`, so the pair must never mark two destinations.
 */
function Chrome({ nav = PUBLIC_NAV, pathname = '/' }) {
  return (
    <MemoryRouter initialEntries={[pathname]}>
      <BrandMark />
      <SiteNav items={nav} />
    </MemoryRouter>
  )
}

const marked = (container) => [...container.querySelectorAll('[aria-current="page"]')]

const underline = (el) => el.querySelector('[data-slot="active-underline"]')

describe('BrandMark', () => {
  it('links to / and carries the owl mark plus the EXFLOW name', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/about']}>
        <BrandMark />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: new RegExp(BRAND_NAME, 'i') })
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('/')
    expect(link).toHaveTextContent(BRAND_NAME)
    // The owl mark rides along as decoration, hidden from the accessible name.
    const mark = container.querySelector('svg[aria-hidden="true"]')
    expect(mark).not.toBeNull()
  })

  it('marks itself current only on the home route', () => {
    const home = render(<Chrome pathname="/" />)
    expect(home.container.querySelector('[data-nav-id="brand"]')).toHaveAttribute(
      'aria-current',
      'page',
    )
    home.unmount()

    const away = render(<Chrome pathname="/portfolio" />)
    expect(
      away.container.querySelector('[data-nav-id="brand"]'),
    ).not.toHaveAttribute('aria-current')
  })
})

describe('SiteNav active destination', () => {
  it('marks exactly one destination on every public route', () => {
    const routes = ['/', ...PUBLIC_NAV.map((item) => item.to)]

    for (const pathname of routes) {
      const { container, unmount } = render(<Chrome pathname={pathname} />)
      const current = marked(container)

      expect(current).toHaveLength(1)
      expect(current[0].getAttribute('data-nav-id')).toBe(
        resolveActiveNav(pathname, PUBLIC_NAV),
      )
      unmount()
    }
  })

  it('marks nothing when the path is outside the nav config', () => {
    const { container } = render(<Chrome pathname="/enquire" />)
    expect(marked(container)).toHaveLength(0)
  })

  it('ignores trailing slashes, query strings, and hash fragments', () => {
    const { container } = render(<Chrome pathname="/about/?ref=x#top" />)
    const current = marked(container)

    expect(current).toHaveLength(1)
    expect(current[0].getAttribute('data-nav-id')).toBe('about')
  })

  it('gives the active item the underline treatment and inactive items none', () => {
    const { container } = render(<Chrome pathname="/solutions" />)

    for (const item of PUBLIC_NAV) {
      const link = container.querySelector(`[data-nav-id="${item.id}"]`)
      if (item.id === 'solutions') {
        expect(link).toHaveAttribute('aria-current', 'page')
        expect(underline(link)).not.toBeNull()
        expect(link.className).toContain('text-content')
      } else {
        expect(link).not.toHaveAttribute('aria-current')
        expect(underline(link)).toBeNull()
      }
    }
  })

  it('never marks two destinations, brand included', () => {
    const { container } = render(<Chrome pathname="/" />)
    const current = marked(container)

    expect(current).toHaveLength(1)
    expect(current[0].getAttribute('data-nav-id')).toBe(BRAND_NAV_ID)
    expect(underline(current[0])).not.toBeNull()
  })

  it('honours a pre-resolved activeId, including null for nothing active', () => {
    const explicit = render(
      <MemoryRouter initialEntries={['/portfolio']}>
        <SiteNav items={PUBLIC_NAV} activeId="blogs" />
      </MemoryRouter>,
    )
    expect(marked(explicit.container)).toHaveLength(1)
    expect(marked(explicit.container)[0].getAttribute('data-nav-id')).toBe('blogs')
    explicit.unmount()

    const none = render(
      <MemoryRouter initialEntries={['/portfolio']}>
        <SiteNav items={PUBLIC_NAV} activeId={null} />
      </MemoryRouter>,
    )
    expect(marked(none.container)).toHaveLength(0)
  })
})

describe('SiteNav link semantics', () => {
  it('renders every navigation item as an anchor with its config destination', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <SiteNav items={PUBLIC_NAV} />
      </MemoryRouter>,
    )

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(PUBLIC_NAV.length)

    links.forEach((link, index) => {
      expect(link.tagName).toBe('A')
      expect(link.getAttribute('href')).toBe(PUBLIC_NAV[index].to)
      expect(link).toHaveTextContent(PUBLIC_NAV[index].label)
    })
  })

  it('reports the activated item to the header', async () => {
    // Navigation itself is the router's job; suppressing it keeps this test on
    // the callback contract the header relies on for legacy hash scrolling.
    const onItemClick = vi.fn((_item, event) => event.preventDefault())
    render(
      <MemoryRouter initialEntries={['/']}>
        <SiteNav items={PUBLIC_NAV} onItemClick={onItemClick} />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('link', { name: 'Industries' }))
    expect(onItemClick).toHaveBeenCalledTimes(1)
    expect(onItemClick.mock.calls[0][0].to).toBe('/industries')
  })

  it('renders the legacy nav destinations verbatim, mismatches preserved', () => {
    render(
      <MemoryRouter initialEntries={['/partner']}>
        <SiteNav items={LEGACY_NAV} label="Legacy" />
      </MemoryRouter>,
    )

    const links = screen.getAllByRole('link')
    expect(links.map((l) => l.getAttribute('href'))).toEqual(
      LEGACY_NAV.map((item) => item.to),
    )
    expect(screen.getByRole('link', { name: 'Solutions' })).toHaveAttribute(
      'href',
      '/partner',
    )
    // Both "Blogs" and "Contact" still point at /enquire.
    expect(
      screen.getAllByRole('link', { name: /Blogs|Contact/ }).map((l) => l.getAttribute('href')),
    ).toEqual(['/enquire', '/enquire'])
  })

  it('accepts a className so the header can gate it responsively', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <SiteNav items={PUBLIC_NAV} className="hidden md:flex" label="Primary" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('navigation', { name: 'Primary' }).className).toContain(
      'md:flex',
    )
  })
})
