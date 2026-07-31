import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import SiteFooter, { copyrightText } from '../SiteFooter'
import {
  CONTACT,
  FOOTER_LEGAL_LINKS,
  FOOTER_QUICK_LINKS,
  FOOTER_SOLUTION_LINKS,
} from '../../../content/site'
import baseline from '../../../__fixtures__/baseline/content.json'

/**
 * Component tests for `SiteFooter` (task 8.4).
 * Requirements: 2.8, 2.9, 11.6
 */

function renderFooter(props = {}) {
  return render(
    <MemoryRouter>
      <SiteFooter {...props} />
    </MemoryRouter>,
  )
}

/** Footer links recorded for `/solutions`, which renders the canonical footer. */
const baselineSolutionsRoute = baseline.routes.find((r) => r.route === '/solutions')

describe('SiteFooter variant="full"', () => {
  it('renders the office, telephone, and email values', () => {
    renderFooter({ variant: 'full' })

    expect(screen.getByRole('heading', { level: 4, name: 'Office' })).toBeInTheDocument()
    expect(screen.getByText('Kailash Nagar, Narnaul')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: 'Call Us' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: 'Email' })).toBeInTheDocument()
  })

  it('invokes the unchanged tel: and mailto: destinations', () => {
    renderFooter({ variant: 'full' })

    const phone = screen.getByRole('link', { name: '+91 80533 17489' })
    expect(phone).toHaveAttribute('href', 'tel:+918053317489')
    expect(phone.getAttribute('href')).toBe(CONTACT.phone.href)

    const email = screen.getByRole('link', { name: 'azadgupta1010@gmail.com' })
    expect(email).toHaveAttribute('href', 'mailto:azadgupta1010@gmail.com')
    expect(email.getAttribute('href')).toBe(CONTACT.email.href)
  })

  it('renders five solution links that all navigate to /solutions', () => {
    renderFooter({ variant: 'full' })

    expect(FOOTER_SOLUTION_LINKS).toHaveLength(5)
    for (const { label } of FOOTER_SOLUTION_LINKS) {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', '/solutions')
    }
  })

  it('renders six quick links with their baseline destinations', () => {
    renderFooter({ variant: 'full' })

    expect(FOOTER_QUICK_LINKS).toHaveLength(6)
    for (const { label, to } of FOOTER_QUICK_LINKS) {
      const expected = baselineSolutionsRoute.links.find((l) => l.label === label)
      // Quick-link labels that also appear as solution links are covered above.
      const link = screen.getAllByRole('link', { name: label })[0]
      expect(link).toHaveAttribute('href', to)
      if (expected) expect(link).toHaveAttribute('href', expected.href)
    }
  })

  it('renders a copyright with the current year and the rights statement', () => {
    renderFooter({ variant: 'full' })

    const year = new Date().getFullYear()
    const copyright = screen.getByText(copyrightText())
    expect(copyright).toBeInTheDocument()
    expect(copyright.textContent).toContain(String(year))
    expect(String(year)).toMatch(/^\d{4}$/)
    expect(copyright.textContent).toContain('exflow. All rights reserved.')
  })

  it('preserves the Privacy and Terms placeholder destinations', () => {
    renderFooter({ variant: 'full' })

    expect(FOOTER_LEGAL_LINKS.map((l) => l.href)).toEqual(['#', '#'])
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '#')
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '#')
  })
})

describe('SiteFooter variant="compact"', () => {
  it('renders only the copyright line', () => {
    renderFooter({ variant: 'compact' })

    expect(screen.getByText(copyrightText())).toBeInTheDocument()
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(screen.queryByRole('link', { name: 'Custom Software' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Our Work' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 4 })).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows the same copyright text as the full variant', () => {
    const year = new Date().getFullYear()
    renderFooter({ variant: 'compact' })

    expect(screen.getByText(`\u00A9 ${year} exflow. All rights reserved.`)).toBeInTheDocument()
  })
})
