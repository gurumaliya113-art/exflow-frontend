// Component tests for the portfolio carousel (task 11.4).
// Requirements: 6.2, 6.3, 6.4, 6.5, 6.9, 10.9
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { positionLabel } from '@/lib/carousel'
import ProjectCarousel from '../ProjectCarousel'

const projects = [
  {
    name: 'Scrapco',
    description: 'Doorstep scrap collection platform.',
    image: '/portfolio/scrapco.png',
    gradient: 'linear-gradient(135deg, #1565C0 0%, #2196F3 100%)',
    tag: 'Sustainability',
    tagColor: '#4CAF50',
    link: 'https://www.scrapco.app/',
  },
  {
    name: 'EzDry',
    description: 'Doorstep laundry management.',
    image: '/portfolio/ezdry.png',
    tag: 'On-Demand',
    link: 'https://www.ezdry.in/',
  },
  {
    name: 'PolicyLens',
    description: 'Insurance broker portal.',
    image: '/portfolio/policylens.png',
    tag: 'InsurTech',
  },
]

/** The name of the project currently on the stage. */
const featuredName = (container) =>
  container.querySelector('[data-project-name]')?.textContent

/** Every project card, in DOM order. */
const cards = () =>
  screen
    .queryAllByRole('button')
    .filter((node) => node.dataset.slot === 'project-card')

/** The cards exposing the selected state. */
const pressedCards = () =>
  cards().filter((node) => node.getAttribute('aria-pressed') === 'true')

const liveRegion = () => screen.getByRole('status')

/** Assert the stage, the single pressed card, and the announcement all agree. */
const expectSelection = (container, i) => {
  const project = projects[i]

  expect(container.querySelectorAll('[data-project-stage]')).toHaveLength(1)
  expect(featuredName(container)).toBe(project.name)

  const pressed = pressedCards()
  expect(pressed).toHaveLength(1)
  expect(pressed[0]).toHaveAccessibleName(project.name)

  expect(liveRegion()).toHaveTextContent(
    positionLabel(i, projects.length, project.name),
  )
}

describe('ProjectCarousel initial selection', () => {
  it('features exactly one project and marks exactly one card as selected', () => {
    const { container } = render(<ProjectCarousel projects={projects} />)

    expect(cards()).toHaveLength(3)
    expectSelection(container, 0)
  })

  it('mounts the polite live region with the initial position announcement', () => {
    render(<ProjectCarousel projects={projects} />)

    const region = liveRegion()
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region.className).toContain('sr-only')
    expect(region).toHaveTextContent('Project 1 of 3: Scrapco')
  })
})

describe('ProjectCarousel previous and next', () => {
  it('moves the stage, the selected card, and the announcement forward', async () => {
    const user = userEvent.setup()
    const { container } = render(<ProjectCarousel projects={projects} />)

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expectSelection(container, 1)

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expectSelection(container, 2)
  })

  it('moves the stage, the selected card, and the announcement backward', async () => {
    const user = userEvent.setup()
    const { container } = render(<ProjectCarousel projects={projects} defaultIndex={2} />)

    expectSelection(container, 2)

    await user.click(screen.getByRole('button', { name: 'Previous' }))
    expectSelection(container, 1)
  })

  it('wraps from the final project to the first on next', async () => {
    const user = userEvent.setup()
    const { container } = render(<ProjectCarousel projects={projects} defaultIndex={2} />)

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expectSelection(container, 0)
  })

  it('wraps from the first project to the final one on previous', async () => {
    const user = userEvent.setup()
    const { container } = render(<ProjectCarousel projects={projects} />)

    await user.click(screen.getByRole('button', { name: 'Previous' }))
    expectSelection(container, 2)
  })
})

describe('ProjectCarousel direct selection', () => {
  it('features the project whose card is activated', async () => {
    const user = userEvent.setup()
    const { container } = render(<ProjectCarousel projects={projects} />)

    await user.click(screen.getByRole('button', { name: 'PolicyLens' }))
    expectSelection(container, 2)

    await user.click(screen.getByRole('button', { name: 'EzDry' }))
    expectSelection(container, 1)
  })

  it('features the project whose slide selector is activated', async () => {
    const user = userEvent.setup()
    const { container } = render(<ProjectCarousel projects={projects} />)

    await user.click(screen.getByRole('button', { name: 'Show project 3' }))
    expectSelection(container, 2)

    await user.click(screen.getByRole('button', { name: 'Show project 2' }))
    expectSelection(container, 1)
  })
})

describe('ProjectCarousel empty list', () => {
  it('renders without crashing and announces nothing', () => {
    const { container } = render(<ProjectCarousel projects={[]} />)

    expect(container.querySelector('[data-slot="project-carousel"]')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-project-stage]')).toHaveLength(0)
    expect(cards()).toHaveLength(0)
    expect(liveRegion()).toHaveTextContent('')
  })
})
