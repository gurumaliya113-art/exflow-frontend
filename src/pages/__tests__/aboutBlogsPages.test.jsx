// Page tests for the migrated /about and /blogs routes (task 12.3).
// Requirements: 5.3, 5.4, 5.6, 10.5, 11.3, 1.1
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { EnquiryProvider, useEnquiry } from '@/components/enquiry/EnquiryProvider'
import AboutPage from '../AboutPage'
import BlogsPage from '../BlogsPage'

/** Reports the provider's open state so a CTA's effect is observable. */
function EnquiryStateProbe() {
  const { open } = useEnquiry()
  return <p data-testid="enquiry-open">{String(open)}</p>
}

const readSource = (file) => readFileSync(resolve(process.cwd(), 'src/pages', file), 'utf8')

const ABOUT_SOURCE = readSource('AboutPage.jsx')
const BLOGS_SOURCE = readSource('BlogsPage.jsx')

const renderPage = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

const renderWithProvider = (ui) =>
  render(
    <MemoryRouter>
      {/* Context path only: no legacy window bridge. */}
      <EnquiryProvider legacyEventBridge={false}>
        <EnquiryStateProbe />
        {ui}
      </EnquiryProvider>
    </MemoryRouter>,
  )

const BELIEFS = [
  ['Build For Impact', 'Every system we engineer is built to create measurable outcomes.'],
  ['Solve Operational Problems', 'We focus on real workflows — not surface-level features.'],
  ['Create Scalable Systems', 'Software that grows with your business, not against it.'],
  ['Measurable Business Outcomes', 'Data-driven design. Results you can actually track.'],
  ['Engineer For Growth', 'Products designed from day one to handle scale.'],
]

const FOUNDERS = ['Azad Gupta', 'Mukul Saini', 'Amit', 'Anubhav']

const AUDIENCES = [
  'Startups looking for speed',
  'Local businesses going digital',
  'Enterprises modernizing operations',
  'Industry operators creating sustainable growth',
]

const TOPICS = [
  ['How AI is Changing Business Operations', 'AI & Automation', '6 min read'],
  ['Why Custom Software Outperforms Generic Solutions', 'Software', '5 min read'],
  ['The Future of Business Automation', 'Automation', '7 min read'],
  ['How Fleet Analytics Reduce Fuel Losses', 'Fleet Tech', '5 min read'],
  ['Why Restaurants Need Digital Ordering Systems', 'Restaurant Tech', '4 min read'],
  ['Building Scalable MVPs for Startups', 'Startups', '6 min read'],
  ['Software Trends Businesses Should Watch', 'Trends', '5 min read'],
  ['Digital Transformation Strategies for Growing Companies', 'Strategy', '8 min read'],
]

describe('AboutPage content', () => {
  it('renders the philosophy statement and its supporting paragraphs', () => {
    const { container } = renderPage(<AboutPage />)

    expect(container.textContent).toContain(
      'Technology should simplify business operations, not complicate them.',
    )
    expect(container.textContent).toContain(
      'The modern business environment demands speed, automation, and better decision making.',
    )
    expect(container.textContent).toContain(
      'exflow exists to solve those challenges through engineered digital solutions.',
    )
  })

  it('renders every customer group', () => {
    renderPage(<AboutPage />)

    expect(screen.getByRole('heading', { level: 3, name: 'Who We Work With' })).toBeInTheDocument()
    AUDIENCES.forEach((audience) => {
      expect(screen.getByText(audience, { exact: false })).toBeInTheDocument()
    })
  })

  it('renders every principle with its description', () => {
    renderPage(<AboutPage />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'Principles That Guide Every System We Build' }),
    ).toBeInTheDocument()
    BELIEFS.forEach(([title, desc]) => {
      expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument()
      expect(screen.getByText(desc)).toBeInTheDocument()
    })
  })

  it('renders every founder with their avatar initial and role', () => {
    const { container } = renderPage(<AboutPage />)

    FOUNDERS.forEach((name) => {
      expect(screen.getByRole('heading', { level: 3, name })).toBeInTheDocument()
    })
    expect(screen.getAllByText('Co-Founder')).toHaveLength(FOUNDERS.length)

    const initials = Array.from(
      container.querySelectorAll('[data-slot="about-founder"]'),
    ).map((card) => card.querySelector('span')?.textContent)
    expect(initials).toEqual(['A', 'M', 'A', 'A'])
  })
})

