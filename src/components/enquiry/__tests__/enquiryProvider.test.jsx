/**
 * EnquiryProvider tests for task 9.3.
 *
 * The provider owns two things: the open/closed state of the Enquiry_Modal
 * (Requirement 7.1) and the element focus returns to on close (Requirement 7.6).
 * Both must behave identically whether the open came from `useEnquiry()` or from
 * the legacy `open-enquire` window event that every pre-redesign call site still
 * dispatches (Requirement 11.1).
 */
import { describe, expect, it, vi } from 'vitest'
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { Toaster } from 'react-hot-toast'

vi.mock('@/lib/supabase', () => import('@/test/mocks/supabase'))

import EnquiryProvider, {
  ENQUIRY_OPEN_EVENT,
  useEnquiry,
} from '../EnquiryProvider'
import EnquiryModal from '../EnquiryModal'
import { AppShell, AppRoutes } from '../../../App'

let latest = null

/** Publishes the live context value so assertions can read it directly. */
function Probe() {
  latest = useEnquiry()
  return (
    <>
      <button type="button" onClick={latest.openEnquiry}>
        open from context
      </button>
      <button type="button" onClick={latest.closeEnquiry}>
        close from context
      </button>
      <span data-testid="open-state">{String(latest.open)}</span>
    </>
  )
}

function renderProvider(props) {
  latest = null
  return render(
    <EnquiryProvider {...props}>
      <Probe />
    </EnquiryProvider>,
  )
}

function dispatchOpenEvent() {
  act(() => {
    window.dispatchEvent(new CustomEvent(ENQUIRY_OPEN_EVENT))
  })
}

describe('useEnquiry', () => {
  it('exposes open, openEnquiry, and closeEnquiry', () => {
    renderProvider()

    expect(latest).not.toBeNull()
    expect(latest.open).toBe(false)
    expect(typeof latest.openEnquiry).toBe('function')
    expect(typeof latest.closeEnquiry).toBe('function')
  })
})

describe('open state', () => {
  it('openEnquiry() opens and closeEnquiry() closes', () => {
    renderProvider()

    fireEvent.click(screen.getByRole('button', { name: 'open from context' }))
    expect(screen.getByTestId('open-state')).toHaveTextContent('true')

    fireEvent.click(screen.getByRole('button', { name: 'close from context' }))
    expect(screen.getByTestId('open-state')).toHaveTextContent('false')
  })

  it('a window open-enquire event opens too, so existing call sites keep working', () => {
    renderProvider()

    dispatchOpenEvent()
    expect(screen.getByTestId('open-state')).toHaveTextContent('true')

    act(() => {
      latest.closeEnquiry()
    })
    expect(screen.getByTestId('open-state')).toHaveTextContent('false')
  })
})

describe('opener capture (Requirement 7.6)', () => {
  it('records the focused element when opened through the context API', () => {
    renderProvider()

    const trigger = screen.getByRole('button', { name: 'open from context' })
    trigger.focus()
    expect(document.activeElement).toBe(trigger)

    fireEvent.click(trigger)

    expect(latest.openerRef.current).toBe(trigger)
  })

  it('records the focused element when opened through the window event', () => {
    renderProvider()

    const outsideTrigger = document.createElement('button')
    outsideTrigger.textContent = 'legacy cta'
    document.body.appendChild(outsideTrigger)
    outsideTrigger.focus()
    expect(document.activeElement).toBe(outsideTrigger)

    dispatchOpenEvent()

    expect(latest.openerRef.current).toBe(outsideTrigger)
    outsideTrigger.remove()
  })
})

describe('listener lifecycle', () => {
  it('removes the open-enquire listener on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderProvider()

    const added = addSpy.mock.calls.filter(([type]) => type === ENQUIRY_OPEN_EVENT)
    expect(added).toHaveLength(1)

    unmount()

    const removed = removeSpy.mock.calls.filter(([type]) => type === ENQUIRY_OPEN_EVENT)
    expect(removed).toHaveLength(1)
    expect(removed[0][1]).toBe(added[0][1])

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('ignores open events dispatched after unmount', () => {
    const { unmount } = renderProvider()
    unmount()

    expect(() => {
      window.dispatchEvent(new CustomEvent(ENQUIRY_OPEN_EVENT))
    }).not.toThrow()
  })
})

describe('App shell wiring', () => {
  it('keeps the toaster and the routes inside the provider, and drops the superseded modal', () => {
    const tree = AppShell()

    expect(tree.type).toBe(EnquiryProvider)

    const children = React.Children.toArray(tree.props.children)
    const types = children.map((child) => child.type)

    expect(types).toContain(Toaster)
    expect(types).toContain(AppRoutes)
    // The provider renders the one Enquiry_Modal itself (task 9.5), so the shell
    // mounts no modal beside the routes: one activation, one dialog.
    expect(types).not.toContain(EnquiryModal)
  })

  it('mounts exactly one dialog from the provider when the state opens', () => {
    renderProvider()

    act(() => {
      latest.openEnquiry()
    })

    expect(screen.getAllByRole('dialog')).toHaveLength(1)
  })
})
