// Page tests for the migrated /home-old legacy route (task 12.6).
// Requirements: 8.1, 8.2, 9.5, 10.5, 11.1, 11.6, 11.8
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { setReducedMotion } from '@/test/setup'
import HomePage, { projects, ratings, services, whyUs } from '../HomePage'

const readSource = () =>
  readFileSync(resolve(process.cwd(), 'src/pages/HomePage.jsx'), 'utf8')

/** Navigation destinations recorded for `/home-old` in the content baseline. */
const BASELINE_LINKS = [
  { label: 'Explore Solutions', href: '/partner', count: 1 },
  { label: 'Enquire Now', href: '/enquire', count: 1 },
  { label: 'Enquire For Work', href: '/enquire', count: 7 },
  { label: 'Partner With Us', href: '/partner', count: 7 },
]

const renderPage = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )

const chips = (container) =>
  [...container.querySelectorAll('[data-slot="home-old-service-chip"]')]

describe('/home-old headings', () => {
  it('renders exactly one top-level heading', () => {
    const { container } = renderPage()

    const h1s = container.querySelectorAll('h1')
    expect(h1s).toHaveLength(1)
    expect(h1s[0].textContent).toBe(
      'Building High-Performance Websites and Software That Power Growing Businesses.',
    )
  })

  it('increases heading levels by no more than one between consecutive headings', () => {
    const { container } = renderPage()

    const levels = [...container.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((node) =>
      Number(node.tagName.slice(1)),
    )

    expect(levels[0]).toBe(1)
    levels.slice(1).forEach((level, i) => {
      expect(level - levels[i]).toBeLessThanOrEqual(1)
    })
  })

  it('keeps the three band headings from the baseline', () => {
    renderPage()

    ;[
      'Any Work or Workforce Are you looking To get Your Work Done?',
      'Why Us',
      'Our Work',
    ].forEach((title) => {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument()
    })
  })
})

describe('/home-old service selector', () => {
  it('renders every baseline service as a pressable chip with nothing selected', () => {
    const { container } = renderPage()

    expect(services).toHaveLength(13)
    expect(chips(container)).toHaveLength(services.length)

    services.forEach((service) => {
      const chip = screen.getByRole('button', { name: service })
      expect(chip.tagName).toBe('BUTTON')
      expect(chip).toHaveAttribute('aria-pressed', 'false')
    })

    expect(container.querySelectorAll('[aria-pressed="true"]')).toHaveLength(0)
  })

  it('keeps exactly one chip pressed as the selection moves', () => {
    const { container } = renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Coding' }))

    expect(container.querySelectorAll('[aria-pressed="true"]')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Coding' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Dropshipping' }))

    const pressed = container.querySelectorAll('[aria-pressed="true"]')
    expect(pressed).toHaveLength(1)
    expect(pressed[0].textContent).toBe('Dropshipping')
  })

  it('shows the selected-service feedback only after a chip is activated', () => {
    const { container } = renderPage()

    expect(container.querySelector('[data-slot="home-old-selected-service"]')).toBeNull()
    expect(screen.queryByText(/^Selected:/)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Auditing' }))

    const feedback = container.querySelector('[data-slot="home-old-selected-service"]')
    expect(feedback).not.toBeNull()
    expect(feedback.textContent).toBe('Selected: Auditing')
  })
})

describe('/home-old case studies', () => {
  it('renders all seven case studies with their problem and solution lists', () => {
    const { container } = renderPage()

    const cards = [...container.querySelectorAll('[data-slot="home-old-case-study"]')]
    expect(projects).toHaveLength(7)
    expect(cards).toHaveLength(7)

    projects.forEach((project, index) => {
      const card = cards[index]

      expect(card.querySelector('h3').textContent).toBe(project.title)
      expect(card.textContent).toContain(project.badge)
      expect(card.textContent).toContain(project.subtitle)

      const panelHeadings = [...card.querySelectorAll('h4')].map((h) => h.textContent)
      expect(panelHeadings).toEqual(['What are the problems?', 'What solution we built'])

      project.problem.forEach((item) => expect(card.textContent).toContain(item))
      project.features.forEach((item) => expect(card.textContent).toContain(item))
      project.impact.forEach((item) => expect(card.textContent).toContain(item))

      // The overview is the fallback branch for a case study without a problem
      // list, so - as before the redesign - it is never rendered.
      expect(card.textContent).not.toContain(project.overview)
    })
  })

  it('keeps the recognition note on the one case study that has it', () => {
    const { container } = renderPage()

    const withRecognition = projects.filter((project) => project.recognition)
    expect(withRecognition).toHaveLength(1)

    expect(
      screen.getByRole('heading', { level: 5, name: 'Industry Recognition' }),
    ).toBeInTheDocument()
    expect(screen.getByText(withRecognition[0].recognition)).toBeInTheDocument()
    expect(container.querySelectorAll('h5')).toHaveLength(projects.length + 1)
  })

  it('preserves the work anchor the legacy header scrolls to', () => {
    const { container } = renderPage()

    const anchor = container.querySelector('#work')
    expect(anchor).not.toBeNull()
    expect(anchor.querySelectorAll('[data-slot="home-old-case-study"]')).toHaveLength(7)
  })
})

