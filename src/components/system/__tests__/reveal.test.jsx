import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { setReducedMotion } from '../../../test/setup'
import { Reveal, MAX_MOTION_MS, REVEAL_DURATION_MS } from '../Reveal'

describe('Reveal with motion allowed', () => {
  it('renders animated markup and keeps its children', () => {
    setReducedMotion(false)
    render(
      <Reveal delay={120}>
        <a href="/portfolio">View Project</a>
      </Reveal>,
    )

    const link = screen.getByRole('link', { name: 'View Project' })
    expect(link).toBeInTheDocument()

    const wrapper = link.parentElement
    expect(wrapper.dataset.reveal).toBe('motion')
    expect(Number(wrapper.dataset.revealDelay)).toBe(120)
    expect(Number(wrapper.dataset.revealDuration)).toBe(REVEAL_DURATION_MS)
  })

  it('keeps the entrance duration and delay within the 0-600ms budget', () => {
    setReducedMotion(false)
    render(
      <Reveal delay={5000}>
        <p>Budgeted</p>
      </Reveal>,
    )

    const wrapper = screen.getByText('Budgeted').parentElement
    const duration = Number(wrapper.dataset.revealDuration)
    const delay = Number(wrapper.dataset.revealDelay)

    expect(duration).toBeGreaterThan(0)
    expect(duration).toBeLessThanOrEqual(MAX_MOTION_MS)
    expect(delay).toBeGreaterThanOrEqual(0)
    expect(delay).toBeLessThanOrEqual(MAX_MOTION_MS)
  })
})

describe('Reveal under reduced motion', () => {
  it('renders a plain div in its final visual state', () => {
    setReducedMotion(true)
    render(
      <Reveal delay={400} y={48}>
        <p>Always readable</p>
      </Reveal>,
    )

    const wrapper = screen.getByText('Always readable').parentElement
    expect(wrapper.tagName).toBe('DIV')
    expect(wrapper.dataset.reveal).toBe('static')
    expect(wrapper.style.opacity).toBe('1')
    expect(wrapper.style.transform).toBe('none')
    expect(wrapper.style.transition).toBe('none')
  })

  it('keeps children present, visible, and operable', () => {
    setReducedMotion(true)
    render(
      <Reveal delay={400}>
        <button type="button">Enquire Now</button>
      </Reveal>,
    )

    const button = screen.getByRole('button', { name: 'Enquire Now' })
    expect(button).toBeVisible()
    expect(button).not.toBeDisabled()
    button.focus()
    expect(button).toHaveFocus()
  })
})
