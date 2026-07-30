import { Outlet } from 'react-router-dom'

import SkipLink, { MAIN_CONTENT_ID } from '../system/SkipLink'
import { cn } from '../../lib/utils'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import FloatingCta, { useFloatingCtaInset } from './FloatingCta'

/**
 * `PublicLayout` - the single shell every Public_Route renders inside.
 *
 * Order is fixed and identical for every public route (Requirements 5.6, 8.1):
 * the skip control, the public Shared_Chrome header, the `main` landmark, the
 * full footer, then the floating conversion action. Because the shell is one
 * component, no public route can drift into its own chrome
 * (Requirements 1.1, 2.1).
 *
 * Skip control (Requirement 10.13): `SkipLink` is the first node in the tree
 * and nothing focusable precedes it, so the very first Tab press from the
 * document start reaches it. It targets the id this layout puts on `main`, so
 * the destination always resolves.
 *
 * Overlap compensation (Requirement 3.9): `useFloatingCtaInset` turns the
 * height the CTA reports into a bottom inset that is applied as the bottom
 * padding of the scrollable shell. While the CTA is hidden the inset is zero,
 * so nothing shifts; while it is visible the shell reserves exactly the CTA
 * height plus a token gap, and every item of content - including the footer -
 * can still be scrolled clear of the fixed action.
 *
 * Enquiry activation (Requirement 7.1): `onEnquire` is passed through to the
 * header CTA, the footer CTA, and the floating CTA so all three open the same
 * workflow. When it is omitted each child falls back to the existing enquiry
 * window event the current pages already listen for, which is what keeps this
 * layout usable before the enquiry provider is wired in.
 *
 * Content source: children when supplied, otherwise the routed `Outlet`, so the
 * route table can use it either as a wrapper element or as a parent route.
 *
 * Requirements: 1.1, 2.1, 3.9, 5.6, 7.1, 8.1, 10.13
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.children] Route content; falls back to `Outlet`.
 * @param {() => void} [props.onEnquire] Opens the enquiry workflow.
 * @param {Array<{ id: string, to: string, label: string }>} [props.nav] Nav override.
 * @param {{ label?: string, to?: string }} [props.cta] Header CTA override.
 * @param {boolean} [props.floatingCta=true] Render the floating conversion action.
 * @param {string} [props.className] Extra classes for the shell element.
 * @param {string} [props.mainClassName] Extra classes for the `main` landmark.
 */
export function PublicLayout({
  children,
  onEnquire,
  nav,
  cta,
  floatingCta = true,
  className,
  mainClassName,
  ...rest
}) {
  const { inset, onHeightChange } = useFloatingCtaInset()

  return (
    <div
      data-slot="public-layout"
      className={cn('flex min-h-screen flex-col bg-canvas text-content', className)}
      style={{ paddingBottom: inset }}
      {...rest}
    >
      <SkipLink />

      <SiteHeader variant="public" nav={nav} cta={cta} onCtaActivate={onEnquire} />

      <main id={MAIN_CONTENT_ID} className={cn('flex-1', mainClassName)}>
        {children ?? <Outlet />}
      </main>

      <SiteFooter variant="full" {...(onEnquire ? { onCtaClick: onEnquire } : {})} />

      {floatingCta ? (
        <FloatingCta onActivate={onEnquire} onHeightChange={onHeightChange} />
      ) : null}
    </div>
  )
}

export default PublicLayout
