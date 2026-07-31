/**
 * Homepage tests.
 *
 * The homepage was repositioned from a "website/app development" pitch to a
 * business-outcome "technology partner" message. These tests pin the structural
 * guarantees that must survive any copy change (single h1, no chrome, token
 * discipline, portfolio link, enquiry CTA, calendar persistence) and the key
 * strings of each content region in the current copy.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { vi } from 'vitest'

vi.mock('@/lib/supabase', () => import('@/test/mocks/supabase'))

import EnquiryProvider from '../../components/enquiry/EnquiryProvider'
import NewHomePage from '../NewHomePage'

const HEADLINE = 'We Build Technology That Helps Businesses Grow.'

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
  it('exposes exactly one h1, and it is the hero headline', () => {
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
    expect(screen.queryByRole('button', { name: /toggle menu/i })).toBeNull()
  })
})

describe('every content region renders', () => {
  it('keeps the hero value proposition and positioning cues', () => {
    renderHome()
    expect(
      screen.getByText(/We help businesses streamline operations, automate repetitive work/),
    ).toBeInTheDocument()
    expect(screen.getByText('Automate')).toBeInTheDocument()
    expect(screen.getByText('Optimise')).toBeInTheDocument()
    expect(screen.getByText('Scale')).toBeInTheDocument()
  })

  it('keeps the client indicators', () => {
    renderHome()
    expect(screen.getByText('Trusted By Businesses Across Industries')).toBeInTheDocument()
    expect(screen.getByText('RK Travels')).toBeInTheDocument()
    expect(screen.getByText('Adarsh School')).toBeInTheDocument()
    expect(screen.getByText('Shree Krishna Drycleaners')).toBeInTheDocument()
  })

  it('renders the business challenges we solve', () => {
    renderHome()
    expect(
      screen.getByText('Every growing business hits the same walls. We remove them.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Too much manual work')).toBeInTheDocument()
    expect(screen.getByText('AI & Workflow Automation')).toBeInTheDocument()
    expect(screen.getByText('One Custom Integrated Platform')).toBeInTheDocument()
  })

  it('renders the five outcome-based capabilities', () => {
    renderHome()
    expect(
      screen.getByText('Technology that solves real business problems.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Business Automation' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Customer Experience' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Business Management' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'AI Solutions' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Business Intelligence' })).toBeInTheDocument()
  })

  it('renders the why-choose outcomes', () => {
    renderHome()
    expect(screen.getByRole('heading', { name: 'Why Businesses Choose ExFlow' })).toBeInTheDocument()
    expect(screen.getByText('Reduce Operational Costs')).toBeInTheDocument()
    expect(screen.getByText('Long-Term Technology Partner')).toBeInTheDocument()
  })

  it('renders the industries', () => {
    renderHome()
    expect(screen.getByText('Education')).toBeInTheDocument()
    expect(screen.getByText('Healthcare')).toBeInTheDocument()
    expect(screen.getByText('Startups')).toBeInTheDocument()
  })

  it('renders the business-framed process steps', () => {
    renderHome()
    expect(screen.getByRole('heading', { name: 'Understand Your Business' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Identify Problems' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Support & Improve' })).toBeInTheDocument()
  })

  it('frames featured work as problem, solution, impact', () => {
    renderHome()
    expect(screen.getByText('Problem')).toBeInTheDocument()
    expect(screen.getByText('Our Solution')).toBeInTheDocument()
    expect(screen.getByText('Business Impact')).toBeInTheDocument()
    expect(
      screen.getByText('Managing educational content, exams and students manually.'),
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
  })

  it('keeps all four impact metrics with their labels', () => {
    const { container } = renderHome()
    const values = Array.from(
      container.querySelectorAll('[data-slot="stat-value"]'),
    ).map((node) => node.textContent)
    expect(values).toEqual(['500+', '50+', '35+', '10K+'])
    expect(screen.getByText('Hours Saved / Month')).toBeInTheDocument()
    expect(screen.getByText('Processes Automated')).toBeInTheDocument()
    expect(screen.getByText('Businesses Digitised')).toBeInTheDocument()
    expect(screen.getByText('Users Served')).toBeInTheDocument()
  })

  it('keeps the calendar and closing CTA regions', () => {
    renderHome()
    expect(
      screen.getByRole('heading', { name: "Let's Talk About Your Next Big Move." }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Schedule Your Discovery Call' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Ready to Transform Your Business?' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name*')).toBeInTheDocument()
    expect(screen.getByLabelText('Company Name*')).toBeInTheDocument()
    expect(screen.getByLabelText('Email*')).toBeInTheDocument()
  })
})

describe('portfolio action', () => {
  it('links "View Our Work" to the portfolio route', () => {
    renderHome()
    const link = screen.getByRole('link', { name: 'View Our Work' })
    expect(link).toHaveAttribute('href', '/portfolio')
  })
})

describe('enquiry action', () => {
  it('a "Start Your Project" CTA opens the shared enquiry modal', () => {
    renderHome()
    expect(screen.queryByRole('dialog')).toBeNull()

    const cta = screen.getAllByRole('button', { name: 'Start Your Project' })[0]
    fireEvent.click(cta)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('calendar selection persistence', () => {
  function dayButtons(container) {
    const calendar = container.querySelector('[data-slot="calendar"]')
    expect(calendar).not.toBeNull()
    return Array.from(calendar.querySelectorAll('button[data-day]'))
  }

  it('keeps the selected day after a CTA opens the modal', () => {
    const { container } = renderHome()

    const days = dayButtons(container)
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

    act(() => {
      fireEvent.click(screen.getAllByRole('button', { name: 'Start Your Project' })[0])
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
