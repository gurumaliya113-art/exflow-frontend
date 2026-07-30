// Page tests for the migrated /portfolio route (task 11.5).
// Requirements: 1.1, 1.2, 6.1, 6.10, 10.5, 11.1
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import projects from '@/content/projects'
import {
  EnquiryProvider,
  ENQUIRY_OPEN_EVENT,
  useEnquiry,
} from '@/components/enquiry/EnquiryProvider'
import PortfolioPage from '../PortfolioPage'

const ENQUIRY_EVENT = ENQUIRY_OPEN_EVENT

/** Reports the provider's open state so the CTA's effect is observable. */
function EnquiryStateProbe() {
  const { open } = useEnquiry()
  return <p data-testid="enquiry-open">{String(open)}</p>
}

const SOURCE = readFileSync(
  resolve(process.cwd(), 'src/pages/PortfolioPage.tsx'),
  'utf8',
)

const renderPage = () =>
  render(
    <MemoryRouter>
      <PortfolioPage />
    </MemoryRouter>,
  )

afterEach(() => {
  vi.restoreAllMocks()
})

describe('PortfolioPage content', () => {
  it('renders every baseline project', () => {
    renderPage()

    expect(projects).toHaveLength(8)
    projects.forEach((project) => {
      expect(screen.getByRole('button', { name: project.name })).toBeInTheDocument()
    })
  })

  it('features exactly one project through the carousel', () => {
    const { container } = renderPage()

    expect(container.querySelector('[data-slot="project-carousel"]')).not.toBeNull()
    expect(container.querySelectorAll('[data-project-stage]')).toHaveLength(1)
    expect(container.querySelector('[data-project-name]')?.textContent).toBe(
      projects[0].name,
    )
  })
})

describe('PortfolioPage structure', () => {
  it('renders exactly one top-level heading', () => {
    const { container } = renderPage()

    const h1s = container.querySelectorAll('h1')
    expect(h1s).toHaveLength(1)
    expect(h1s[0].textContent).toBe('Our Work')
  })

  it('renders no chrome of its own, leaving the header and footer to the shell', () => {
    const { container } = renderPage()

    expect(container.querySelector('header')).toBeNull()
    expect(container.querySelector('footer')).toBeNull()
    expect(container.querySelector('[data-slot="site-header"]')).toBeNull()
    expect(container.querySelector('[data-slot="site-footer"]')).toBeNull()
    expect(container.querySelector('[data-slot="floating-cta"]')).toBeNull()
  })
})

describe('PortfolioPage enquiry action', () => {
  it('opens the Enquiry_Modal through the shared enquiry state', () => {
    render(
      <MemoryRouter>
        {/* Context path only; the window bridge is asserted separately. */}
        <EnquiryProvider legacyEventBridge={false}>
          <EnquiryStateProbe />
          <PortfolioPage />
        </EnquiryProvider>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('enquiry-open')).toHaveTextContent('false')
    fireEvent.click(screen.getByRole('button', { name: 'Request A Quote' }))
    expect(screen.getByTestId('enquiry-open')).toHaveTextContent('true')
  })

  it('opens the enquiry workflow from the page CTA', async () => {
    const user = userEvent.setup()
    const onEnquire = vi.fn()
    window.addEventListener(ENQUIRY_EVENT, onEnquire)

    try {
      renderPage()
      await user.click(screen.getByRole('button', { name: 'Request A Quote' }))
      expect(onEnquire).toHaveBeenCalledTimes(1)
    } finally {
      window.removeEventListener(ENQUIRY_EVENT, onEnquire)
    }
  })
})

describe('PortfolioPage token discipline', () => {
  it('declares no literal color values in its source', () => {
    const hex = SOURCE.match(/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g)
    expect(hex).toBeNull()
    expect(SOURCE).not.toMatch(/\b(?:rgb|rgba|hsl|hsla)\(/)
  })

  it('declares no inline style objects', () => {
    expect(SOURCE).not.toMatch(/style=\{\{/)
  })
})
