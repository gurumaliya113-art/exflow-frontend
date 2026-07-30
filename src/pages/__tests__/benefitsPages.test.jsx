// Page tests for the migrated /partner-benefits and /work-benefits routes (task 12.8).
// Requirements: 1.1, 1.2, 8.9, 8.10, 10.5, 11.3, 11.6, 11.8
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import PartnerBenefitsPage, { partnerBenefits } from '../PartnerBenefitsPage'
import WorkBenefitsPage, { workBenefits } from '../WorkBenefitsPage'

const readSource = (file) =>
  readFileSync(resolve(process.cwd(), 'src/pages', file), 'utf8')

const PAGES = [
  {
    route: '/partner-benefits',
    Page: PartnerBenefitsPage,
    file: 'PartnerBenefitsPage.jsx',
    h1: 'Partner Benefits',
    eyebrow: 'Why Partner',
    lede:
      'Discover what you get when you partner with exflow — transparent terms, shared success, and real growth opportunities.',
    closing: 'Ready to Partner?',
    closingLede: 'Join our partner program and start growing together.',
    benefits: partnerBenefits,
    action: { label: 'Become a Partner', href: '/partner' },
  },
  {
    route: '/work-benefits',
    Page: WorkBenefitsPage,
    file: 'WorkBenefitsPage.jsx',
    h1: 'Why Get Your Work Done With Us',
    eyebrow: 'Work Benefits',
    lede:
      'Simple, transparent terms. No hidden charges. Focused on outcomes and your satisfaction.',
    closing: 'Ready to Start?',
    closingLede: "Tell us about your project and we'll take it from there.",
    benefits: workBenefits,
    action: { label: 'Enquire Now', href: '/enquire' },
  },
]

const renderPage = (Page) =>
  render(
    <MemoryRouter>
      <Page />
    </MemoryRouter>,
  )

describe.each(PAGES)('$route', ({ Page, file, h1, eyebrow, lede, closing, closingLede, benefits, action }) => {
  it('renders exactly one top-level heading', () => {
    const { container } = renderPage(Page)

    const h1s = container.querySelectorAll('h1')
    expect(h1s).toHaveLength(1)
    expect(h1s[0].textContent).toBe(h1)
  })

  it('increases heading levels by no more than one between consecutive headings', () => {
    const { container } = renderPage(Page)

    const levels = [...container.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((node) =>
      Number(node.tagName.slice(1)),
    )

    expect(levels[0]).toBe(1)
    levels.slice(1).forEach((level, i) => {
      expect(level - levels[i]).toBeLessThanOrEqual(1)
    })
  })

  it('renders every benefit title and description unchanged', () => {
    renderPage(Page)

    expect(benefits).toHaveLength(6)
    benefits.forEach((benefit) => {
      expect(
        screen.getByRole('heading', { level: 2, name: benefit.title }),
      ).toBeInTheDocument()
      expect(screen.getByText(benefit.desc)).toBeInTheDocument()
    })
  })

  it('keeps the surrounding intro and closing copy', () => {
    renderPage(Page)

    expect(screen.getByText(eyebrow)).toBeInTheDocument()
    expect(screen.getByText(lede)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: closing })).toBeInTheDocument()
    expect(screen.getByText(closingLede)).toBeInTheDocument()
  })

  it('renders its conversion action as a link to the baseline destination', () => {
    renderPage(Page)

    const cta = screen.getByRole('link', { name: action.label })
    expect(cta).toHaveAttribute('href', action.href)
    expect(cta.tagName).toBe('A')
    expect(screen.queryByRole('button', { name: action.label })).toBeNull()
  })

  it('renders no chrome of its own, leaving the header and footer to the shell', () => {
    const { container } = renderPage(Page)

    expect(container.querySelector('header')).toBeNull()
    expect(container.querySelector('footer')).toBeNull()
    expect(container.querySelector('nav')).toBeNull()
    expect(container.querySelector('main')).toBeNull()
    expect(container.querySelector('[data-slot="site-header"]')).toBeNull()
    expect(container.querySelector('[data-slot="site-footer"]')).toBeNull()
    expect(container.querySelector('[data-slot="legacy-layout"]')).toBeNull()
    expect(container.querySelector('[data-slot="floating-cta"]')).toBeNull()
  })

  it('declares no literal color values in its source', () => {
    const source = readSource(file)

    expect(source.match(/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g)).toBeNull()
    expect(source).not.toMatch(/\b(?:rgb|rgba|hsl|hsla)\(/)
  })
})

describe('benefit data parity with the pre-redesign pages', () => {
  it('exposes only one card per benefit, in the recorded order', () => {
    const { container } = renderPage(PartnerBenefitsPage)

    expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(
      partnerBenefits.length,
    )
    expect(
      [...container.querySelectorAll('[data-slot="card"] h2')].map((h) => h.textContent),
    ).toEqual(partnerBenefits.map((b) => b.title))
  })

  it('renders one work benefit card per entry, in the recorded order', () => {
    const { container } = renderPage(WorkBenefitsPage)

    expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(
      workBenefits.length,
    )
    expect(
      [...container.querySelectorAll('[data-slot="card"] h2')].map((h) => h.textContent),
    ).toEqual(workBenefits.map((b) => b.title))
  })
})