describe('BlogsPage content', () => {
  it('renders every topic preview with its category and reading-time label', () => {
    const { container } = renderPage(<BlogsPage />)

    const cards = container.querySelectorAll('[data-slot="blogs-topic"]')
    expect(cards).toHaveLength(TOPICS.length)

    TOPICS.forEach(([title, category, read], index) => {
      const card = cards[index]
      expect(card.querySelector('h3')?.textContent).toBe(title)
      expect(
        card.querySelector('[data-slot="blogs-topic-category"]')?.textContent,
      ).toBe(category)
      expect(card.querySelector('[data-slot="blogs-topic-read"]')?.textContent).toBe(read)
    })
  })

  it('renders the coming-soon status on every topic and on the band', () => {
    const { container } = renderPage(<BlogsPage />)

    const statuses = container.querySelectorAll('[data-slot="blogs-topic-status"]')
    expect(statuses).toHaveLength(TOPICS.length)
    statuses.forEach((status) => {
      expect(status.textContent).toBe('Coming soon →')
    })

    expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    expect(screen.getByText('Articles publishing soon. Stay tuned.')).toBeInTheDocument()
  })
})

describe('public shell structure', () => {
  it.each([
    ['AboutPage', <AboutPage key="about" />, 'Engineered Digital Solutions for Real Businesses.'],
    ['BlogsPage', <BlogsPage key="blogs" />, 'Ideas, Trends & Practical Insights.'],
  ])('%s renders exactly one top-level heading', (_name, ui, headingText) => {
    const { container } = renderPage(ui)

    const h1s = container.querySelectorAll('h1')
    expect(h1s).toHaveLength(1)
    expect(h1s[0].textContent).toBe(headingText)
  })

  it.each([
    ['AboutPage', <AboutPage key="about" />],
    ['BlogsPage', <BlogsPage key="blogs" />],
  ])('%s renders no chrome of its own', (_name, ui) => {
    const { container } = renderPage(ui)

    expect(container.querySelector('header')).toBeNull()
    expect(container.querySelector('footer')).toBeNull()
    expect(container.querySelector('nav')).toBeNull()
    expect(container.querySelector('[data-slot="site-header"]')).toBeNull()
    expect(container.querySelector('[data-slot="site-footer"]')).toBeNull()
    expect(container.querySelector('[data-slot="floating-cta"]')).toBeNull()
  })

  it.each([
    ['AboutPage', <AboutPage key="about" />],
    ['BlogsPage', <BlogsPage key="blogs" />],
  ])('%s orders hero, content, then closing call to action', (_name, ui) => {
    const { container } = renderPage(ui)

    const slots = Array.from(container.querySelectorAll('section[data-slot]')).map((section) =>
      section.getAttribute('data-slot'),
    )
    expect(slots.length).toBeGreaterThanOrEqual(3)
    expect(slots[0]).toMatch(/-hero$/)
    expect(slots[slots.length - 1]).toMatch(/-cta$/)
  })
})

describe('enquiry and contact actions', () => {
  it('opens the shared enquiry state from the /about CTA', () => {
    renderWithProvider(<AboutPage />)

    expect(screen.getByTestId('enquiry-open')).toHaveTextContent('false')
    fireEvent.click(screen.getByRole('button', { name: 'Start a Conversation' }))
    expect(screen.getByTestId('enquiry-open')).toHaveTextContent('true')
  })

  it('opens the shared enquiry state from the /blogs contact CTA', () => {
    renderWithProvider(<BlogsPage />)

    expect(screen.getByTestId('enquiry-open')).toHaveTextContent('false')
    fireEvent.click(screen.getByRole('button', { name: 'Get In Touch' }))
    expect(screen.getByTestId('enquiry-open')).toHaveTextContent('true')
  })
})

describe('source guards', () => {
  it.each([
    ['AboutPage.jsx', ABOUT_SOURCE],
    ['BlogsPage.jsx', BLOGS_SOURCE],
  ])('%s declares no literal color values', (_file, source) => {
    expect(source.match(/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g)).toBeNull()
    expect(source).not.toMatch(/\b(?:rgb|rgba|hsl|hsla)\(/)
  })

  it.each([
    ['AboutPage.jsx', ABOUT_SOURCE],
    ['BlogsPage.jsx', BLOGS_SOURCE],
  ])('%s imports no page-level header or footer', (_file, source) => {
    expect(source).not.toMatch(/PublicHeader/)
    expect(source).not.toMatch(/PublicFooter/)
  })
})
