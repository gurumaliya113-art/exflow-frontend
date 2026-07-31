// Page tests for the migrated /solutions and /industries routes (task 12.2).
// Requirements: 5.1, 5.2, 5.6, 1.1, 10.5, 11.3
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { EnquiryProvider, useEnquiry } from '@/components/enquiry/EnquiryProvider'
import SolutionsPage from '../SolutionsPage'
import IndustriesPage from '../IndustriesPage'

/** Reports the provider's open state so a CTA's effect is observable. */
function EnquiryStateProbe() {
  const { open } = useEnquiry()
  return <p data-testid="enquiry-open">{String(open)}</p>
}

const readSource = (file) => readFileSync(resolve(process.cwd(), 'src/pages', file), 'utf8')

/**
 * Baseline expectations, copied verbatim from
 * `src/__fixtures__/baseline/content.json` for each route.
 */
const ROUTES = [
  {
    route: '/solutions',
    file: 'SolutionsPage.jsx',
    Page: SolutionsPage,
    eyebrow: 'What We Do',
    h1: 'Technology That Solves Real Business Problems.',
    closingHeading: 'Ready to save time, cut costs, and grow faster?',
    enquiryLabel: 'Talk to Our Team',
    cards: [
      {
        title: 'Business Automation',
        desc: 'Eliminate the repetitive manual work that quietly eats hundreds of hours every month, so your team can focus on what actually moves the business forward.',
        points: ['Workflow Automation', 'Document Automation', 'Approval Systems'],
      },
      {
        title: 'Customer Experience',
        desc: 'Give customers a faster, smoother experience across every touchpoint — website, booking, support — so more of them stay, trust you, and buy.',
        points: ['Websites & Web Apps', 'Mobile Apps', 'Booking & Customer Portals'],
      },
      {
        title: 'Business Management',
        desc: 'Run every part of your business from one place instead of scattered spreadsheets and chats — full visibility and control, from anywhere.',
        points: ['ERP & CRM', 'Inventory & Finance', 'HR & Fleet'],
      },
      {
        title: 'AI Solutions',
        desc: 'Put AI to work so your business keeps responding, selling, and supporting customers around the clock — without hiring more people.',
        points: ['AI Customer Support', 'AI WhatsApp & Voice', 'AI Sales Assistant'],
      },
      {
        title: 'Business Intelligence',
        desc: 'Turn the data you already have into clear, real-time answers, so you make better decisions faster and spot problems before they grow.',
        points: ['Live Dashboards', 'Reports & Analytics', 'Performance Tracking'],
      },
    ],
    extraText: [
      "We don't sell software — we solve business problems. Every system we build is designed to save you time, reduce costs, and help you grow.",
      'Automation, AI, and management systems that make your business run better and give you room to scale.',
      "Tell us the problem slowing your business down — we'll design the system that fixes it.",
    ],
  },
  {
    route: '/industries',
    file: 'IndustriesPage.jsx',
    Page: IndustriesPage,
    eyebrow: 'Industries We Serve',
    h1: 'Helping Businesses Across Industries Grow Through Technology.',
    closingHeading: "Don't see your industry? Let's talk anyway.",
    enquiryLabel: 'Discuss Your Project',
    cards: [
      {
        title: 'Education',
        desc: 'Digital learning, admissions, exams and student management that cut manual work and improve engagement.',
        points: [],
      },
      {
        title: 'Healthcare',
        desc: 'Operational systems, scheduling and analytics that let teams focus on patients, not paperwork.',
        points: [],
      },
      {
        title: 'Transport & Logistics',
        desc: 'Fleet tracking, fuel and route insights, and dashboards that cut losses and keep operations moving.',
        points: [],
      },
      {
        title: 'Retail',
        desc: 'Billing, inventory and customer insights that keep stores stocked and customers coming back.',
        points: [],
      },
      {
        title: 'Manufacturing',
        desc: 'Production tracking, inventory and reporting that improve efficiency on the floor.',
        points: [],
      },
      {
        title: 'Restaurants',
        desc: 'Ordering, kitchen and multi-outlet systems that speed up service and sharpen operations.',
        points: [],
      },
      {
        title: 'Construction',
        desc: 'Project, resource and site tracking that keep timelines and budgets under control.',
        points: [],
      },
      {
        title: 'Real Estate',
        desc: 'Listing, lead and client management that turn enquiries into closed deals.',
        points: [],
      },
      {
        title: 'Finance',
        desc: 'Secure workflows, reporting and automation that reduce risk and manual effort.',
        points: [],
      },
      {
        title: 'Startups',
        desc: 'Rapid MVPs and scalable platforms built to help you launch fast and grow.',
        points: [],
      },
    ],
    extraText: [
      'Whatever your industry, the goal is the same — save time, cut costs, serve customers better, and scale. We build technology around how your business actually works.',
      "We've built systems across very different sectors. If something in your operations is slow, manual, or scattered, there's a good chance we can fix it.",
    ],
  },
]

