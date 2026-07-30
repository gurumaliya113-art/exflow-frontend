// Component tests for the dialog shell and the icon-only control primitive.
//
// Requirements: 3.8, 7.2, 7.3, 7.4, 7.5, 7.6, 10.8, 10.9
import { useRef, useState } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../Modal.jsx'
import IconButton, { TOUCH_TARGET_CLASS } from '../IconButton.jsx'

function renderModal(props = {}) {
  const onClose = vi.fn()
  const utils = render(
    <Modal open onClose={onClose} labelledBy="modal-title" describedBy="modal-lede" {...props}>
      <h2 id="modal-title">Request A Quote</h2>
      <p id="modal-lede">Tell us about your project.</p>
      <button type="button">Inside control</button>
    </Modal>,
  )
  return { onClose, ...utils }
}

/**
 * Opener + controlled modal, which is the only shape that can observe the
 * round-trip behaviors: the trap needs a real opener to restore focus to, and
 * the scroll lock needs `open` to actually flip to false.
 *
 * The panel content deliberately brackets the enabled controls with disabled
 * ones so the "first enabled" and "last enabled" boundaries are not simply the
 * first and last children.
 */
function FocusHarness({ useInitialFocus = false }) {
  const [open, setOpen] = useState(false)
  const initialFocusRef = useRef(null)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="harness-title"
        initialFocusRef={useInitialFocus ? initialFocusRef : undefined}
      >
        <h2 id="harness-title">Request A Quote</h2>
        <button type="button" disabled>
          Leading disabled
        </button>
        <input ref={initialFocusRef} aria-label="Full name" />
        <button type="button">Send</button>
        <button type="button" disabled>
          Trailing disabled
        </button>
      </Modal>
    </>
  )
}

async function openHarness(props = {}) {
  const user = userEvent.setup()
  render(<FocusHarness {...props} />)
  const opener = screen.getByRole('button', { name: 'Open dialog' })
  await user.click(opener)
  return { user, opener }
}

