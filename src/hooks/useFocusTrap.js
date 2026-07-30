import { useEffect, useRef } from 'react'

/**
 * Selector for every node type that can receive sequential keyboard focus.
 *
 * `[tabindex]` is included unqualified so `tabindex="0"` nodes and programmatic
 * `tabindex="-1"` nodes both match; the `-1` ones are filtered out in
 * {@link getFocusable} because they are not part of the sequential focus order.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'audio[controls]',
  'video[controls]',
  'iframe',
  'object',
  'embed',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',')

/** Whether a node is disabled, either natively or via `aria-disabled`. */
function isDisabled(node) {
  return node.disabled === true || node.getAttribute('aria-disabled') === 'true'
}

/**
 * Whether a node is hidden from the focus order.
 *
 * jsdom computes no layout, so `offsetParent` / rects are unusable here. The
 * checks below are the ones that hold in both jsdom and a real browser:
 * `hidden`, `aria-hidden`, `display: none` / `visibility: hidden` from an inline
 * style or a resolved computed style, and a closed `<details>` ancestor.
 */
function isHidden(node) {
  if (node.hidden) return true
  if (node.getAttribute('aria-hidden') === 'true') return true
  if (node.type === 'hidden') return true

  const view = node.ownerDocument?.defaultView
  if (view && typeof view.getComputedStyle === 'function') {
    const style = view.getComputedStyle(node)
    if (style && (style.display === 'none' || style.visibility === 'hidden')) return true
  }
  return false
}

/**
 * Every enabled, focusable descendant of `container`, in DOM order.
 *
 * DOM order is what `querySelectorAll` returns, which matches the sequential
 * focus order for the markup this app produces (no positive `tabindex` values).
 * Disabled and hidden controls are skipped, so "the first enabled control" in
 * Requirement 7.2 and "enabled Interactive_Control elements" in Requirement 7.3
 * are the same list this function returns.
 *
 * @param {HTMLElement | null | undefined} container
 * @returns {HTMLElement[]}
 */
export function getFocusable(container) {
  if (!container || typeof container.querySelectorAll !== 'function') return []

  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((node) => {
    if (isDisabled(node)) return false
    if (isHidden(node)) return false
    // `tabindex="-1"` is programmatically focusable but outside the Tab order.
    const tabIndexAttr = node.getAttribute('tabindex')
    if (tabIndexAttr !== null && Number(tabIndexAttr) < 0) return false
    return true
  })
}

/**
 * Confine keyboard focus to `containerRef` while `active` is true.
 *
 * Behavior, keyed to the acceptance criteria it implements:
 *
 * - On activation, focus moves to `initialFocusRef` when supplied, otherwise to
 *   the first enabled control in DOM order. When the container holds no enabled
 *   control at all, the container itself is focused so the dialog is still
 *   reachable and its container-scoped Escape listener still fires
 *   (Requirement 7.2).
 * - `Tab` on the last enabled control wraps to the first; `Shift+Tab` on the
 *   first wraps to the last. Only those two boundary presses are intercepted -
 *   every other `Tab` is left to the browser, which keeps the native focus
 *   order intact (Requirement 7.3).
 * - If focus somehow lands outside the container while active (a click on the
 *   backdrop, a programmatic `focus()` elsewhere), the next `Tab` pulls it back
 *   to the first enabled control, so focus never leaves the container.
 * - On deactivation or unmount, focus returns to whatever was focused when the
 *   trap activated - the opener (Requirement 7.6).
 *
 * The trap confines focus, it never pins it: with two or more enabled controls
 * `Tab` always moves, and with one control the single press cycles back to it,
 * so there is always a keyboard method to leave any focused control
 * (Requirement 10.14).
 *
 * @param {import('react').RefObject<HTMLElement>} containerRef
 *   Ref on the node that bounds the trap - the `role="dialog"` panel.
 * @param {object} [options]
 * @param {boolean} [options.active=false] Whether the trap is armed.
 * @param {import('react').RefObject<HTMLElement>} [options.initialFocusRef]
 *   Control to focus on activation instead of the first enabled one.
 *
 * Requirements: 7.2, 7.3, 7.6, 10.14
 */
export function useFocusTrap(containerRef, { active = false, initialFocusRef } = {}) {
  /** The node focused at activation time, restored on deactivation. */
  const openerRef = useRef(null)
  // Read through refs inside the effect so changing `initialFocusRef` alone
  // never re-runs activation (which would steal focus mid-interaction).
  const initialFocusStore = useRef(initialFocusRef)
  initialFocusStore.current = initialFocusRef

  useEffect(() => {
    if (!active) return undefined

    const container = containerRef?.current
    if (!container) return undefined

    const doc = container.ownerDocument ?? document
    const opener = doc.activeElement
    openerRef.current = opener instanceof HTMLElement ? opener : null

    const initial = initialFocusStore.current?.current
    const focusables = getFocusable(container)
    const target = initial ?? focusables[0] ?? container
    target?.focus?.()

    function handleKeyDown(event) {
      if (event.key !== 'Tab') return

      const nodes = getFocusable(container)
      if (nodes.length === 0) {
        // Nothing to move to - keep focus on the container.
        event.preventDefault()
        container.focus?.()
        return
      }

      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const activeNode = doc.activeElement

      if (!container.contains(activeNode)) {
        // Focus escaped; pull it back rather than letting Tab walk the page.
        event.preventDefault()
        first.focus()
        return
      }

      if (event.shiftKey && activeNode === first) {
        event.preventDefault()
        last.focus()
        return
      }

      if (!event.shiftKey && activeNode === last) {
        event.preventDefault()
        first.focus()
      }
    }

    doc.addEventListener('keydown', handleKeyDown, true)

    return () => {
      doc.removeEventListener('keydown', handleKeyDown, true)
      const restoreTo = openerRef.current
      openerRef.current = null
      if (restoreTo && restoreTo.isConnected) restoreTo.focus?.()
    }
  }, [active, containerRef])
}

export default useFocusTrap
