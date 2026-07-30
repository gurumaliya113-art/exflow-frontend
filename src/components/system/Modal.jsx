import { useCallback, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import useFocusTrap from '@/hooks/useFocusTrap.js'
import useScrollLock from '@/hooks/useScrollLock.js'
import IconButton from './IconButton.jsx'

/**
 * `Modal` - the dialog shell every overlay in the app renders through.
 *
 * What this shell owns:
 *
 * - `role="dialog"` + `aria-modal="true"` on the panel, with `aria-labelledby`
 *   / `aria-describedby` pointing at caller-owned nodes, so the dialog state
 *   and its name reach assistive technology in the same render it becomes
 *   visible (Requirement 10.9).
 * - Three close affordances, all routed through one `onClose`: the close
 *   control, Escape, and activation of the backdrop OUTSIDE the panel
 *   (Requirement 7.5). Activation inside the panel never closes.
 * - Nothing is rendered while `open` is false: the panel and its controls are
 *   unmounted, not merely hidden, so they are neither visible nor focusable.
 * - The Escape listener is attached to the overlay node and only exists while
 *   the modal is open. The pre-redesign `EnquireModal` kept a `window` keydown
 *   listener mounted for the lifetime of the app, which closed a modal that
 *   was not open and swallowed Escape from unrelated controls. There is
 *   deliberately no global listener here.
 * - `useFocusTrap(panelRef, { active: open, initialFocusRef })` moves focus to
 *   `initialFocusRef` when supplied and otherwise to the first enabled control
 *   inside the panel, wraps Tab / Shift+Tab at the panel boundaries so focus
 *   never leaves the dialog, and returns focus to the opener when the dialog
 *   closes or unmounts (Requirements 7.2, 7.3, 7.6). The panel's own
 *   `tabIndex={-1}` keeps it programmatically focusable as the trap's fallback
 *   target without joining the Tab cycle.
 * - `useScrollLock(open)` freezes background scrolling while open and restores
 *   the previous inline styles and scroll offsets on close, so the page behind
 *   the dialog neither scrolls nor moves (Requirements 7.4, 7.5).
 *
 * Both hooks are driven by `open` alone, so every close path - the close
 * control, Escape, and the backdrop - releases the lock and restores focus
 * through the same deactivation.
 *
 * Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 10.9
 *
 * @param {object} props
 * @param {boolean} props.open Whether the dialog is rendered.
 * @param {() => void} props.onClose Called by every close affordance.
 * @param {string} [props.labelledBy] Id of the node naming the dialog.
 * @param {string} [props.describedBy] Id of the node describing the dialog.
 * @param {import('react').RefObject<HTMLElement>} [props.initialFocusRef]
 *   Control to focus on open instead of the first enabled control.
 * @param {string} [props.closeLabel='Close'] Accessible name of the close control.
 * @param {import('react').ReactNode} props.children Panel content.
 */
export function Modal({
  open,
  onClose,
  labelledBy,
  describedBy,
  initialFocusRef,
  closeLabel = 'Close',
  className,
  panelClassName,
  children,
  ...rest
}) {
  /** Overlay (backdrop) node. Owns the container-scoped Escape listener. */
  const overlayRef = useRef(null)
  /** Panel node. The focus-trap boundary. */
  const panelRef = useRef(null)
  /**
   * Whether the pointer press that produced the current click started outside
   * the panel. `null` means "no press was observed" (a synthetic click, or
   * keyboard activation of the backdrop), which is treated as outside.
   */
  const pressedOutsideRef = useRef(null)

  const requestClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  // Escape, scoped to the overlay and mounted ONLY while open.
  useEffect(() => {
    if (!open) return undefined
    const node = overlayRef.current
    if (!node) return undefined

    function handleKeyDown(event) {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      requestClose()
    }

    node.addEventListener('keydown', handleKeyDown)
    return () => node.removeEventListener('keydown', handleKeyDown)
  }, [open, requestClose])

  // Focus containment and opener restoration (7.2, 7.3, 7.6).
  useFocusTrap(panelRef, { active: open, initialFocusRef })
  // Background scroll freeze and release (7.4, 7.5).
  useScrollLock(open)

  if (!open) return null

  function handlePointerDown(event) {
    pressedOutsideRef.current = !panelRef.current?.contains(event.target)
  }

  function handleOverlayClick(event) {
    const insidePanel = panelRef.current?.contains(event.target)
    const startedOutside = pressedOutsideRef.current !== false
    pressedOutsideRef.current = null
    // Only an activation that both starts and ends outside the panel closes, so
    // a drag that begins on panel content does not dismiss the dialog.
    if (!insidePanel && startedOutside) requestClose()
  }

  return (
    <div
      ref={overlayRef}
      data-slot="modal-overlay"
      onMouseDown={handlePointerDown}
      onClick={handleOverlayClick}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto',
        'bg-canvas/80 p-[var(--space-4)] backdrop-blur-sm',
        className,
      )}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        data-slot="modal-panel"
        className={cn(
          'relative my-[var(--space-6)] w-full max-w-[var(--container-wide)]',
          'rounded-[var(--radius-md)] border-[length:var(--border-1)] border-line bg-surface',
          'text-content shadow-float',
          'focus-visible:outline-[var(--border-2)] focus-visible:outline-offset-2 focus-visible:outline-focus',
          panelClassName,
        )}
        {...rest}
      >
        <IconButton
          label={closeLabel}
          onClick={requestClose}
          tone="outline"
          size="sm"
          data-slot="modal-close"
          className="absolute right-[var(--space-3)] top-[var(--space-3)] z-10"
          icon={<X />}
        />
        {children}
      </div>
    </div>
  )
}

export default Modal
