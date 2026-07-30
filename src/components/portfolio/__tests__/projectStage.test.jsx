// Unit tests for the featured-project stage.
// Requirements: 6.1, 6.6, 6.7, 12.1
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import baseline from '@/__fixtures__/baseline/projects.json'
import ProjectStage, {
  COMING_SOON_LABEL,
  VIEW_PROJECT_LABEL,
} from '../ProjectStage'

/** Turn a baseline fixture entry into the runtime project shape. */
function fromBaseline(name) {
  const entry = baseline.projects.find((p) => p.name === name)
  if (!entry) throw new Error(`baseline project not found: ${name}`)
  return {
    name: entry.name,
    description: entry.description,
    image: `/portfolio/${entry.image}`,
    gradient: entry.gradient,
    tag: entry.tag,
    tagColor: entry.tagColor,
    ...(entry.link ? { link: entry.link } : null),
  }
}

const scrapco = fromBaseline('Scrapco')
const fleet = fromBaseline('Fleet Management & Transportation at Ease')

describe('ProjectStage', () => {
  it('renders the tag, name, description, and image from the project data', () => {
    const { container } = render(<ProjectStage project={scrapco} />)

    expect(container.querySelector('[data-project-tag]')).toHaveTextContent(scrapco.tag)
    expect(screen.getByRole('heading', { level: 2, name: scrapco.name })).toBeVisible()
    expect(screen.getByText(scrapco.description)).toBeVisible()

    const img = screen.getByAltText(scrapco.name)
    expect(img).toHaveAttribute('src', scrapco.image)

    // Requirement 12.1: the image lives in a box reserved before load.
    const reserved = container.querySelector('[data-safe-image]')
    expect(reserved).not.toBeNull()
    expect(reserved.style.aspectRatio).toBe('16 / 9')
    expect(reserved.contains(img)).toBe(true)

    // The project's own gradient reaches the decorative wash unchanged.
    const wash = container.querySelector('[data-project-wash]')
    expect(wash).toHaveAttribute('aria-hidden', 'true')
    expect(wash.style.background).not.toBe('')

    // Description is capped for line length.
    expect(container.querySelector('[data-project-description]').className).toContain(
      'max-w-[var(--measure)]'
    )
  })

  it('renders a safe View Project link at the baseline destination for an available project', () => {
    const { container } = render(<ProjectStage project={scrapco} />)

    const link = screen.getByRole('link', { name: new RegExp('View Project') })
    expect(link).toHaveAttribute('href', 'https://www.scrapco.app/')
    expect(link).toHaveTextContent(VIEW_PROJECT_LABEL)
    expect(link).toHaveAttribute('target', '_blank')
    const rel = link.getAttribute('rel')
    expect(rel).toContain('noopener')
    expect(rel).toContain('noreferrer')

    expect(container.querySelector('[data-availability]')).toHaveAttribute(
      'data-availability',
      'available'
    )
    expect(screen.queryByText(COMING_SOON_LABEL)).toBeNull()
  })

  it('renders Coming Soon and no navigable destination for an unavailable project', () => {
    const { container } = render(<ProjectStage project={fleet} />)

    const status = container.querySelector('[data-project-status]')
    expect(status).toHaveTextContent(COMING_SOON_LABEL)
    expect(status.tagName).toBe('SPAN')
    expect(status).toHaveAttribute('data-tone', 'muted')

    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(container.querySelectorAll('a')).toHaveLength(0)
    expect(container.querySelectorAll('[href]')).toHaveLength(0)
    expect(screen.queryByText(VIEW_PROJECT_LABEL)).toBeNull()
    expect(container.querySelector('[data-availability]')).toHaveAttribute(
      'data-availability',
      'coming-soon'
    )
  })

  it('renders exactly one of the two presentations for every baseline project', () => {
    for (const entry of baseline.projects) {
      const { container, unmount } = render(<ProjectStage project={fromBaseline(entry.name)} />)

      const links = container.querySelectorAll('a[href]')
      const status = container.querySelectorAll('[data-project-status]')

      if (entry.available) {
        expect(links).toHaveLength(1)
        expect(links[0]).toHaveAttribute('href', entry.link)
        expect(status).toHaveLength(0)
      } else {
        expect(links).toHaveLength(0)
        expect(status).toHaveLength(1)
      }

      unmount()
    }
  })
})
