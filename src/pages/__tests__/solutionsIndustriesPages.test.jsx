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
    eyebrow: 'Our Solutions',
    h1: 'Software That Solves Real Business Problems.',
    closingHeading:
      'Build technology that solves real business problems and creates long-term growth.',
    enquiryLabel: 'Talk to Our Team',
    cards: [
      {
        title: 'Custom Website Development',
        desc: 'Business websites, startup landing pages, corporate sites, and scalable web platforms — optimized for user acquisition, performance, and search visibility. Every site is engineered for speed, conversions, and growth.',
        points: [
          'SEO-optimized architecture',
          'Conversion-focused UX',
          'Lightning-fast load times',
        ],
      },
      {
        title: 'Custom Software Development',
        desc: 'Businesses outgrow spreadsheets fast. We develop CRM systems, ERP tools, dashboards, internal management systems, and workflow automation platforms tailored to your exact operational requirements.',
        points: ['CRM & ERP systems', 'Internal dashboards', 'Workflow automation'],
      },
      {
        title: 'AI Solutions & Automation',
        desc: 'We integrate artificial intelligence into business processes through OCR systems, AI analytics, automated reporting, chat systems, and intelligent workflows that reduce repetitive work and improve decision making.',
        points: ['OCR & document AI', 'Predictive analytics', 'Automated reporting'],
      },
      {
        title: 'Fleet Management Solutions',
        desc: 'GPS tracking, fuel analytics, driver behavior monitoring, vehicle diagnostics, geofencing, maintenance alerts, and centralized dashboards to improve operational efficiency and reduce losses.',
        points: [
          'Real-time GPS tracking',
          'Fuel & maintenance analytics',
          'Driver behavior reports',
        ],
      },
      {
        title: 'Restaurant Management Systems',
        desc: 'QR ordering, token systems, kitchen display systems, analytics dashboards, inventory tracking, staff management, and multi-outlet operational monitoring built for modern food businesses.',
        points: ['QR & token ordering', 'Kitchen display systems', 'Multi-outlet dashboards'],
      },
      {
        title: 'Business Automation',
        desc: 'Attendance systems, reporting automation, operational tracking, accounting tools, and analytics dashboards — we help businesses digitize processes and eliminate manual inefficiencies.',
        points: ['Attendance & HR systems', 'Accounting tools', 'Operational tracking'],
      },
    ],
    extraText: [
      'At exflow, we build software systems, websites, AI-powered tools, and business automation solutions designed to solve operational challenges and help companies scale faster.',
      'Technology should increase efficiency, reduce manual work, and create measurable business growth.',
      "Let's discuss your operational challenges and design a system around your business.",
    ],
  },
  {
    route: '/industries',
    file: 'IndustriesPage.jsx',
    Page: IndustriesPage,
    eyebrow: 'Industries We Serve',
    h1: 'Industry-Specific Software, Not Generic Templates.',
    closingHeading: "Don't see your industry? Talk to us anyway.",
    enquiryLabel: 'Discuss Your Project',
    cards: [
      {
        title: 'Logistics & Transportation',
        desc: 'Fleet monitoring systems, GPS tracking, fuel management, maintenance analytics, and operational dashboards.',
        points: [],
      },
      {
        title: 'Restaurants & Food Businesses',
        desc: 'Ordering systems, kitchen workflows, token management, analytics, remote monitoring, and customer experience optimization.',
        points: [],
      },
      {
        title: 'Scrap & Recycling Industry',
        desc: 'Digital systems for scrap collection networks, supplier management, aggregation operations, inventory tracking, and marketplace solutions.',
        points: [],
      },
      {
        title: 'Retail Businesses',
        desc: 'Billing systems, inventory management, customer analytics, and operational automation.',
        points: [],
      },
      {
        title: 'Startups',
        desc: 'Rapid MVP development, scalable web platforms, and technology solutions designed to accelerate growth.',
        points: [],
      },
      {
        title: 'Enterprises',
        desc: 'Custom internal software, dashboards, workflow automation, and large-scale digital transformation solutions.',
        points: [],
      },
      {
        title: 'Healthcare',
        desc: 'Operational systems, workflow management, automation tools, and analytics.',
        points: [],
      },
      {
        title: 'Manufacturing',
        desc: 'Production tracking, reporting systems, inventory management, and efficiency monitoring.',
        points: [],
      },
    ],
    extraText: [
      'exflow develops solutions designed around operational realities — not cookie-cutter products. Every system we build understands the specific workflows of your industry.',
      "We've built systems across many sectors. If you have an operational challenge, chances are we can solve it.",
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
