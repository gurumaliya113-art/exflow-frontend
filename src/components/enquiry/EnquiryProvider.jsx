import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import EnquiryModal from './EnquiryModal'

/**
 * The window event every pre-redesign call site already dispatches through
 * `openEnquire()`. Keeping the name is what makes Requirement 11.1 hold: no
 * existing trigger has to change to keep working.
 */
export const ENQUIRY_OPEN_EVENT = 'open-enquire'

const EnquiryContext = createContext(null)

/**
 * Marks the events this provider emits itself, so its own inbound listener can
 * ignore them and the state is never set twice for one activation.
 */
const PROVIDER_SOURCE = 'enquiry-provider'

/** Dispatch the legacy open event. Same payload shape as `openEnquire()`. */
export function dispatchEnquiryOpenEvent(detail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(ENQUIRY_OPEN_EVENT, { detail }))
}

/**
 * The element that should receive focus again when the modal closes
 * (Requirement 7.6). `document.body` is not a meaningful restore target, so it
 * is recorded as "nothing to restore".
 */
function captureOpener() {
  if (typeof document === 'undefined') return null
  const active = document.activeElement
  if (!active || active === document.body || active === document.documentElement) {
    return null
  }
  return active
}

/**
 * Fallback used when a subtree renders outside the provider (isolated component
 * tests, storybook-style harnesses). `openEnquiry` still reaches the mounted
 * modal through the window bridge, so a CTA wired to `useEnquiry()` never
 * becomes inert (Requirement 11.1).
 */
const DETACHED_CONTEXT = {
  open: false,
  openEnquiry: dispatchEnquiryOpenEvent,
  closeEnquiry: () => {},
  openerRef: { current: null },
}

/**
 * `useEnquiry()` - the single enquiry activation surface.
 *
 * @returns {{ open: boolean, openEnquiry: () => void, closeEnquiry: () => void, openerRef: { current: Element | null } }}
 *   `openerRef` carries the element focused at open time so the modal
 *   (task 9.5) can return focus to it on close (Requirement 7.6).
 */
export function useEnquiry() {
  return useContext(EnquiryContext) ?? DETACHED_CONTEXT
}

/**
 * `EnquiryProvider` - owns the open/closed state of the Enquiry_Modal and the
 * opener that focus returns to.
 *
 * Two entry paths, one behavior (Requirement 7.1):
 * - `openEnquiry()` from `useEnquiry()`, for components inside the tree.
 * - a `window` `open-enquire` event, for every existing `openEnquire()` call
 *   site across the pages (Requirement 11.1).
 *
 * Both capture `document.activeElement` at open time, so focus restoration
 * works regardless of which path opened the modal (Requirement 7.6).
 *
 * The provider renders `EnquiryModal` itself, exactly once, so the app has one
 * mounted enquiry dialog no matter how many CTAs can open it (Requirement 7.1).
 * The outbound `legacyEventBridge` is therefore off by default: re-emitting the
 * window event now would only be observed by this provider's own listener, and
 * the modal it used to keep alive is no longer mounted. The inbound listener
 * stays, which is what keeps every existing `openEnquire()` call site working
 * unchanged (Requirement 11.1). Callers may still opt the bridge back on to
 * drive a separately mounted legacy listener.
 *
 * Requirements: 7.1, 7.6, 11.1
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {boolean} [props.legacyEventBridge=false] Re-emit `open-enquire` when
 *   `openEnquiry()` is called, for listeners outside this provider.
 */
export function EnquiryProvider({ children, legacyEventBridge = false }) {
  const [open, setOpen] = useState(false)
  const openerRef = useRef(null)

  const openEnquiry = useCallback(() => {
    openerRef.current = captureOpener()
    setOpen(true)
    if (legacyEventBridge) {
      dispatchEnquiryOpenEvent({ source: PROVIDER_SOURCE })
    }
  }, [legacyEventBridge])

  const closeEnquiry = useCallback(() => {
    setOpen(false)
  }, [])

  // Inbound bridge: every existing `openEnquire()` dispatch opens this state
  // too, with the opener captured the same way. Listener is removed on unmount.
  useEffect(() => {
    function handleOpenEvent(event) {
      // Skip the echo of our own outbound bridge dispatch: `openEnquiry()`
      // already recorded the opener and flipped the state.
      if (event?.detail?.source === PROVIDER_SOURCE) return
      openerRef.current = captureOpener()
      setOpen(true)
    }

    window.addEventListener(ENQUIRY_OPEN_EVENT, handleOpenEvent)
    return () => {
      window.removeEventListener(ENQUIRY_OPEN_EVENT, handleOpenEvent)
    }
  }, [])

  const value = useMemo(
    () => ({ open, openEnquiry, closeEnquiry, openerRef }),
    [open, openEnquiry, closeEnquiry],
  )

  return (
    <EnquiryContext.Provider value={value}>
      {children}
      <EnquiryModal />
    </EnquiryContext.Provider>
  )
}

export default EnquiryProvider
