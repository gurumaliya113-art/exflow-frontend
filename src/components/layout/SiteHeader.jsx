import { useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'

import Container from '../system/Container'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { BRAND_NAV_ID, resolveActiveNav } from '../../lib/nav'
import { FOOTER_BRAND, LEGACY_NAV, PUBLIC_NAV } from '../../content/site'
import BrandMark from './BrandMark'
import SiteNav from './SiteNav'
import MobileMenu from './MobileMenu'

/**
 * `SiteHeader` - the one header for every route, in two variants.
 *
 * Composition: brand control, desktop navigation list, desktop Primary_CTA,
 * and the single mobile menu control. `variant` selects which nav config
 * drives it - the public set of six Public_Routes, or the legacy set whose
 * labels deliberately do not match their destinations. The legacy destinations
 * are reproduced verbatim from the pre-redesign navbar, not corrected
 * (Requirements 2.1, 11.6).
 *
 * Active destination (Requirement 2.3): the header calls `resolveActiveNav`
 * ONCE per render and hands the result down - as `activeId` to the nav list and
 * as `active` to the brand control. Neither child recomputes it, and the
 * resolver returns a single identifier, so exactly one destination can ever be
 * marked as the current page.
 *
 * Viewport split (Requirements 2.5, 2.10): the desktop nav and the desktop CTA
 * are hidden below the `md` breakpoint (768px, the exact requirement boundary)
 * and shown from it up; `MobileMenu` gates itself the other way, so below `md`
 * there is exactly one mobile menu control and no desktop chrome, and from `md`
 * up the reverse.
 *
 * Horizontal padding comes only from `Container`, the single source of page
 * gutters (Requirement 3.4).
 *
 * CTA activation (Requirement 7.1): `onCtaActivate` (or `cta.onSelect`) wins if
 * supplied; otherwise the header dispatches the existing enquiry window event
 * the current pages already listen for. Once the enquiry provider lands, a
 * layout can pass its opener through `onCtaActivate` with no change here.
 *
 * Legacy hash destination: the legacy "Our Work" item points at the home page
 * anchor. As in the pre-redesign navbar, selecting it while already on `/`
 * scrolls to that anchor instead of re-navigating.
 *
 * Requirements: 2.1, 2.3, 2.5, 2.10, 3.4, 7.1, 11.6
 *
 * @param {object} props
 * @param {'public'|'legacy'} [props.variant='public'] Which chrome to render.
 * @param {Array<{ id: string, to: string, label: string, hashScroll?: string }>} [props.nav]
 *   Nav config override; defaults to the variant's config.
 * @param {{ label?: string, to?: string, onSelect?: () => void, action?: () => void }} [props.cta]
 *   The one Primary_CTA.
 * @param {() => void} [props.onCtaActivate] Activation override for the CTA.
 * @param {string} [props.navLabel='Primary'] Accessible name of the nav landmark.
 * @param {string} [props.className] Extra classes for the header element.
 */

/** Header variants. */
export const HEADER_VARIANTS = ['public', 'legacy']

const DEFAULT_VARIANT = 'public'

/** Nav config backing each variant. */
export const NAV_BY_VARIANT = {
  public: PUBLIC_NAV,
  legacy: LEGACY_NAV,
}

/** The window event the existing pages use to open the Enquiry_Modal. */
export const ENQUIRY_EVENT = 'open-enquire'

/** Gating for the desktop nav list: absent below the md breakpoint. */
export const DESKTOP_NAV_CLASS = 'hidden md:flex'

/** Gating for the desktop Primary_CTA: absent below the md breakpoint. */
export const DESKTOP_CTA_CLASS = 'hidden md:inline-flex'

/** Default activation: the existing enquiry bridge. */
function dispatchEnquiry() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(ENQUIRY_EVENT))
}

export function SiteHeader({
  variant = DEFAULT_VARIANT,
  nav,
  cta,
  onCtaActivate,
  navLabel = 'Primary',
  className,
  ...rest
}) {
  const location = useLocation()

  const name = HEADER_VARIANTS.includes(variant) ? variant : DEFAULT_VARIANT
  const items = Array.isArray(nav) ? nav : NAV_BY_VARIANT[name]
  const ctaLabel = cta?.label ?? FOOTER_BRAND.ctaLabel
  const ctaTo = cta?.to
  const ctaHandler = onCtaActivate ?? cta?.onSelect ?? cta?.action

  // One resolution per render, passed to both the brand and the nav list.
  const activeId = resolveActiveNav(location.pathname, items)

  const activateCta = useCallback(() => {
    if (typeof ctaHandler === 'function') {
      ctaHandler()
      return
    }
    dispatchEnquiry()
  }, [ctaHandler])

  // Same-page anchor behavior carried forward from the legacy navbar.
  const handleNavItemClick = useCallback(
    (item, event) => {
      if (!item?.hashScroll) return
      if (location.pathname !== '/') return
      event.preventDefault()
      document
        .getElementById(item.hashScroll)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    [location.pathname],
  )

  return (
    <header
      data-slot="site-header"
      data-variant={name}
      className={cn(
        'sticky top-0 z-40 w-full',
        'border-b-[length:var(--border-1)] border-line',
        'bg-canvas/95 backdrop-blur-sm',
        className,
      )}
      {...rest}
    >
      <Container
        className={cn(
          'flex items-center justify-between gap-[var(--space-4)]',
          'min-h-[var(--size-touch)] py-[var(--space-3)] md:py-[var(--space-4)]',
        )}
      >
        <BrandMark active={activeId === BRAND_NAV_ID} />

        {/* Desktop navigation: present from the md breakpoint up only. */}
        <SiteNav
          items={items}
          activeId={activeId}
          label={navLabel}
          className={DESKTOP_NAV_CLASS}
          onItemClick={handleNavItemClick}
          data-slot="site-header-nav"
        />

        {/* Exactly one desktop Primary_CTA, also gated to md and up. */}
        {ctaTo ? (
          <Button
            asChild
            variant="brand"
            size="md"
            className={DESKTOP_CTA_CLASS}
            data-slot="site-header-cta"
          >
            <Link to={ctaTo}>{ctaLabel}</Link>
          </Button>
        ) : (
          <Button
            type="button"
            variant="brand"
            size="md"
            className={DESKTOP_CTA_CLASS}
            onClick={activateCta}
            data-slot="site-header-cta"
          >
            {ctaLabel}
          </Button>
        )}

        {/* The single mobile control; it hides itself from md up. */}
        <MobileMenu
          nav={items}
          cta={{ label: ctaLabel, to: ctaTo, onSelect: activateCta }}
        />
      </Container>
    </header>
  )
}

export default SiteHeader
