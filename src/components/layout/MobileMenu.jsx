import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/system/IconButton'
import { FOOTER_BRAND, PUBLIC_NAV } from '@/content/site'
import { BRAND_NAV_ID, resolveActiveNav } from '@/lib/nav'
import { cn } from '@/lib/utils'

/**
 * `MobileMenu` - the single mobile navigation control and its panel.
 *
 * Structure and semantics:
 *   - Exactly ONE toggle control exists. It carries `aria-expanded` and
 *     `aria-controls` pointing at the panel's id, so assistive technologies
 *     always read the current state (Requirements 2.6, 2.11, 10.9).
 *   - While closed the panel is UNMOUNTED rather than hidden, so none of its
 *     destinations are visible or keyboard-focusable (Requirement 2.7).
 *   - While open the panel presents the brand destination for the home route,
 *     one selectable item per Public_Route, and exactly one Primary_CTA
 *     (Requirement 2.6).
 *   - The toggle is an `IconButton`, which guarantees the 44px minimum target
 *     area and an accessible name (Requirements 3.8, 10.8).
 *
 * Focus and reversibility:
 *   - Opening moves focus to the first item in the panel (the brand/home
 *     destination, which is also the first item in reading order).
 *   - Toggling while open, or pressing Escape inside the panel, closes it
 *     WITHOUT changing the route and returns focus to the toggle
 *     (Requirement 2.11).
 *   - A `location.pathname` change closes the panel and deliberately does NOT
 *     pull focus back to the toggle, so navigation is not interrupted
 *     (Requirement 2.7).
 *
 * The wrapper is hidden from `md` up because `SiteHeader` owns the desktop
 * navigation at those widths (Requirement 2.10).
 *
 * Requirements: 2.5, 2.6, 2.7, 2.11, 3.8, 10.9
 *
 * @param {object} props
 * @param {Array<{ id: string, to: string, label: string }>} [props.nav] Nav config in render order.
 * @param {{ label: string, to?: string, onSelect?: () => void }} [props.cta] The one Primary_CTA.
 * @param {{ label: string, to?: string }} [props.brand] Brand destination for the home route.
 * @param {string} [props.openLabel] Accessible name while the panel is closed.
 * @param {string} [props.closeLabel] Accessible name while the panel is open.
 */
export function MobileMenu({
  nav = PUBLIC_NAV,
  cta = { label: FOOTER_BRAND.ctaLabel },
  brand = { label: 'Home', to: '/' },
  openLabel = 'Open navigation menu',
  closeLabel = 'Close navigation menu',
  className,
  ...rest
}) {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const generatedId = useId()
  const panelId = `mobile-menu-panel-${generatedId}`

  const toggleRef = useRef(null)
  const firstItemRef = useRef(null)
  // Tracks whether the panel was open on the previous commit, so the close
  // effect only runs for real open -> closed transitions (not on mount).
  const wasOpenRef = useRef(false)
  // Cleared for closes that must not steal focus back (route change, selection).
  const restoreFocusRef = useRef(true)
  const pathnameRef = useRef(location.pathname)

  const activeId = resolveActiveNav(location.pathname, nav)

  /** Close without moving focus - used by route changes and selections. */
  const closeQuietly = useCallback(() => {
    restoreFocusRef.current = false
    setOpen(false)
  }, [])

  // Route change closes the panel (Requirement 2.7).
  useEffect(() => {
    if (pathnameRef.current === location.pathname) return
    pathnameRef.current = location.pathname
    closeQuietly()
  }, [location.pathname, closeQuietly])

  // Focus lands on the first panel item on open and returns to the toggle when
  // the panel is dismissed by the toggle or Escape.
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      firstItemRef.current?.focus()
      return
    }
    if (!wasOpenRef.current) return
    wasOpenRef.current = false
    if (restoreFocusRef.current) toggleRef.current?.focus()
    restoreFocusRef.current = true
  }, [open])

  const handleToggle = useCallback(() => {
    restoreFocusRef.current = true
    setOpen((previous) => !previous)
  }, [])

  // Scoped to the panel: no globally mounted key listener.
  const handlePanelKeyDown = useCallback((event) => {
    if (event.key !== 'Escape') return
    event.stopPropagation()
    restoreFocusRef.current = true
    setOpen(false)
  }, [])

  const handleCtaSelect = useCallback(() => {
    closeQuietly()
    cta?.onSelect?.()
  }, [closeQuietly, cta])

  const itemClass = cn(
    'flex min-h-[var(--size-touch)] items-center whitespace-nowrap rounded-[var(--radius-sm)]',
    'px-[var(--space-3)] [font-size:var(--text-label)] font-semibold text-content',
    'transition-[color,background-color] duration-[var(--duration-fast)] ease-[var(--ease-out)]',
    'hover:bg-surface-high',
    'focus-visible:outline-[var(--border-2)] focus-visible:outline-offset-2 focus-visible:outline-focus',
  )
  // Active destinations get a persistent underline in addition to the color
  // change, so the current page is not signalled by color alone.
  const activeItemClass = 'text-tech-cyan underline decoration-2 underline-offset-4'

  return (
    <div className={cn('relative md:hidden', className)} data-slot="mobile-menu" {...rest}>
      <IconButton
        ref={toggleRef}
        tone="outline"
        label={open ? closeLabel : openLabel}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={handleToggle}
        data-slot="mobile-menu-toggle"
        icon={open ? <X /> : <Menu />}
      />

      {/* The panel is anchored to the toggle's right edge and given a width that
          is capped to the viewport (with a margin on both sides), so it never
          overflows or clips its labels down to the narrowest supported width
          (Requirements 2.6, 3.6). */}
      {open ? (
        <div
          id={panelId}
          data-slot="mobile-menu-panel"
          onKeyDown={handlePanelKeyDown}
          className={cn(
            'absolute right-0 top-full z-40 mt-[var(--space-2)]',
            'w-[min(18rem,calc(100vw-var(--space-8)))]',
            'flex flex-col gap-[var(--space-1)]',
            'rounded-[var(--radius-md)] border-[length:var(--border-1)] border-line',
            'bg-surface p-[var(--space-4)] shadow-float',
          )}
        >
          {/* Brand destination for `/` stays selectable while the menu is open. */}
          <Link
            ref={firstItemRef}
            to={brand?.to ?? '/'}
            data-slot="mobile-menu-brand"
            aria-current={activeId === BRAND_NAV_ID ? 'page' : undefined}
            onClick={closeQuietly}
            className={cn(itemClass, activeId === BRAND_NAV_ID && activeItemClass)}
          >
            {brand?.label ?? 'Home'}
          </Link>

          <ul className="flex flex-col gap-[var(--space-1)]" data-slot="mobile-menu-items">
            {nav.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.to}
                  aria-current={activeId === item.id ? 'page' : undefined}
                  onClick={closeQuietly}
                  className={cn(itemClass, activeId === item.id && activeItemClass)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Exactly one Primary_CTA; `brand` is the only variant that paints
              the conversion accent. */}
          {cta?.to ? (
            <Button asChild variant="brand" size="md" className="mt-[var(--space-2)] w-full">
              <Link to={cta.to} onClick={closeQuietly}>
                {cta.label}
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              variant="brand"
              size="md"
              className="mt-[var(--space-2)] w-full"
              onClick={handleCtaSelect}
            >
              {cta?.label ?? FOOTER_BRAND.ctaLabel}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default MobileMenu
