// Component tests for the form primitives: `Field` owns all form
// accessibility wiring, `FormStatus` owns the live status region.
//
// Requirements: 9.7, 10.6, 10.9
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Field from '../Field.jsx'
import FormStatus, { RESERVED_HEIGHT_CLASS } from '../FormStatus.jsx'

describe('Field', () => {
  it('associates the label with the control by id', () => {
    render(<Field id="full-name" label="Full Name" />)

    const control = screen.getByLabelText('Full Name')
    expect(control).toBeInTheDocument()
    expect(control.tagName).toBe('INPUT')
    expect(control).toHaveAttribute('id', 'full-name')
    expect(document.querySelector('label[for="full-name"]')).toBeInTheDocument()
  })

  it('keeps the accessible name available when a placeholder is also set', () => {
    render(<Field id="email" label="Email" placeholder="you@example.com" />)

    const control = screen.getByLabelText('Email')
    expect(control).toHaveAttribute('placeholder', 'you@example.com')
    expect(screen.getByText('Email')).toBeVisible()
  })

  it('exposes required state visually and to assistive technology', () => {
    render(<Field id="phone" label="Phone" required />)

    const control = screen.getByLabelText(/Phone/)
    expect(control).toHaveAttribute('aria-required', 'true')

    const indicator = document.querySelector('[data-slot="required-indicator"]')
    expect(indicator).toBeVisible()
    expect(indicator).toHaveAttribute('aria-hidden', 'true')
  })

  it('omits aria-required and the indicator when the field is optional', () => {
    render(<Field id="company" label="Company" />)

    expect(screen.getByLabelText('Company')).not.toHaveAttribute('aria-required')
    expect(document.querySelector('[data-slot="required-indicator"]')).toBeNull()
  })

  it('marks the control invalid and announces the error through role="alert"', () => {
    render(<Field id="email" label="Email" error="Enter a valid email address" />)

    const control = screen.getByLabelText('Email')
    expect(control).toHaveAttribute('aria-invalid', 'true')

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Enter a valid email address')
    expect(control.getAttribute('aria-describedby')).toContain(alert.id)
  })

  it('is not marked invalid without an error', () => {
    render(<Field id="email" label="Email" />)

    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('links both hint and error through aria-describedby in DOM order', () => {
    render(
      <Field
        id="details"
        label="Project Details"
        hint="Up to 5,000 characters"
        error="Project details are required"
      />,
    )

    const control = screen.getByLabelText('Project Details')
    expect(control.getAttribute('aria-describedby')).toBe('details-hint details-error')

    const ids = control.getAttribute('aria-describedby').split(' ')
    ids.forEach((id) => {
      expect(document.getElementById(id)).toBeInTheDocument()
    })
    expect(document.getElementById('details-hint')).toHaveTextContent('Up to 5,000 characters')
    expect(document.getElementById('details-error')).toHaveTextContent(
      'Project details are required',
    )
  })

  it('references only the hint when there is no error', () => {
    render(<Field id="budget" label="Budget Range" hint="Optional" />)

    expect(screen.getByLabelText('Budget Range')).toHaveAttribute(
      'aria-describedby',
      'budget-hint',
    )
  })

  it('forwards maxLength to the control', () => {
    render(<Field id="full-name" label="Full Name" maxLength={100} />)

    expect(screen.getByLabelText('Full Name')).toHaveAttribute('maxlength', '100')
  })

  it('renders a textarea with as="textarea", keeping the same wiring', () => {
    render(
      <Field
        as="textarea"
        id="details"
        label="Project Details"
        required
        maxLength={5000}
        error="Project details are required"
      />,
    )

    const control = screen.getByLabelText(/Project Details/)
    expect(control.tagName).toBe('TEXTAREA')
    expect(control).toHaveAttribute('maxlength', '5000')
    expect(control).toHaveAttribute('aria-required', 'true')
    expect(control).toHaveAttribute('aria-invalid', 'true')
    expect(control.getAttribute('aria-describedby')).toBe('details-error')
  })
})

describe('FormStatus', () => {
  it('exposes a polite live region and reserves height while idle', () => {
    render(<FormStatus state="idle" />)

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveAttribute('data-state', 'idle')
    expect(status).toBeInTheDocument()
    expect(status.textContent).toBe('')
    // The box exists before any message, so a later message displaces
    // surrounding content by no more than this element's own height.
    expect(status.className).toContain(RESERVED_HEIGHT_CLASS)
  })

  it('keeps the same reserved-height region across every state', () => {
    const { rerender } = render(<FormStatus state="idle" />)
    const idleClass = screen.getByRole('status').className

    for (const state of ['pending', 'success', 'error']) {
      rerender(<FormStatus state={state} message={`${state} message`} />)
      const status = screen.getByRole('status')
      expect(status).toHaveAttribute('data-state', state)
      expect(status).toHaveTextContent(`${state} message`)
      expect(status.className).toContain(RESERVED_HEIGHT_CLASS)
      expect(status.className.split(' ').filter((c) => c.startsWith('min-h-'))).toEqual(
        idleClass.split(' ').filter((c) => c.startsWith('min-h-')),
      )
    }
  })

  it('renders a non-color pending indicator alongside the message', () => {
    render(<FormStatus state="pending" message="Sending your enquiry" />)

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Sending your enquiry')
    const indicator = status.querySelector('[data-slot="form-status-indicator"]')
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveAttribute('aria-hidden', 'true')
  })
})
