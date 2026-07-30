import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Card, CardContent, CardHeader, CardTitle, cardVariants } from '../card'
import { Input } from '../input'
import { Textarea } from '../textarea'
import { Label } from '../label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../accordion'
import { Calendar } from '../calendar'

/**
 * Component tests for the token-backed shadcn primitives (task 6.8).
 * Requirements: 1.1, 1.2, 9.1, 9.2, 10.3
 */

const UI_DIR = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Roles that clear 3:1 against every surface, so they may identify a control. */
const CONTROL_BOUNDARY_CLASS = 'border-content-muted'

function classesOf(className: string) {
  return className.split(/\s+/).filter(Boolean)
}

describe('Card tones', () => {
  it('renders each tone on a token surface with no raw color', () => {
    expect(classesOf(cardVariants({ tone: 'surface' }))).toContain('bg-surface')
    expect(classesOf(cardVariants({ tone: 'raised' }))).toContain('bg-surface-high')
    expect(classesOf(cardVariants({ tone: 'raised' }))).toContain('shadow-raise')

    // An outline card's edge is the only thing defining the group, so it uses
    // the 3:1-capable role rather than a decorative `line` token.
    const outline = classesOf(cardVariants({ tone: 'outline' }))
    expect(outline).toContain('bg-transparent')
    expect(outline).toContain(CONTROL_BOUNDARY_CLASS)
  })

  it('defaults to the surface tone and exposes it as a data attribute', () => {
    render(<Card>Panel</Card>)
    const card = screen.getByText('Panel')
    expect(card).toHaveAttribute('data-tone', 'surface')
    expect(card.className).toContain('bg-surface')
  })

  it('keeps caller classes able to override the tone', () => {
    render(<Card tone="raised" className="bg-surface" />)
    const card = document.querySelector('[data-slot="card"]') as HTMLElement
    expect(card.className).toContain('bg-surface')
    expect(card.className).not.toContain('bg-surface-high')
  })

  it('still renders the subcomponents pages already import', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Discovery Call</CardTitle>
        </CardHeader>
        <CardContent>Pick a date</CardContent>
      </Card>,
    )
    expect(screen.getByText('Discovery Call')).toBeInTheDocument()
    expect(screen.getByText('Pick a date')).toBeInTheDocument()
  })
})

describe('Card interactive and selected states', () => {
  it('gates the decorative hover lift behind a motion preference', () => {
    render(<Card interactive>Project</Card>)
    const card = screen.getByText('Project')

    expect(card).toHaveAttribute('data-interactive', 'true')
    // Non-color hover cue plus a lift that reduced motion neutralises.
    expect(card.className).toContain('hover:shadow-raise')
    expect(card.className).toContain('motion-safe:hover:-translate-y-0.5')
    expect(card.className).toContain('motion-decorative')
    // The lift must never be applied unconditionally.
    expect(classesOf(card.className)).not.toContain('hover:-translate-y-0.5')
  })

  it('marks a selected card with a 2px cyan ring and a data attribute', () => {
    render(<Card selected>Featured</Card>)
    const card = screen.getByText('Featured')

    expect(card).toHaveAttribute('data-selected', 'true')
    expect(classesOf(card.className)).toContain('ring-2')
    expect(classesOf(card.className)).toContain('ring-tech-cyan')
  })

  it('omits the ring and the selected attribute when not selected', () => {
    render(<Card>Other</Card>)
    const card = screen.getByText('Other')

    expect(card).not.toHaveAttribute('data-selected')
    expect(classesOf(card.className)).not.toContain('ring-2')
  })
})

describe('Input and Textarea', () => {
  it('renders an input with a 3:1-capable control boundary', () => {
    render(<Input placeholder="John Doe" />)
    const input = screen.getByPlaceholderText('John Doe')

    expect(classesOf(input.className)).toContain(CONTROL_BOUNDARY_CLASS)
    // `line` tokens are decorative only, never a control's identifying edge.
    expect(input.className).not.toContain('border-line')
    expect(input.className).toContain('min-h-[var(--size-touch)]')
    // the global :focus-visible ring is not suppressed
    expect(input.className).not.toContain('outline-none')
  })

  it('renders a textarea sharing the same boundary and non-color state cues', () => {
    render(<Textarea placeholder="Tell us more" />)
    const textarea = screen.getByPlaceholderText('Tell us more')

    expect(textarea.tagName).toBe('TEXTAREA')
    expect(classesOf(textarea.className)).toContain(CONTROL_BOUNDARY_CLASS)
    expect(textarea.className).toContain('resize-y')
    // invalid -> thicker border, disabled -> dashed border, hover -> shadow
    expect(textarea.className).toContain('aria-invalid:border-2')
    expect(textarea.className).toContain('disabled:border-dashed')
    expect(textarea.className).toContain('hover:shadow-raise')
  })

  it('accepts typed text through both field primitives', async () => {
    render(
      <>
        <Input aria-label="Full Name" />
        <Textarea aria-label="Message" />
      </>,
    )

    await userEvent.type(screen.getByLabelText('Full Name'), 'Ada')
    await userEvent.type(screen.getByLabelText('Message'), 'Hello')

    expect(screen.getByLabelText('Full Name')).toHaveValue('Ada')
    expect(screen.getByLabelText('Message')).toHaveValue('Hello')
  })
})

