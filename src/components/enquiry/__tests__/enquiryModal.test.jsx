/**
 * `EnquiryModal` tests for task 9.5.
 *
 * The modal is mounted once, by `EnquiryProvider`, and driven by the provider's
 * open state, so both activation paths - `openEnquiry()` and the legacy
 * `open-enquire` window event - must produce exactly one dialog
 * (Requirements 7.1, 11.1). The rest of the behavior is composed: the dialog
 * name comes from the panel's own heading (Requirement 10.9), the three close
 * affordances all route through one close action and restore focus to the opener
 * (Requirements 7.5, 7.6), the two columns carry the contact details and the
 * shared form (Requirement 7.7), and an accepted submission dismisses the dialog
 * (Requirement 7.11).
 *
 * Requirements: 7.1, 7.5, 7.6, 7.7, 7.11, 10.9, 11.1
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@/lib/supabase', () => import('@/test/mocks/supabase'))

import { insertCalls, resetSupabaseMock } from '@/test/mocks/supabase'
import { CONTACT } from '@/content/site'
import EnquiryProvider, {
  ENQUIRY_OPEN_EVENT,
  useEnquiry,
} from '../EnquiryProvider'
import { ENQUIRY_MODAL_COPY } from '../EnquiryModal'
import { AppShell } from '../../../App'

const FIELD_LABELS = [
  /^Full Name/,
  /^Company/,
  /^Phone/,
  /^Email/,
  /^Budget Range/,
  /^Timeline/,
  /^Project Details/,
]

const VALID = {
  'Full Name': 'Ada Lovelace',
  Company: 'Analytical Engines',
  Phone: '9876543210',
  Email: 'ada@example.com',
  'Budget Range': '2,00,000',
  Timeline: '3 weeks',
  'Project Details': 'A dashboard for engine telemetry.',
}

/** Trigger that opens through the context API, focusable like a real CTA. */
function Trigger() {
  const { openEnquiry } = useEnquiry()
  return (
    <button type="button" onClick={openEnquiry}>
      open enquiry
    </button>
  )
}

function renderWithProvider() {
  return render(
    <EnquiryProvider>
      <Trigger />
    </EnquiryProvider>,
  )
}

/** Focus the trigger first, so "restore focus to the opener" is observable. */
function openFromTrigger() {
  const trigger = screen.getByRole('button', { name: 'open enquiry' })
  trigger.focus()
  fireEvent.click(trigger)
  return trigger
}

function dispatchLegacyOpenEvent() {
  act(() => {
    window.dispatchEvent(new CustomEvent(ENQUIRY_OPEN_EVENT))
  })
}

function dialog() {
  return screen.getByRole('dialog')
}

function fillValidEnquiry() {
  Object.entries(VALID).forEach(([label, value]) => {
    fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), {
      target: { value },
    })
  })
}

beforeEach(() => {
  resetSupabaseMock()
})

afterEach(() => {
  resetSupabaseMock()
})

describe('mounting (Requirements 7.1, 11.1)', () => {
  it('renders nothing while closed', () => {
    renderWithProvider()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^Full Name/)).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: ENQUIRY_MODAL_COPY.closeLabel }),
    ).not.toBeInTheDocument()
  })

  it('openEnquiry() opens exactly one dialog', () => {
    renderWithProvider()
    openFromTrigger()

    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(screen.getAllByText(ENQUIRY_MODAL_COPY.formTitle)).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: 'Submit Enquiry' })).toHaveLength(1)
  })

  it('a legacy open-enquire window event opens exactly one dialog', () => {
    renderWithProvider()
    dispatchLegacyOpenEvent()

    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(screen.getAllByText(ENQUIRY_MODAL_COPY.formTitle)).toHaveLength(1)
  })
})

