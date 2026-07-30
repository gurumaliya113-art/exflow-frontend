import { Link, useLocation } from 'react-router-dom'
import { GiOwl } from 'react-icons/gi'
import { cn } from '../../lib/utils'
import { BRAND_NAV_ID, resolveActiveNav } from '../../lib/nav'

/**
 * `BrandMark` - the EXFLOW brand control in the shared chrome.
 *
 * It is always a real link to `/` (Requirements 2.2, 11.8) and always carries
 * both parts of the brand: the owl mark carried forward from the pre-redesign
 * headers and the EXFLOW name, kept in its baseline lowercase spelling so the
 * content baseline is unchanged (Requirement 2.1).
 *
 * The brand control owns the home route, so it is the destination that
 * `resolveActiveNav` reports as active for `/`. Active state is never computed
 * here: either the parent passes `active` (the header already resolved it) or
 * this component asks `resolveActiveNav` with the current pathname. That keeps
 * the header's single-active-destination guarantee intact (Requirement 2.3).
 *
 * Because the wordmark does not identify a conversion action, it is painted
 * with the primary text role rather than the reserved brand accent; the owl
 * mark carries the cyan tech accent instead (Requirement 1.3).
 *
 * Requirements: 2.1, 2.2, 2.3, 11.8
 *
 * @param {object} props
 * @param {boolean} [props.active] Whether the brand control is the active
 *   destination. Omit to resolve from the current location.
 * @param {string} [props.className] Extra classes for the link.
 * @param {(event: import('react').MouseEvent) => void} [props.onClick]
 * @param {string} [props.name='exflow'] The rendered EXFLOW name.
 */

/** The baseline EXFLOW wordmark spelling. */
export const BRAND_NAME = 'exflow'

/** Destination the brand control always points at. */
export const BRAND_TO = '/'

export function BrandMark({
  active,
  className,
  onClick,
  name = BRAND_NAME,
  ...rest
}) {
  const location = useLocation()
  const isActive =
    typeof active === 'boolean'
      ? active
      : resolveActiveNav(location.pathname, []) === BRAND_NAV_ID

  return (
    <Link
      to={BRAND_TO}
      onClick={onClick}
      data-nav-id={BRAND_NAV_ID}
      data-active={isActive ? 'true' : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative inline-flex items-center gap-[var(--space-2)] rounded-xs',
        'font-extrabold tracking-[-0.01em] text-content',
        '[font-size:var(--text-heading)]',
        'transition-[color,opacity]',
        'hover:text-tech-cyan',
        className,
      )}
      {...rest}
    >
      <GiOwl
        aria-hidden="true"
        focusable="false"
        className={cn(
          'size-[var(--size-icon-lg)] shrink-0 text-tech-cyan',
          'transition-[color]',
          'group-hover:text-content',
        )}
      />
      <span data-slot="brand-name">{name}</span>
      {isActive ? (
        // Persistent (not hover-only) cyan rule marking the active destination.
        <span
          data-slot="active-underline"
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[var(--space-1)] left-0 h-[var(--border-2)] w-full rounded-pill bg-tech-cyan"
        />
      ) : null}
    </Link>
  )
}

export default BrandMark