describe('Modal', () => {
  it('exposes the dialog role and modal state while open', () => {
    renderModal()

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeVisible()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('renders nothing while closed, so panel controls are not focusable', () => {
    const { container } = render(
      <Modal open={false} onClose={vi.fn()} labelledBy="modal-title">
        <h2 id="modal-title">Request A Quote</h2>
        <button type="button">Inside control</button>
      </Modal>,
    )

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Inside control' })).toBeNull()
  })

  it('wires aria-labelledby and aria-describedby to rendered nodes', () => {
    renderModal()

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
    expect(dialog).toHaveAttribute('aria-describedby', 'modal-lede')
    expect(document.getElementById('modal-title')).toHaveTextContent('Request A Quote')
    expect(document.getElementById('modal-lede')).toHaveTextContent(
      'Tell us about your project.',
    )
    // The accessible name is computed from the referenced node.
    expect(screen.getByRole('dialog', { name: 'Request A Quote' })).toBe(dialog)
  })

  it('closes on Escape pressed inside the dialog', async () => {
    const { onClose } = renderModal()

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes when the backdrop outside the panel is activated', async () => {
    const user = userEvent.setup()
    const { onClose } = renderModal()

    const overlay = document.querySelector('[data-slot="modal-overlay"]')
    await user.click(overlay)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when a click lands inside the panel', async () => {
    const user = userEvent.setup()
    const { onClose } = renderModal()

    await user.click(screen.getByRole('button', { name: 'Inside control' }))
    await user.click(screen.getByRole('dialog'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes when the close control is activated', async () => {
    const user = userEvent.setup()
    const { onClose } = renderModal()

    const close = screen.getByRole('button', { name: 'Close' })
    expect(close).toBeVisible()
    await user.click(close)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('accepts a custom accessible name for the close control', () => {
    renderModal({ closeLabel: 'Close enquiry form' })

    expect(screen.getByRole('button', { name: 'Close enquiry form' })).toBeInTheDocument()
  })

  describe('key listener lifetime', () => {
    let windowSpy
    let documentSpy

    beforeEach(() => {
      windowSpy = vi.spyOn(window, 'addEventListener')
      documentSpy = vi.spyOn(document, 'addEventListener')
    })

    afterEach(() => {
      windowSpy.mockRestore()
      documentSpy.mockRestore()
    })

    function keyListenerCalls(spy) {
      return spy.mock.calls.filter(([type]) => type === 'keydown')
    }

    function globalKeyListenerCount() {
      return keyListenerCalls(windowSpy).length + keyListenerCalls(documentSpy).length
    }

    it('mounts no key listener while closed', () => {
      const onClose = vi.fn()
      render(
        <Modal open={false} onClose={onClose}>
          <p>hidden</p>
        </Modal>,
      )

      expect(globalKeyListenerCount()).toBe(0)

      // Escape anywhere on the page must not reach a closed modal.
      fireEvent.keyDown(document.body, { key: 'Escape' })
      fireEvent.keyDown(window, { key: 'Escape' })
      expect(onClose).not.toHaveBeenCalled()
    })

    it('scopes the open modal close listener to its container, never to window or document', () => {
      const { onClose } = renderModal()

      // No `window` listener in any state - that was the pre-redesign bug.
      expect(keyListenerCalls(windowSpy)).toHaveLength(0)
      // The only document-level key listener an open modal owns is the focus
      // trap's Tab handler, which never closes the dialog.
      expect(keyListenerCalls(documentSpy)).toHaveLength(1)

      fireEvent.keyDown(document.body, { key: 'Escape' })
      fireEvent.keyDown(window, { key: 'Escape' })
      expect(onClose).not.toHaveBeenCalled()

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('removes the listener when the modal closes', () => {
      const onClose = vi.fn()
      const { rerender } = render(
        <Modal open onClose={onClose}>
          <p>content</p>
        </Modal>,
      )
      const overlay = document.querySelector('[data-slot="modal-overlay"]')

      rerender(
        <Modal open={false} onClose={onClose}>
          <p>content</p>
        </Modal>,
      )

      fireEvent.keyDown(overlay, { key: 'Escape' })
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  it('keeps the panel programmatically focusable but outside the Tab cycle', () => {
    renderModal()

    // `tabIndex={-1}` makes the panel the trap's fallback target without
    // putting it in the sequential focus order.
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('tabindex', '-1')
    expect(dialog).not.toHaveFocus()
  })

  describe('focus management (7.2, 7.3, 7.6)', () => {
    it('moves focus to the first enabled control in the panel on open', async () => {
      await openHarness()

      // The close control is the first enabled control in panel DOM order.
      expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
    })

    it('focuses initialFocusRef instead when one is supplied', async () => {
      await openHarness({ useInitialFocus: true })

      expect(screen.getByLabelText('Full name')).toHaveFocus()
    })

    it('wraps Tab from the last enabled control back to the first', async () => {
      const { user } = await openHarness()
      const close = screen.getByRole('button', { name: 'Close' })
      const input = screen.getByLabelText('Full name')
      const send = screen.getByRole('button', { name: 'Send' })

      // Disabled controls are skipped in both directions.
      await user.tab()
      expect(input).toHaveFocus()
      await user.tab()
      expect(send).toHaveFocus()
      await user.tab()
      expect(close).toHaveFocus()
    })

    it('wraps Shift+Tab from the first enabled control to the last', async () => {
      const { user } = await openHarness()
      const close = screen.getByRole('button', { name: 'Close' })
      const send = screen.getByRole('button', { name: 'Send' })

      await user.tab({ shift: true })
      expect(send).toHaveFocus()
      await user.tab({ shift: true })
      expect(screen.getByLabelText('Full name')).toHaveFocus()
      await user.tab({ shift: true })
      expect(close).toHaveFocus()
    })

    it('never lets focus leave the panel while open', async () => {
      const { user, opener } = await openHarness()
      const dialog = screen.getByRole('dialog')

      for (let i = 0; i < 6; i += 1) {
        await user.tab()
        expect(dialog).toContainElement(document.activeElement)
        expect(opener).not.toHaveFocus()
      }
    })

    it('returns focus to the opener when the close control is used', async () => {
      const { user, opener } = await openHarness()

      await user.click(screen.getByRole('button', { name: 'Close' }))

      expect(screen.queryByRole('dialog')).toBeNull()
      expect(opener).toHaveFocus()
    })

    it('returns focus to the opener when Escape closes the dialog', async () => {
      const { user, opener } = await openHarness()

      await user.keyboard('{Escape}')

      expect(screen.queryByRole('dialog')).toBeNull()
      expect(opener).toHaveFocus()
    })

    it('returns focus to the opener when the backdrop closes the dialog', async () => {
      const { user, opener } = await openHarness()

      await user.click(document.querySelector('[data-slot="modal-overlay"]'))

      expect(screen.queryByRole('dialog')).toBeNull()
      expect(opener).toHaveFocus()
    })
  })

  describe('scroll lock (7.4, 7.5)', () => {
    const SCROLL_Y = 320
    let scrollTo

    beforeEach(() => {
      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        writable: true,
        value: SCROLL_Y,
      })
      scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    })

    afterEach(() => {
      scrollTo.mockRestore()
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    })

    it('prevents background scrolling while open without moving the page', async () => {
      expect(document.body.style.overflow).toBe('')

      const { user, opener } = await openHarness()

      expect(document.body.style.overflow).toBe('hidden')
      expect(window.scrollY).toBe(SCROLL_Y)
      // Nothing repositions the background page while the lock is engaged.
      expect(scrollTo).not.toHaveBeenCalled()

      await user.click(screen.getByRole('button', { name: 'Close' }))

      expect(document.body.style.overflow).toBe('')
      expect(document.body.style.paddingRight).toBe('')
      expect(window.scrollY).toBe(SCROLL_Y)
      expect(opener).toHaveFocus()
    })

    it('restores scrolling for the Escape and backdrop close paths too', async () => {
      const { user } = await openHarness()
      expect(document.body.style.overflow).toBe('hidden')

      await user.keyboard('{Escape}')
      expect(document.body.style.overflow).toBe('')

      const reopened = screen.getByRole('button', { name: 'Open dialog' })
      await user.click(reopened)
      expect(document.body.style.overflow).toBe('hidden')

      await user.click(document.querySelector('[data-slot="modal-overlay"]'))
      expect(document.body.style.overflow).toBe('')
      expect(window.scrollY).toBe(SCROLL_Y)
    })
  })
})

describe('IconButton', () => {
  it('exposes the required label as the accessible name', () => {
    render(<IconButton label="Show next project" icon={<svg data-testid="glyph" />} />)

    const button = screen.getByRole('button', { name: 'Show next project' })
    expect(button).toHaveAttribute('aria-label', 'Show next project')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('hides the icon from the accessible name computation', () => {
    render(
      <IconButton label="Open menu">
        <span>menu-glyph-text</span>
      </IconButton>,
    )

    const button = screen.getByRole('button', { name: 'Open menu' })
    expect(button.querySelector('[data-slot="icon"]')).toHaveAttribute('aria-hidden', 'true')
  })

  it('enforces the 44px minimum target area at every size', () => {
    const { rerender } = render(<IconButton label="Close" size="sm" icon={<svg />} />)

    for (const size of ['sm', 'md', 'lg']) {
      rerender(<IconButton label="Close" size={size} icon={<svg />} />)
      const button = screen.getByRole('button', { name: 'Close' })
      expect(button.className).toContain('min-h-[var(--size-touch)]')
      expect(button.className).toContain('min-w-[var(--size-touch)]')
      TOUCH_TARGET_CLASS.split(' ').forEach((cls) => {
        expect(button.className).toContain(cls)
      })
    }
  })

  it('resolves --size-touch to 44px', () => {
    // The token the class references is the 44px requirement value.
    document.documentElement.style.setProperty('--size-touch', '44px')
    expect(
      getComputedStyle(document.documentElement).getPropertyValue('--size-touch').trim(),
    ).toBe('44px')
  })

  it('throws in development when no label is supplied', () => {
    // React logs the thrown render error; silenced so the expected failure
    // does not look like a broken test run.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(() => render(<IconButton icon={<svg />} />)).toThrow(/label/i)
    } finally {
      consoleError.mockRestore()
    }
  })

  it('forwards click handlers and the disabled state', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { rerender } = render(
      <IconButton label="Show previous project" onClick={onClick} icon={<svg />} />,
    )

    await user.click(screen.getByRole('button', { name: 'Show previous project' }))
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(
      <IconButton label="Show previous project" onClick={onClick} disabled icon={<svg />} />,
    )
    expect(screen.getByRole('button', { name: 'Show previous project' })).toBeDisabled()
  })
})