const renderPage = (Page) =>
  render(
    <MemoryRouter>
      <Page />
    </MemoryRouter>,
  )

describe.each(ROUTES)('$route content', ({ Page, eyebrow, cards, extraText }) => {
  it('renders every category title as a card heading', () => {
    const { container } = renderPage(Page)

    const headings = [...container.querySelectorAll('h3')].map((node) => node.textContent)
    expect(headings).toEqual(cards.map((card) => card.title))
  })

  it('renders every category description and feature point', () => {
    renderPage(Page)

    cards.forEach((card) => {
      expect(screen.getByText(card.desc)).toBeInTheDocument()
      card.points.forEach((point) => {
        expect(screen.getByText(point)).toBeInTheDocument()
      })
    })
  })

  it('renders the eyebrow and supporting copy from the baseline', () => {
    renderPage(Page)

    expect(screen.getByText(eyebrow)).toBeInTheDocument()
    extraText.forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument()
    })
  })

  it('paints feature chips with the token accent rather than a gradient', () => {
    const { container } = renderPage(Page)

    const badges = container.querySelectorAll('[data-accent]')
    badges.forEach((badge) => {
      expect(badge.getAttribute('data-accent')).toBe('tech')
    })
    expect(container.querySelector('[class*="bg-gradient"]')).toBeNull()
  })
})

describe.each(ROUTES)('$route structure', ({ Page, h1, closingHeading }) => {
  it('renders exactly one top-level heading', () => {
    const { container } = renderPage(Page)

    const h1s = container.querySelectorAll('h1')
    expect(h1s).toHaveLength(1)
    expect(h1s[0].textContent).toBe(h1)
  })

  it('renders the closing call to action heading one level below the page heading', () => {
    const { container } = renderPage(Page)

    const h2s = [...container.querySelectorAll('h2')].map((node) => node.textContent)
    expect(h2s).toEqual([closingHeading])
  })

  it('renders no chrome of its own, leaving the header and footer to the shell', () => {
    const { container } = renderPage(Page)

    expect(container.querySelector('header')).toBeNull()
    expect(container.querySelector('footer')).toBeNull()
    expect(container.querySelector('main')).toBeNull()
    expect(container.querySelector('nav')).toBeNull()
    expect(container.querySelector('[data-slot="site-header"]')).toBeNull()
    expect(container.querySelector('[data-slot="site-footer"]')).toBeNull()
    expect(container.querySelector('[data-slot="floating-cta"]')).toBeNull()
  })

  it('uses the uniform hero, content, closing-CTA section order', () => {
    const { container } = renderPage(Page)

    const slots = [...container.querySelectorAll('section[data-slot]')].map((node) =>
      node.getAttribute('data-slot'),
    )
    expect(slots).toEqual(['page-hero', 'page-cards', 'page-cta'])
  })
})

describe.each(ROUTES)('$route enquiry action', ({ Page, enquiryLabel }) => {
  it('opens the Enquiry_Modal through the shared enquiry state', () => {
    render(
      <MemoryRouter>
        {/* Context path only; the window bridge is covered by the provider tests. */}
        <EnquiryProvider legacyEventBridge={false}>
          <EnquiryStateProbe />
          <Page />
        </EnquiryProvider>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('enquiry-open')).toHaveTextContent('false')

    const ctas = screen.getAllByRole('button', { name: enquiryLabel })
    expect(ctas.length).toBeGreaterThan(0)
    fireEvent.click(ctas[0])

    expect(screen.getByTestId('enquiry-open')).toHaveTextContent('true')
  })

  it('routes every enquiry control through the shared state', () => {
    render(
      <MemoryRouter>
        <EnquiryProvider legacyEventBridge={false}>
          <EnquiryStateProbe />
          <Page />
        </EnquiryProvider>
      </MemoryRouter>,
    )

    const ctas = screen.getAllByRole('button', { name: enquiryLabel })
    ctas.forEach((cta) => {
      fireEvent.click(cta)
      expect(screen.getByTestId('enquiry-open')).toHaveTextContent('true')
    })
  })
})

describe.each(ROUTES)('$route source discipline', ({ file }) => {
  const source = readSource(file)

  it('declares no literal color values', () => {
    expect(source.match(/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g)).toBeNull()
    expect(source).not.toMatch(/\b(?:rgb|rgba|hsl|hsla)\(/)
  })

  it('imports no page-level chrome', () => {
    expect(source).not.toMatch(/PublicHeader/)
    expect(source).not.toMatch(/PublicFooter/)
  })

  it('declares no gradient or palette utilities', () => {
    expect(source).not.toMatch(/bg-gradient-to-/)
    expect(source).not.toMatch(/\b(?:from|via|to)-[a-z]+-\d{3}\b/)
  })

  it('declares no inline style objects', () => {
    expect(source).not.toMatch(/style=\{\{/)
  })
})
