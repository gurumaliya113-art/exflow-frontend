// Page tests for the migrated /contact route (task 12.4).
// Requirements: 5.5, 5.6, 5.7, 10.5, 11.3, 11.6
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { EnquiryProvider, useEnquiry } from '@/components/enquiry/EnquiryProvider'
import { CONTACT } from '@/content/site'
import ContactPage from '../ContactPage'

/** Baseline destinations and values that must survive the redesign verbatim. */
const EMAIL_HREF = 'mailto:business.gurutron@gmail.com'
const TEL_HREF = 'tel:+918053317489'
const WEBSITE_HREF = 'https://exflow.in'
const OFFICE = 'Kailash Nagar, Narnaul'

const BASELINE_SERVICES = [
  'Custom Software Development',
  'Website Development',
  'AI Solutions',
  'Business Automation',
  'Fleet Management Systems',
  'Restaurant Management Systems',
  'Industry-Specific Platforms',
]

const SOURCE = readFileSync(
  resolve(process.cwd(), 'src/pages/ContactPage.jsx'),
  'utf8',
)

/** Reports the provider's open state so an enquiry CTA's effect is observable. */
function EnquiryStateProbe() {
  const { open } = useEnquiry()
  return <p data-testid="enquiry-open">{String(open)}</p>
}

const renderPage = () =>
  render(
    <MemoryRouter>
      <ContactPage />
    </MemoryRouter>,
  )

describe('ContactPage structure', () => {
  it('renders exactly one top-level heading', () => {
    const { container } = renderPage()

    const h1s = container.querySelectorAll('h1')
    expect(h1s).toHaveLength(1)
    expect(h1s[0].textContent).toBe("Let's Build Something Great Together.")
  })

  it('renders no chrome of its own, leaving the header and footer to the shell', () => {
    const { container } = renderPage()

    expect(container.querySelector('header')).toBeNull()
    expect(container.querySelector('footer')).toBeNull()
    expect(container.querySelector('[data-slot="site-header"]')).toBeNull()
    expect(container.querySelector('[data-slot="site-footer"]')).toBeNull()
    expect(container.querySelector('[data-slot="floating-cta"]')).toBeNull()
  })

  it('orders the shell as hero, content, then closing call to action', () => {
    const { container } = renderPage()

    const slots = [...container.querySelectorAll('section[data-slot]')].map((el) =>
      el.getAttribute('data-slot'),
    )
    expect(slots).toEqual([
      'contact-hero',
      'contact-details',
      'contact-closing-cta',
    ])
  })
})

describe('ContactPage preserved destinations', () => {
  it('keeps the email address as a plain mailto anchor', () => {
    renderPage()

    const email = screen.getByRole('link', { name: CONTACT.email.label })
    expect(email).toHaveAttribute('href', EMAIL_HREF)
    expect(CONTACT.email.href).toBe(EMAIL_HREF)
    expect(email).not.toHaveAttribute('target')
  })

  it('keeps the telephone number as a plain tel anchor', () => {
    renderPage()

    const phone = screen.getByRole('link', { name: CONTACT.phone.label })
    expect(phone).toHaveAttribute('href', TEL_HREF)
    expect(CONTACT.phone.href).toBe(TEL_HREF)
    expect(phone).not.toHaveAttribute('target')
  })

  it('opens the website in exactly one new context with both safety tokens', () => {
    renderPage()

    const website = screen.getByRole('link', { name: 'exflow.in' })
    expect(website).toHaveAttribute('href', WEBSITE_HREF)
    expect(website).toHaveAttribute('target', '_blank')

    const rel = (website.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean)
    expect(rel).toContain('noopener')
    expect(rel).toContain('noreferrer')
  })

  it('renders the office value and every baseline service', () => {
    renderPage()

    expect(screen.getByText(OFFICE)).toBeInTheDocument()
    expect(CONTACT.office.address).toBe(OFFICE)

    BASELINE_SERVICES.forEach((service) => {
      expect(screen.getByText(service)).toBeInTheDocument()
    })
  })
})

describe('ContactPage enquiry actions', () => {
  const renderWithProvider = () =>
    render(
      <MemoryRouter>
        {/* Context path only; the window bridge is covered by the provider tests. */}
        <EnquiryProvider legacyEventBridge={false}>
          <EnquiryStateProbe />
          <ContactPage />
        </EnquiryProvider>
      </MemoryRouter>,
    )

  it.each(['Open Enquiry Form', 'Request A Quote'])(
    'opens the shared enquiry state from "%s"',
    (label) => {
      renderWithProvider()

      expect(screen.getByTestId('enquiry-open')).toHaveTextContent('false')
      fireEvent.click(screen.getByRole('button', { name: label }))
      expect(screen.getByTestId('enquiry-open')).toHaveTextContent('true')
    },
  )
})

describe('ContactPage token discipline', () => {
  it('declares no literal color values in its source', () => {
    const hex = SOURCE.match(/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g)
    expect(hex).toBeNull()
    expect(SOURCE).not.toMatch(/\b(?:rgb|rgba|hsl|hsla)\(/)
  })

  it('imports no page-level header or footer', () => {
    expect(SOURCE).not.toMatch(/PublicHeader/)
    expect(SOURCE).not.toMatch(/PublicFooter/)
  })
})
