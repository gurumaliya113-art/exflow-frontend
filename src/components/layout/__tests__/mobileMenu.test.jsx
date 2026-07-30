import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import MobileMenu from '@/components/layout/MobileMenu'
import { FOOTER_BRAND, PUBLIC_NAV } from '@/content/site'

/**
 * Component tests for the mobile menu (task 8.2).
 * Requirements: 2.5, 2.6, 2.7, 2.11, 3.8, 10.9
 */

function LocationProbe() {
  const { pathname } = useLocation()
  return <span data-testid="pathname">{pathname}</span>
}

function renderMenu({ initialPath = '/about', ...props } = {}) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <MobileMenu {...props} />
      <LocationProbe />
    </MemoryRouter>,
  )
}

const getToggle = () => screen.getByRole('button', { name: /navigation menu/i })
const getPanel = () => document.querySelector('[data-slot="mobile-menu-panel"]')
const pathname = () => screen.getByTestId('pathname').textContent

describe('MobileMenu', () => {
  it('renders exactly one collapsed toggle and no panel when closed', () => {
    renderMenu()

    const toggles = screen.getAllByRole('button', { name: /navigation menu/i })
    expect(toggles).toHaveLength(1)
    expect(toggles[0]).toHaveAttribute('aria-expanded', 'false')
    expect(getPanel()).toBeNull()
  })

  it('exposes no navigation items or CTA while closed', () => {
    renderMenu()

    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(
      screen.queryByRole('button', { name: FOOTER_BRAND.ctaLabel }),
    ).not.toBeInTheDocument()
    // The panel id referenced by `aria-controls` resolves to nothing.
    const controlledId = getToggle().getAttribute('aria-controls')
    expect(document.getElementById(controlledId)).toBeNull()
  })

  it('opens with six route items, one Primary_CTA, and the brand destination', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(getToggle())

    expect(getToggle()).toHaveAttribute('aria-expanded', 'true')

    const panel = getPanel()
    expect(panel).not.toBeNull()

    const items = within(panel).getByRole('list')
    const routeLinks = within(items).getAllByRole('link')
    expect(routeLinks).toHaveLength(6)
    expect(routeLinks.map((link) => link.getAttribute('href'))).toEqual(
      PUBLIC_NAV.map((item) => item.to),
    )
    expect(routeLinks.map((link) => link.textContent)).toEqual(
      PUBLIC_NAV.map((item) => item.label),
    )

    // Brand destination for `/` plus exactly one Primary_CTA.
    const brandLink = within(panel).getByRole('link', { name: 'Home' })
    expect(brandLink).toHaveAttribute('href', '/')
    expect(
      within(panel).getAllByRole('button', { name: FOOTER_BRAND.ctaLabel }),
    ).toHaveLength(1)
  })

  it('points aria-controls at the rendered panel id', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(getToggle())

    const panel = getPanel()
    expect(panel.id).toBeTruthy()
    expect(getToggle()).toHaveAttribute('aria-controls', panel.id)
  })

  it('moves focus to the first panel item on open', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(getToggle())

    const panel = getPanel()
    const firstItem = within(panel).getAllByRole('link')[0]
    expect(firstItem).toHaveAttribute('href', '/')
    expect(firstItem).toHaveFocus()
  })

  it('closes on toggle without changing the route and restores focus to the toggle', async () => {
    const user = userEvent.setup()
    renderMenu({ initialPath: '/about' })

    await user.click(getToggle())
    expect(getPanel()).not.toBeNull()

    await user.click(getToggle())

    expect(getPanel()).toBeNull()
    expect(getToggle()).toHaveAttribute('aria-expanded', 'false')
    expect(getToggle()).toHaveFocus()
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(pathname()).toBe('/about')
  })

  it('closes when the location pathname changes', async () => {
    const user = userEvent.setup()
    renderMenu({ initialPath: '/about' })

    await user.click(getToggle())
    const panel = getPanel()
    await user.click(within(panel).getByRole('link', { name: 'Solutions' }))

    expect(pathname()).toBe('/solutions')
    expect(getPanel()).toBeNull()
    expect(getToggle()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })

  it('keeps the open panel within the viewport with a bounded width', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(getToggle())

    const panel = getPanel()
    // The old bug stretched the panel to the toggle's width via `inset-x-0`,
    // which clipped every label. It must instead carry a viewport-bounded width.
    expect(panel.className).not.toMatch(/inset-x-0/)
    expect(panel.className).toMatch(/w-\[min\(18rem,calc\(100vw-var\(--space-8\)\)\)\]/)
  })

  it('marks exactly one destination as the current page', async () => {
    const user = userEvent.setup()
    renderMenu({ initialPath: '/blogs' })

    await user.click(getToggle())

    const current = within(getPanel()).getAllByRole('link', { current: 'page' })
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveAttribute('href', '/blogs')
  })
})