describe('/home-old actions', () => {
  it('renders every navigation action as a link to its baseline destination', () => {
    renderPage()

    BASELINE_LINKS.forEach(({ label, href, count }) => {
      const links = screen.getAllByRole('link', { name: new RegExp(`^${label}$`) })
      expect(links).toHaveLength(count)
      links.forEach((link) => {
        expect(link.tagName).toBe('A')
        expect(link).toHaveAttribute('href', href)
      })
      expect(screen.queryByRole('button', { name: label })).toBeNull()
    })
  })

  it('keeps the two enquiry-workflow actions as buttons', () => {
    renderPage()

    ;['Request A Quote', 'Book A Call'].forEach((label) => {
      const action = screen.getByRole('button', { name: label })
      expect(action.tagName).toBe('BUTTON')
      expect(action).toHaveAttribute('type', 'button')
    })
  })

  it('renders the remaining baseline copy', () => {
    renderPage()

    expect(
      screen.getByText(
        'We Help You Get it Done in Minimum days With Experienced Workforce of us.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('What kind of service you are looking for?')).toBeInTheDocument()
    expect(
      screen.getByText('Simple, transparent terms — focused on outcomes.'),
    ).toBeInTheDocument()

    whyUs.forEach((item) => {
      expect(screen.getByText(item.title)).toBeInTheDocument()
      expect(screen.getByText(item.desc)).toBeInTheDocument()
    })

    ratings.forEach((rating) => {
      expect(screen.getByText(rating.name)).toBeInTheDocument()
      expect(screen.getByText(rating.score)).toBeInTheDocument()
      expect(screen.getByText(rating.initial)).toBeInTheDocument()
    })
  })
})

describe('/home-old motion and chrome', () => {
  it('rings the enquiry action on selection when decorative motion is allowed', () => {
    const { container } = renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Coding' }))

    const cta = container.querySelector('[data-slot="home-old-enquire-cta"]')
    expect(cta).toHaveAttribute('data-pulse', 'true')
  })

  it('applies no ring under a reduced-motion preference', () => {
    setReducedMotion(true)
    const { container } = renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Coding' }))

    const cta = container.querySelector('[data-slot="home-old-enquire-cta"]')
    expect(cta).not.toHaveAttribute('data-pulse')
    expect(cta.className).not.toMatch(/\bring-2\b/)

    // The selection state itself still renders without decorative motion.
    expect(screen.getByRole('button', { name: 'Coding' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      container.querySelector('[data-slot="home-old-selected-service"]').textContent,
    ).toBe('Selected: Coding')
  })

  it('renders no chrome of its own, leaving the header and footer to the shell', () => {
    const { container } = renderPage()

    expect(container.querySelector('header')).toBeNull()
    expect(container.querySelector('footer')).toBeNull()
    expect(container.querySelector('nav')).toBeNull()
    expect(container.querySelector('main')).toBeNull()
    expect(container.querySelector('[data-slot="site-header"]')).toBeNull()
    expect(container.querySelector('[data-slot="site-footer"]')).toBeNull()
    expect(container.querySelector('[data-slot="legacy-layout"]')).toBeNull()
  })

  it('declares no literal color values in its source', () => {
    const source = readSource()

    expect(source.match(/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g)).toBeNull()
    expect(source).not.toMatch(/\b(?:rgb|rgba|hsl|hsla)\(/)
  })
})