describe('accessible name (Requirement 10.9)', () => {
  it('names the dialog with its own visible heading', () => {
    renderWithProvider()
    openFromTrigger()

    const panel = dialog()
    expect(panel).toHaveAttribute('aria-modal', 'true')

    const labelledBy = panel.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()

    const heading = document.getElementById(labelledBy)
    expect(heading).toBeInTheDocument()
    expect(panel.contains(heading)).toBe(true)
    expect(heading).toHaveTextContent(ENQUIRY_MODAL_COPY.title)

    expect(
      screen.getByRole('dialog', { name: ENQUIRY_MODAL_COPY.title }),
    ).toBe(panel)
  })
})

describe('contact column (Requirement 7.7)', () => {
  it('renders the telephone, email, and office details', () => {
    renderWithProvider()
    openFromTrigger()

    const phone = screen.getByRole('link', { name: CONTACT.phone.label })
    expect(phone).toHaveAttribute('href', 'tel:+918053317489')

    const email = screen.getByRole('link', { name: CONTACT.email.label })
    expect(email).toHaveAttribute('href', 'mailto:business.gurutron@gmail.com')

    expect(screen.getByText('Kailash Nagar, Narnaul')).toBeInTheDocument()
  })

  it('renders the shared form with all seven fields', () => {
    renderWithProvider()
    openFromTrigger()

    FIELD_LABELS.forEach((label) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    })
    expect(dialog().querySelectorAll('[data-slot="enquiry-form"]')).toHaveLength(1)
  })
})

describe('closing (Requirements 7.5, 7.6)', () => {
  it('the close control closes and returns focus to the opener', () => {
    renderWithProvider()
    const trigger = openFromTrigger()

    fireEvent.click(
      screen.getByRole('button', { name: ENQUIRY_MODAL_COPY.closeLabel }),
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('Escape closes and returns focus to the opener', () => {
    renderWithProvider()
    const trigger = openFromTrigger()

    fireEvent.keyDown(document.activeElement ?? dialog(), { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('an activation on the backdrop outside the panel closes and returns focus', () => {
    renderWithProvider()
    const trigger = openFromTrigger()

    const overlay = document.querySelector('[data-slot="modal-overlay"]')
    fireEvent.mouseDown(overlay)
    fireEvent.click(overlay)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('an activation inside the panel keeps the dialog open', () => {
    renderWithProvider()
    openFromTrigger()

    fireEvent.mouseDown(screen.getByText(ENQUIRY_MODAL_COPY.formTitle))
    fireEvent.click(screen.getByText(ENQUIRY_MODAL_COPY.formTitle))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('accepted submission (Requirement 7.11)', () => {
  it('closes the modal after a successful submit', async () => {
    renderWithProvider()
    openFromTrigger()

    fillValidEnquiry()
    fireEvent.click(screen.getByRole('button', { name: 'Submit Enquiry' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(insertCalls).toHaveLength(1)
    expect(insertCalls[0].table).toBe('enquiries')
  })

  it('opens with empty fields again after a successful submit', async () => {
    renderWithProvider()
    openFromTrigger()

    fillValidEnquiry()
    fireEvent.click(screen.getByRole('button', { name: 'Submit Enquiry' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    openFromTrigger()
    expect(screen.getByLabelText(/^Full Name/)).toHaveValue('')
    expect(screen.getByLabelText(/^Project Details/)).toHaveValue('')
  })
})

describe('app shell (Requirement 7.1)', () => {
  it('mounts exactly one enquiry dialog, with no duplicate from the legacy modal', () => {
    render(
      <MemoryRouter initialEntries={['/blogs']}>
        <AppShell />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    dispatchLegacyOpenEvent()

    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(document.querySelectorAll('[data-slot="modal-overlay"]')).toHaveLength(1)
    expect(document.querySelectorAll('[data-slot="enquiry-modal"]')).toHaveLength(1)
    // Both the new and the superseded modal render this heading and control, so
    // a count of one proves only one enquiry dialog is mounted.
    expect(screen.getAllByText(ENQUIRY_MODAL_COPY.formTitle)).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: 'Submit Enquiry' })).toHaveLength(1)
  })
})
