// Component tests for the portfolio project card (task 11.1).
// Requirements: 6.8, 6.9, 12.1, 12.2
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SelectionGroup from '@/components/system/SelectionGroup'
import ProjectCard from '../ProjectCard'

const project = {
  name: 'Scrapco',
  description: 'Doorstep scrap collection platform.',
  image: '/portfolio/scrapco.png',
  gradient: 'linear-gradient(135deg, #1565C0 0%, #2196F3 100%)',
  tag: 'Sustainability',
  tagColor: '#4CAF50',
  link: 'https://www.scrapco.app/',
}

const second = {
  name: 'PolicyLens',
  image: '/portfolio/policylens.png',
  gradient: 'linear-gradient(135deg, #311B92 0%, #5E35B1 100%)',
  tag: 'InsurTech',
  tagColor: '#673AB7',
}

describe('ProjectCard control contract', () => {
  it('renders a real button whose accessible name contains the project name', () => {
    render(<ProjectCard project={project} index={0} />)

    const card = screen.getByRole('button', { name: /Scrapco/ })
    expect(card.tagName).toBe('BUTTON')
    expect(card).toHaveAttribute('type', 'button')
    expect(card).toHaveAccessibleName(/Scrapco/)
    expect(card).toHaveAttribute('data-slot', 'project-card')
  })

  it('exposes the selected state through aria-pressed', () => {
    const { rerender } = render(<ProjectCard project={project} selected={false} />)

    const card = screen.getByRole('button', { name: /Scrapco/ })
    expect(card).toHaveAttribute('aria-pressed', 'false')

    rerender(<ProjectCard project={project} selected />)
    expect(screen.getByRole('button', { name: /Scrapco/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('activates on pointer click', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<ProjectCard project={project} index={3} value={3} onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: /Scrapco/ }))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(3, 3)
  })

  it('activates natively on Enter and Space', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<ProjectCard project={project} index={0} onSelect={onSelect} />)

    const card = screen.getByRole('button', { name: /Scrapco/ })
    card.focus()
    expect(card).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledTimes(1)

    await user.keyboard(' ')
    expect(onSelect).toHaveBeenCalledTimes(2)
  })

  it('keeps exactly one selected card in a selection group and moves selection on activation', async () => {
    const user = userEvent.setup()

    render(
      <SelectionGroup name="projects" defaultValue="Scrapco" label="Projects">
        <ProjectCard project={project} index={0} />
        <ProjectCard project={second} index={1} />
      </SelectionGroup>,
    )

    const first = screen.getByRole('button', { name: /Scrapco/ })
    const other = screen.getByRole('button', { name: /PolicyLens/ })
    expect(first).toHaveAttribute('aria-pressed', 'true')
    expect(other).toHaveAttribute('aria-pressed', 'false')

    await user.click(other)

    const pressed = screen
      .getAllByRole('button')
      .filter((node) => node.getAttribute('aria-pressed') === 'true')
    expect(pressed).toHaveLength(1)
    expect(pressed[0]).toHaveAccessibleName(/PolicyLens/)
  })

  it('renders the selected ring only when selected', () => {
    const { rerender } = render(<ProjectCard project={project} selected={false} />)

    let card = screen.getByRole('button', { name: /Scrapco/ })
    expect(card.className).not.toContain('ring-tech-cyan')
    expect(card).not.toHaveAttribute('data-selected')

    rerender(<ProjectCard project={project} selected />)
    card = screen.getByRole('button', { name: /Scrapco/ })
    expect(card.className).toContain('ring-2')
    expect(card.className).toContain('ring-tech-cyan')
    expect(card).toHaveAttribute('data-selected', 'true')
  })
})

describe('ProjectCard preview image', () => {
  it('reserves the preview box before the asset loads', () => {
    const { container } = render(<ProjectCard project={project} index={0} />)

    const wrapper = container.querySelector('[data-safe-image]')
    expect(wrapper.style.aspectRatio).toBe('16 / 9')
    expect(wrapper.className).toContain('w-full')

    const img = screen.getByAltText(/Scrapco project preview/)
    expect(img).toHaveAttribute('src', '/portfolio/scrapco.png')
    expect(img.className).toContain('object-cover')
  })

  it('keeps the reserved box and shows the alt text when the preview fails to load', () => {
    const { container } = render(<ProjectCard project={project} index={0} />)

    const wrapper = container.querySelector('[data-safe-image]')
    const reserved = wrapper.style.aspectRatio

    fireEvent.error(screen.getByAltText(/Scrapco project preview/))

    const after = container.querySelector('[data-safe-image]')
    expect(after).toBe(wrapper)
    expect(after).toHaveAttribute('data-state', 'error')
    expect(after.style.aspectRatio).toBe(reserved)

    const placeholder = container.querySelector('[data-safe-image-placeholder]')
    expect(placeholder).toHaveTextContent('Scrapco project preview')

    // The card stays an operable control with its name intact.
    const card = screen.getByRole('button', { name: /Scrapco/ })
    expect(card).toBeEnabled()
    expect(card).toHaveTextContent('Sustainability')
  })
})
