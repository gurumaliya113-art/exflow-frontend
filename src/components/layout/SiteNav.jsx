import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { resolveActiveNav } from '../../lib/nav'

/**
 * `SiteNav` - the desktop navigation list of the shared chrome.
 *
 * The nav config arrives as a prop, so one component serves both the public
 * and the legacy chrome. Legacy destinations intentionally do not match their
 * labels; they are rendered verbatim because the baseline destinations must be
 * preserved, not corrected (Requirement 11.6).
 *
 * Every item is a real router link, so navigation interactions are link
 * controls with pointer activation, keyboard focus, and keyboard activation
 * (Requirements 2.4, 11.8).
 *
 * Active state is resolved by `resolveActiveNav` and never recomputed here.
 * That function returns exactly one identifier, so at most one item can be
 * marked. The marked item gets the current-page state exposed to assistive
 * technologies plus a persistent (not hover-only) cyan rule and brighter text;
 * unmarked items get neither (Requirement 2.3).
 *
 * Responsive gating lives in `SiteHeader`, which passes it through
 * `className` - this component makes no viewport decisions.
 *
 * Requirements: 2.1, 2.3, 2.4, 11.8
 *
 * @param {object} props
 * @param {Array<{ id: string, to: string, label: string }>} props.items Nav config in render order.
 * @param {string | null} [props.activeId] Pre-resolved active id from the header.
 *   Omit to resolve from the current location; pass `null` to mark nothing.
 * @param {string} [props.label='Primary'] Accessible name of the nav landmark.
 * @param {string} [props.className] Classes for the `nav` element (e.g. responsive gating).
 * @param {string} [props.itemClassName] Extra classes for every item.
 * @param {(item: object, event: import('react').MouseEvent) => void} [props.onItemClick]
 */

/** Shared item classes: the label type role plus the allowed transitions. */
const ITEM_BASE = [
  'relative inline-flex items-center rounded-xs',
  'px-[var(--space-2)] py-[var(--space-1)]',
  'font-semibold tracking-[0.01em] [font-size:var(--text-label)]',
  'transition-[color,background-color,border-color,box-shadow,opacity]',
].join(' ')

/** Brighter primary text for the one active destination. */
const ITEM_ACTIVE = 'text-content'

/** Secondary text at rest; brightening on hover is not an active-state cue. */
const ITEM_INACTIVE = 'text-content-muted hover:text-content'

export function SiteNav({
  items = [],
  activeId,
  label = 'Primary',
  className,
  itemClassName,
  onItemClick,
  ...rest
}) {
  const location = useLocation()
  const list = Array.isArray(items) ? items : []
  const resolved =
    activeId === undefined ? resolveActiveNav(location.pathname, list) : activeId

  return (
    <nav aria-label={label} className={cn('items-center', className)} {...rest}>
      <ul className="flex list-none items-center gap-[var(--space-1)] lg:gap-[var(--space-3)]">
        {list.map((item, index) => {
          const isActive = resolved != null && item.id === resolved

          return (
            <li key={`${item.id}-${index}`}>
              <Link
                to={item.to}
                data-nav-id={item.id}
                data-active={isActive ? 'true' : undefined}
                aria-current={isActive ? 'page' : undefined}
                onClick={onItemClick ? (event) => onItemClick(item, event) : undefined}
                className={cn(
                  ITEM_BASE,
                  isActive ? ITEM_ACTIVE : ITEM_INACTIVE,
                  itemClassName,
                )}
              >
                {item.label}
                {isActive ? (
                  <span
                    data-slot="active-underline"
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 left-[var(--space-2)] right-[var(--space-2)] h-[var(--border-2)] rounded-pill bg-tech-cyan"
                  />
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default SiteNav
