import { useRef, useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFocusTrap, getFocusable } from '../useFocusTrap'

/**
 * Harness that mirrors how `Modal` will consume the hook at task 9.2: a ref on
 * the dialog panel, an opener button outside it, and an optional
 * `initialFocusRef`.
 */
function TrapHarness({ active, useInitialFocus = false, disableFirst = true }) {
  const panelRef = useRef(null)
  const initialFocusRef = useRef(null)

  return (
    <div>
      <button type="button">opener</button>
      <Panel
        panelRef={panelRef}
        initialFocusRef={initialFocusRef}
        active={active}
        useInitialFocus={useInitialFocus}
        disableFirst={disableFirst}
      />
      <button type="button">outside-after</button>
    </div>
  )
}

function Panel({ panelRef, initialFocusRef, active, useInitialFocus, disableFirst }) {
  useFocusTrap(panelRef, {
    active,
    initialFocusRef: useInitialFocus ? initialFocusRef : undefined,
  })

  return (
    <div ref={panelRef} role="dialog" aria-label="dialog" tabIndex={-1}>
      <button type="button" disabled={disableFirst}>
        disabled-first
      </button>
      <button type="button">first</button>
      <input aria-label="middle" ref={useInitialFocus ? initialFocusRef : undefined} />
      <button type="button">last</button>
    </div>
  )
}

describe('getFocusable', () => {
  it('returns enabled focusables in DOM order and skips disabled and hidden ones', () => {
    const { container } = render(
      <div>
        <button type="button">one</button>
        <button type="button" disabled>
          skipped-disabled
        </button>
        <input aria-label="two" />
        <button type="button" aria-disabled="true">
          skipped-aria-disabled
        </button>
        <button type="button" hidden>
          skipped-hidden
        </button>
        <span tabIndex={-1}>skipped-negative-tabindex</span>
        <a href="/three">three</a>
      </div>,
    )

    expect(getFocusable(container).map((node) => node.textContent || node.ariaLabel)).toEqual([
      'one',
      'two',
      'three',
    ])
  })

  it('returns an empty list for a missing container', () => {
    expect(getFocusable(null)).toEqual([])
  })
})

describe('useFocusTrap', () => {
  it('focuses the first enabled control on activation, skipping a disabled one', () => {
    render(<TrapHarness active />)
    expect(screen.getByRole('button', { name: 'disabled-first' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus()
  })

  it('honors initialFocusRef when supplied', () => {
    render(<TrapHarness active useInitialFocus />)
    expect(screen.getByRole('textbox', { name: 'middle' })).toHaveFocus()
  })

  it('wraps Tab forward from the last control to the first', async () => {
    const user = userEvent.setup()
    render(<TrapHarness active />)

    const first = screen.getByRole('button', { name: 'first' })
    const middle = screen.getByRole('textbox', { name: 'middle' })
    const last = screen.getByRole('button', { name: 'last' })

    expect(first).toHaveFocus()
    await user.tab()
    expect(middle).toHaveFocus()
    await user.tab()
    expect(last).toHaveFocus()
    // Boundary: the next Tab must return to the first, not leave the panel.
    await user.tab()
    expect(first).toHaveFocus()
  })

  it('wraps Shift+Tab backward from the first control to the last', async () => {
    const user = userEvent.setup()
    render(<TrapHarness active />)

    const first = screen.getByRole('button', { name: 'first' })
    const last = screen.getByRole('button', { name: 'last' })

    expect(first).toHaveFocus()
    await user.tab({ shift: true })
    expect(last).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByRole('textbox', { name: 'middle' })).toHaveFocus()
  })

  it('keeps focus inside the container across a full Tab cycle', async () => {
    const user = userEvent.setup()
    render(<TrapHarness active />)
    const panel = screen.getByRole('dialog')

    for (let i = 0; i < 8; i += 1) {
      await user.tab()
      expect(panel.contains(document.activeElement)).toBe(true)
    }
  })

  it('restores focus to the opener on deactivation', async () => {
    const user = userEvent.setup()

    function Host() {
      const [active, setActive] = useState(false)
      return (
        <div>
          <button type="button" onClick={() => setActive(true)}>
            open
          </button>
          {active ? <TrapPanel /> : null}
          <button type="button" onClick={() => setActive(false)}>
            deactivate
          </button>
        </div>
      )
    }

    function TrapPanel() {
      const panelRef = useRef(null)
      useFocusTrap(panelRef, { active: true })
      return (
        <div ref={panelRef} role="dialog" aria-label="dialog" tabIndex={-1}>
          <button type="button">inside</button>
        </div>
      )
    }

    render(<Host />)
    const opener = screen.getByRole('button', { name: 'open' })
    await user.click(opener)
    expect(screen.getByRole('button', { name: 'inside' })).toHaveFocus()

    // Deactivating from a control outside the panel must still hand focus back
    // to the opener, not leave it on whatever triggered the close.
    await user.click(screen.getByRole('button', { name: 'deactivate' }))
    expect(opener).toHaveFocus()
  })

  it('registers no key listener while inactive and moves no focus', () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    render(<TrapHarness active={false} />)

    const keydownCalls = addSpy.mock.calls.filter(([type]) => type === 'keydown')
    expect(keydownCalls).toHaveLength(0)
    expect(document.body).toHaveFocus()
    addSpy.mockRestore()
  })

  it('removes its key listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const { unmount } = render(<TrapHarness active />)
    unmount()

    const keydownCalls = removeSpy.mock.calls.filter(([type]) => type === 'keydown')
    expect(keydownCalls.length).toBeGreaterThanOrEqual(1)
    removeSpy.mockRestore()
  })
})
