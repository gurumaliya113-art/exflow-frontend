/**
 * Homepage migration tests (task 12.1).
 *
 * These cover the route as it renders on the redesigned shell:
 * - the route's single top-level heading is the baseline hero headline
 *   (Requirement 10.5);
 * - the page renders page content only - no header, footer, or floating
 *   conversion action of its own, because the shell owns all three
 *   (Requirements 1.1, 2.1);
 * - every Content_Region's key strings survive the migration (Requirements
 *   4.1, 4.3, 4.4, 4.5);
 * - the scheduling calendar's selected day is page state that survives the
 *   Enquiry_Modal opening (Requirements 4.7, 4.8);
 * - a "Book A Call" conversion action opens the shared enquiry state
 *   (Requirement 4.7);
 * - "View Portfolio" targets the portfolio route (Requirement 4.6);
 * - and a source-level guard proves the token/chrome discipline holds
 *   (Requirements 1.1, 1.3).
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { vi } from 'vitest'

vi.mock('@/lib/supabase', () => import('@/test/mocks/supabase'))

import EnquiryProvider from '../../components/enquiry/EnquiryProvider'
import NewHomePage from '../NewHomePage'

const HEADLINE =
  'Websites & Software That Actually Grow Your Business — Not Just Sit There Looking Pretty.'

/** Render the page inside the same primitives the shell provides at runtime. */
function renderHome() {
  return render(
    <MemoryRouter>
      <EnquiryProvider legacyEventBridge={false}>
        <NewHomePage />
      </EnquiryProvider>
    </MemoryRouter>,
  )
}

describe('homepage heading structure', () => {
  it('exposes exactly one h1, and it is the baseline hero headline', () => {
    renderHome()

    const level1 = screen.getAllByRole('heading', { level: 1 })
    expect(level1).toHaveLength(1)
    expect(level1[0]).toHaveTextContent(HEADLINE)
  })
})

describe('the page renders content only (shell owns the chrome)', () => {
  it('mounts no header, footer, or floating conversion action of its own', () => {
    const { container } = renderHome()

    expect(container.querySelector('header')).toBeNull()
    expect(container.querySelector('footer')).toBeNull()
    expect(screen.queryByRole('banner')).toBeNull()
    expect(screen.queryByRole('contentinfo')).toBeNull()
    // No inline mobile menu control from the old sticky navbar.
    expect(screen.queryByRole('button', { name: /toggle menu/i })).toBeNull()
  })
})

