import { Outlet } from 'react-router-dom'

import SkipLink, { MAIN_CONTENT_ID } from '../system/SkipLink'
import { cn } from '../../lib/utils'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

/**
 * `LegacyLayout` - the shell every Legacy_Route renders inside.
 *
 * Same order as the public shell so both share one structure: the skip control,
 * the legacy Shared_Chrome header, the `main` landmark, then the compact footer
 * (Requirements 5.6, 8.1). The header uses the legacy nav config, whose
 * destinations are reproduced verbatim from the pre-redesign navbar.
 *
 * No floating conversion action here: the legacy routes do not present one
 * today, and adding one would introduce a new user-observable interaction that
 * Requirement 11.1 forbids. With nothing fixed over the content there is also
 * no overlap to compensate for.
 *
 * Skip control (Requirement 10.13): `SkipLink` is the first node in the tree and
 * targets the id this layout puts on `main`.
 *
 * Requirements: 1.1, 2.1, 5.6, 8.1, 10.13, 11.1
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.children] Route content; falls back to `Outlet`.
 * @param {() => void} [props.onEnquire] Opens the enquiry workflow.
 * @param {Array<{ id: string, to: string, label: string }>} [props.nav] Nav override.
 * @param {{ label?: string, to?: string }} [props.cta] Header CTA override.
 * @param {string} [props.className] Extra classes for the shell element.
 * @param {string} [props.mainClassName] Extra classes for the `main` landmark.
 */
export function LegacyLayout({
  children,
  onEnquire,
  nav,
  cta,
  className,
  mainClassName,
  ...rest
}) {
  return (
    <div
      data-slot="legacy-layout"
      className={cn('flex min-h-screen flex-col bg-canvas text-content', className)}
      {...rest}
    >
      <SkipLink />

      <SiteHeader variant="legacy" nav={nav} cta={cta} onCtaActivate={onEnquire} />

      <main id={MAIN_CONTENT_ID} className={cn('flex-1', mainClassName)}>
        {children ?? <Outlet />}
      </main>

      <SiteFooter variant="compact" />
    </div>
  )
}

export default LegacyLayout