describe('Label', () => {
  it('associates its text with the control it names', () => {
    render(
      <>
        <Label htmlFor="company">Company Name</Label>
        <Input id="company" />
      </>,
    )

    const input = screen.getByLabelText('Company Name')
    expect(input).toHaveAttribute('id', 'company')
  })

  it('carries the label type role as a font-size, not a text utility', () => {
    render(<Label htmlFor="email">Email</Label>)
    const label = screen.getByText('Email')

    // Written as an arbitrary property so tailwind-merge cannot drop it when a
    // caller also passes a text color.
    expect(label.className).toContain('[font-size:var(--text-label)]')
    expect(label.className).toContain('text-content')
  })

  it('keeps the type role when a caller adds a text color', () => {
    render(
      <Label htmlFor="name" className="text-content-muted">
        Full Name
      </Label>,
    )
    const label = screen.getByText('Full Name')

    expect(label.className).toContain('[font-size:var(--text-label)]')
    expect(label.className).toContain('text-content-muted')
  })
})

describe('Accordion', () => {
  function renderAccordion() {
    return render(
      <Accordion type="single" collapsible>
        <AccordionItem value="one">
          <AccordionTrigger>How long does a build take?</AccordionTrigger>
          <AccordionContent>Between four and eight weeks.</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
  }

  it('starts collapsed and exposes the collapsed state', () => {
    renderAccordion()
    const trigger = screen.getByRole('button', {
      name: 'How long does a build take?',
    })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Between four and eight weeks.')).toBeNull()
  })

  it('expands and collapses, keeping aria-expanded in step', async () => {
    renderAccordion()
    const trigger = screen.getByRole('button', {
      name: 'How long does a build take?',
    })

    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Between four and eight weeks.')).toBeVisible()

    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('signals hover and the open state without relying on color alone', () => {
    renderAccordion()
    const trigger = screen.getByRole('button', {
      name: 'How long does a build take?',
    })

    // hover -> underline; open -> the chevron rotates
    expect(trigger.className).toContain('hover:underline')
    expect(trigger.className).toContain('[&[data-state=open]>svg]:rotate-180')
    expect(trigger.querySelector('svg')).not.toBeNull()
  })
})

describe('Calendar', () => {
  const selected = new Date(2025, 0, 15)

  function renderCalendar() {
    return render(
      <Calendar mode="single" selected={selected} defaultMonth={selected} />,
    )
  }

  it('marks exactly one day as selected to assistive technology', () => {
    renderCalendar()

    const selectedCells = document.querySelectorAll(
      '[role="gridcell"][aria-selected="true"]',
    )
    expect(selectedCells).toHaveLength(1)
    expect(selectedCells[0].textContent).toContain('15')
  })

  it('renders the selected day as a cyan-filled pill no other day carries', () => {
    renderCalendar()

    const selectedButtons = document.querySelectorAll(
      'button[data-selected-single="true"]',
    )
    expect(selectedButtons).toHaveLength(1)

    const pill = selectedButtons[0] as HTMLElement
    expect(pill.className).toContain('data-[selected-single=true]:bg-tech-cyan')
    expect(pill.className).toContain('data-[selected-single=true]:rounded-pill')
    expect(pill.className).toContain('data-[selected-single=true]:text-canvas')

    // Every other day stays unselected, so the pill treatment does not apply.
    const unselected = Array.from(
      document.querySelectorAll('button[data-day]'),
    ).filter((b) => b.getAttribute('data-selected-single') !== 'true')
    expect(unselected.length).toBeGreaterThan(0)
    for (const day of unselected) {
      expect(day).not.toHaveAttribute('data-selected-single', 'true')
    }
  })

  it('moves the selection when another day is chosen', async () => {
    function Harness() {
      const [date, setDate] = React.useState<Date | undefined>(selected)
      return (
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          defaultMonth={selected}
        />
      )
    }

    render(<Harness />)
    const target = Array.from(
      document.querySelectorAll('[role="gridcell"]:not([data-outside]) button'),
    ).find((b) => b.textContent?.trim() === '20') as HTMLElement
    expect(target).toBeDefined()

    await userEvent.click(target)

    const selectedCells = document.querySelectorAll(
      '[role="gridcell"][aria-selected="true"]',
    )
    expect(selectedCells).toHaveLength(1)
    expect(selectedCells[0].textContent).toContain('20')
  })
})

describe('token discipline', () => {
  const FILES = [
    'card.tsx',
    'input.tsx',
    'textarea.tsx',
    'label.tsx',
    'accordion.jsx',
    'calendar.tsx',
  ]

  it('contains no raw hex color literals', () => {
    for (const file of FILES) {
      const source = readFileSync(join(UI_DIR, file), 'utf8')
      const hex = source.match(/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g)
      expect(hex, `${file} should not contain hex colors`).toBeNull()
    }
  })

  it('contains no rgb(), rgba(), hsl(), or hsla() literals', () => {
    for (const file of FILES) {
      const source = readFileSync(join(UI_DIR, file), 'utf8')
      expect(source, `${file} should not contain color functions`).not.toMatch(
        /\b(?:rgba?|hsla?)\(/,
      )
    }
  })
})
