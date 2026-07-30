/**
 * `EnquiryFormFields` tests for task 9.4.
 *
 * These are the example-based checks behind Property 12 (validation accepts
 * exactly the valid submissions and never loses input) and Property 14
 * (submission lifecycle is single-shot and terminal-state consistent). Supabase
 * is mocked at the `lib/supabase` module boundary, so "reaches the destination"
 * is asserted from the recorded insert calls and no test performs network I/O.
 *
 * Requirements: 7.7, 7.8, 7.9, 7.10, 7.11, 7.12, 9.7, 10.6, 11.7, 11.9
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

vi.mock('@/lib/supabase', () => import('@/test/mocks/supabase'))
vi.mock('react-hot-toast', () => {
  const error = vi.fn()
  const success = vi.fn()
  const toast = { error, success }
  return { default: toast, toast }
})

import toast from 'react-hot-toast'
import {
  insertCalls,
  resetSupabaseMock,
  setInsertDelay,
  setInsertError,
} from '@/test/mocks/supabase'
import EnquiryFormFields, { ENQUIRY_MESSAGES } from '../EnquiryFormFields'

const LABELS = {
  name: /^Full Name/,
  company: /^Company/,
  phone: /^Phone/,
  email: /^Email/,
  budget: /^Budget Range/,
  timeline: /^Timeline/,
  project_details: /^Project Details/,
}

const VALID = {
  name: 'Ada Lovelace',
  company: 'Analytical Engines',
  phone: '9876543210',
  email: 'ada@example.com',
  budget: '2,00,000',
  timeline: '3 weeks',
  project_details: 'A dashboard for engine telemetry.',
}

function control(field) {
  return screen.getByLabelText(LABELS[field])
}

function enter(field, value) {
  fireEvent.change(control(field), { target: { value } })
}

function fill(values) {
  Object.entries(values).forEach(([field, value]) => enter(field, value))
}

function submitButton() {
  return screen.getByRole('button', { name: 'Submit Enquiry' })
}

beforeEach(() => {
  resetSupabaseMock()
})

afterEach(() => {
  resetSupabaseMock()
})

describe('fields (Requirements 7.7, 10.6)', () => {
  it('renders all seven fields with associated labels and their limits', () => {
    render(<EnquiryFormFields />)

    const expected = [
      ['name', '100', 'INPUT'],
      ['company', '100', 'INPUT'],
      ['phone', '20', 'INPUT'],
      ['email', '254', 'INPUT'],
      ['budget', '100', 'INPUT'],
      ['timeline', '100', 'INPUT'],
      ['project_details', '5000', 'TEXTAREA'],
    ]

    expected.forEach(([field, maxLength, tag]) => {
      const node = control(field)
      expect(node).toBeInTheDocument()
      expect(node.tagName).toBe(tag)
      expect(node).toHaveAttribute('maxlength', maxLength)
    })
  })

  it('exposes the required state of name, phone and project details', () => {
    render(<EnquiryFormFields />)

    expect(control('name')).toHaveAttribute('aria-required', 'true')
    expect(control('phone')).toHaveAttribute('aria-required', 'true')
    expect(control('project_details')).toHaveAttribute('aria-required', 'true')

    expect(control('company')).not.toHaveAttribute('aria-required')
    expect(control('email')).not.toHaveAttribute('aria-required')
  })
})

describe('rejected submit (Requirements 7.8, 11.9)', () => {
  it('identifies every invalid field, keeps values, submits nothing, focuses the first invalid control', async () => {
    render(<EnquiryFormFields />)

    fill({ company: 'Analytical Engines', phone: '123', email: 'nope' })
    fireEvent.click(submitButton())

    await waitFor(() => {
      expect(control('name')).toHaveAttribute('aria-invalid', 'true')
    })

    // name (required), phone (too short), email (shape), details (required).
    expect(control('phone')).toHaveAttribute('aria-invalid', 'true')
    expect(control('email')).toHaveAttribute('aria-invalid', 'true')
    expect(control('project_details')).toHaveAttribute('aria-invalid', 'true')
    expect(control('company')).not.toHaveAttribute('aria-invalid')
    expect(screen.getAllByRole('alert')).toHaveLength(4)

    // Nothing reached the destination and no value was cleared.
    expect(insertCalls).toHaveLength(0)
    expect(control('company')).toHaveValue('Analytical Engines')
    expect(control('phone')).toHaveValue('123')
    expect(control('email')).toHaveValue('nope')

    // First invalid control in DOM order takes focus.
    expect(control('name')).toHaveFocus()

    expect(toast.error).toHaveBeenCalledWith(ENQUIRY_MESSAGES.validation)
    expect(screen.getByRole('status')).toHaveTextContent(ENQUIRY_MESSAGES.validation)
  })

  it('focuses phone when name is valid but phone is not', async () => {
    render(<EnquiryFormFields />)

    fill({ name: 'Ada', project_details: 'Details' })
    fireEvent.click(submitButton())

    await waitFor(() => {
      expect(control('phone')).toHaveAttribute('aria-invalid', 'true')
    })
    expect(control('phone')).toHaveFocus()
    expect(insertCalls).toHaveLength(0)
  })
})

describe('blur validation gating', () => {
  it('does not validate on blur before the first submit attempt, and does after', async () => {
    render(<EnquiryFormFields />)

    fireEvent.blur(control('name'))
    fireEvent.blur(control('phone'))
    expect(screen.queryAllByRole('alert')).toHaveLength(0)

    fireEvent.click(submitButton())
    await waitFor(() => {
      expect(screen.getAllByRole('alert')).toHaveLength(3)
    })

    enter('name', 'Ada Lovelace')
    fireEvent.blur(control('name'))

    await waitFor(() => {
      expect(control('name')).not.toHaveAttribute('aria-invalid')
    })
    expect(control('phone')).toHaveAttribute('aria-invalid', 'true')
    expect(control('project_details')).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('accepted submit (Requirements 7.9, 7.10, 7.11)', () => {
  it('sends exactly one row to the enquiries table', async () => {
    render(<EnquiryFormFields />)

    fill(VALID)
    fireEvent.click(submitButton())

    await waitFor(() => {
      expect(insertCalls).toHaveLength(1)
    })
    expect(insertCalls[0].table).toBe('enquiries')
    expect(insertCalls[0].rows).toEqual([
      {
        name: VALID.name,
        company: VALID.company,
        phone: VALID.phone,
        email: VALID.email,
        project_details: VALID.project_details,
        budget: VALID.budget,
        timeline: VALID.timeline,
      },
    ])
  })

  it('clears the submitted fields, shows success, and calls onSubmitted', async () => {
    const onSubmitted = vi.fn()
    render(<EnquiryFormFields onSubmitted={onSubmitted} />)

    fill(VALID)
    fireEvent.click(submitButton())

    await waitFor(() => {
      expect(onSubmitted).toHaveBeenCalledTimes(1)
    })

    Object.keys(LABELS).forEach((field) => {
      expect(control(field)).toHaveValue('')
    })
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('data-state', 'success')
    expect(status).toHaveTextContent(ENQUIRY_MESSAGES.success)
    expect(toast.success).toHaveBeenCalledWith(ENQUIRY_MESSAGES.success)
  })

  it('shows pending, disables submit, and lets only one submission through', async () => {
    // Fake timers hold the insert open, so the pending window is deterministic.
    vi.useFakeTimers()
    setInsertDelay(30)

    try {
      render(<EnquiryFormFields />)

      fill(VALID)
      const form = document.querySelector('[data-slot="enquiry-form"]')

      fireEvent.click(submitButton())

      const pendingStatus = screen.getByRole('status')
      expect(pendingStatus).toHaveAttribute('data-state', 'pending')
      expect(pendingStatus).toHaveTextContent(ENQUIRY_MESSAGES.pending)
      expect(submitButton()).toBeDisabled()
      expect(submitButton()).toHaveAttribute('aria-busy', 'true')

      // Additional activations while pending must not reach the destination.
      fireEvent.submit(form)
      fireEvent.submit(form)
      fireEvent.click(submitButton())
      expect(insertCalls).toHaveLength(1)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(50)
      })

      expect(insertCalls).toHaveLength(1)
      expect(screen.getByRole('status')).toHaveAttribute('data-state', 'success')
      expect(submitButton()).not.toBeDisabled()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('failed submit (Requirements 7.12, 11.7, 11.9)', () => {
  it('keeps every value, re-enables submit, and reports the failure once', async () => {
    setInsertError('insert rejected')
    const onSubmitted = vi.fn()
    render(<EnquiryFormFields onSubmitted={onSubmitted} />)

    fill(VALID)
    fireEvent.click(submitButton())

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveAttribute('data-state', 'error')
    })

    expect(screen.getByRole('status')).toHaveTextContent(ENQUIRY_MESSAGES.failure)
    expect(toast.error).toHaveBeenCalledWith(ENQUIRY_MESSAGES.failure)
    expect(toast.success).not.toHaveBeenCalled()
    expect(onSubmitted).not.toHaveBeenCalled()

    Object.entries(VALID).forEach(([field, value]) => {
      expect(control(field)).toHaveValue(value)
    })

    expect(submitButton()).not.toBeDisabled()
    expect(insertCalls).toHaveLength(1)
  })

  it('allows a manual retry after a failure, with no duplicate from the failed attempt', async () => {
    setInsertError('insert rejected')
    render(<EnquiryFormFields />)

    fill(VALID)
    fireEvent.click(submitButton())
    await waitFor(() => {
      expect(insertCalls).toHaveLength(1)
    })

    resetSupabaseMock()
    fireEvent.click(submitButton())

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveAttribute('data-state', 'success')
    })
    expect(insertCalls).toHaveLength(1)
  })
})