describe('every Content_Region survives the migration', () => {
  it('keeps the hero trust indicators', () => {
    renderHome()
    expect(screen.getByText(/Google — 4\.8 Star Ratings/)).toBeInTheDocument()
    expect(screen.getByText(/Software & Co — 4\.9\/5\.0/)).toBeInTheDocument()
  })

  it('keeps the client indicators, separate from the metrics', () => {
    renderHome()
    expect(screen.getByText('Trusted By B2B Businesses Worldwide')).toBeInTheDocument()
    expect(screen.getByText('RK Travels')).toBeInTheDocument()
    expect(screen.getByText('Adarsh School')).toBeInTheDocument()
    expect(screen.getByText('Shree Krishna Drycleaners')).toBeInTheDocument()
  })

  it('keeps all four business metrics with their labels', () => {
    const { container } = renderHome()
    const values = Array.from(
      container.querySelectorAll('[data-slot="stat-value"]'),
    ).map((node) => node.textContent)
    expect(values).toEqual(['35+', '3+', '3+', '15+'])
    expect(screen.getByText('Projects Delivered')).toBeInTheDocument()
    expect(screen.getByText('Countries Served')).toBeInTheDocument()
    expect(screen.getByText('Years of Industry Experience')).toBeInTheDocument()
    expect(screen.getByText('Tech Stack Mastered')).toBeInTheDocument()
  })

  it('keeps the three service offerings', () => {
    renderHome()
    expect(
      screen.getByText('Custom Digital Solutions, Designed For Growth.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Website Design & Development' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Web Application Development' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Search Engine Optimisation' }),
    ).toBeInTheDocument()
  })

  it('keeps the comparison region and both lists', () => {
    renderHome()
    expect(
      screen.getByRole('heading', { name: 'Why would you want to settle for less?' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Other Agencies' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'exflow' })).toBeInTheDocument()
    expect(screen.getByText('Poor Collaboration')).toBeInTheDocument()
    expect(screen.getByText('Limited Understanding of Your Business')).toBeInTheDocument()
    expect(screen.getByText('Quick & Clear Communication')).toBeInTheDocument()
    expect(screen.getByText('Deep Industry, Brand and UX Research')).toBeInTheDocument()
  })

  it('keeps the development process region', () => {
    renderHome()
    expect(screen.getByText('Step 03')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Development' })).toBeInTheDocument()
    expect(
      screen.getByText(/our development team\s+translates them into a fully functional website/),
    ).toBeInTheDocument()
  })

  it('keeps the testimonial region', () => {
    renderHome()
    expect(
      screen.getByRole('heading', {
        name: "What It's Like to Work With Us, Straight From Our Clients",
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Gurtron completely transformed Gurukul Institute/)).toBeInTheDocument()
    expect(screen.getByText('Manoj Sir')).toBeInTheDocument()
    expect(
      screen.getByText('Senior Faculty Physics, Gurukul Institute'),
    ).toBeInTheDocument()
  })

  it('keeps the media placeholder region', () => {
    renderHome()
    expect(screen.getByRole('heading', { name: 'In the Media' })).toBeInTheDocument()
    expect(screen.getByText('Media highlights coming soon')).toBeInTheDocument()
  })

  it('keeps the calendar and contact regions', () => {
    renderHome()
    expect(
      screen.getByRole('heading', { name: "Let's Talk About Your Next Big Move." }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Schedule Your Discovery Call' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Request A Quote' })).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name*')).toBeInTheDocument()
    expect(screen.getByLabelText('Company Name*')).toBeInTheDocument()
    expect(screen.getByLabelText('Email*')).toBeInTheDocument()
  })
})

describe('portfolio action (Requirement 4.6)', () => {
  it('links "View Portfolio" to the portfolio route', () => {
    renderHome()
    const link = screen.getByRole('link', { name: 'View Portfolio' })
    expect(link).toHaveAttribute('href', '/portfolio')
  })
})

describe('enquiry action (Requirement 4.7)', () => {
  it('a "Book A Call" CTA opens the shared enquiry modal', () => {
    renderHome()
    expect(screen.queryByRole('dialog')).toBeNull()

    const bookACall = screen.getAllByRole('button', { name: 'Book A Call' })[0]
    fireEvent.click(bookACall)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('calendar selection persistence (Requirements 4.7, 4.8)', () => {
  /** The day-cell buttons rendered by the scheduling calendar. */
  function dayButtons(container) {
    const calendar = container.querySelector('[data-slot="calendar"]')
    expect(calendar).not.toBeNull()
    return Array.from(calendar.querySelectorAll('button[data-day]'))
  }

  it('keeps the selected day after a CTA opens the modal', () => {
    const { container } = renderHome()

    const days = dayButtons(container)
    // Pick an in-month day that is not the initially selected one.
    const target = days.find(
      (button) =>
        button.getAttribute('data-selected-single') !== 'true' &&
        !button.classList.contains('day-outside') &&
        button.getAttribute('data-outside') !== 'true',
    )
    expect(target).toBeTruthy()
    const targetKey = target.getAttribute('data-day')

    fireEvent.click(target)

    const selectedAfterPick = dayButtons(container).find(
      (button) => button.getAttribute('data-day') === targetKey,
    )
    expect(selectedAfterPick.getAttribute('data-selected-single')).toBe('true')

    // Open the modal via a conversion action; page state must be untouched.
    act(() => {
      fireEvent.click(screen.getAllByRole('button', { name: 'Book A Call' })[0])
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    const stillSelected = dayButtons(container).find(
      (button) => button.getAttribute('data-day') === targetKey,
    )
    expect(stillSelected.getAttribute('data-selected-single')).toBe('true')
  })
})

describe('token and chrome discipline (source guards)', () => {
  const source = readFileSync(
    resolve(process.cwd(), 'src/pages/NewHomePage.tsx'),
    'utf8',
  )

  it('declares no raw hex color literals', () => {
    const hex = source.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []
    expect(hex).toEqual([])
  })

  it('uses no rgb() or hsl() color literals', () => {
    expect(/\b(rgb|hsl)a?\(/.test(source)).toBe(false)
  })

  it('drops the retired .bge-site scope', () => {
    expect(source.includes('bge-site')).toBe(false)
  })

  it('imports neither PublicHeader nor PublicFooter (shell owns the chrome)', () => {
    expect(source.includes('PublicHeader')).toBe(false)
    expect(source.includes('PublicFooter')).toBe(false)
  })
})
