import { isValidElement } from 'react'
import { cn } from '../../lib/utils'

/**
 * `Section` - a full-bleed Content_Region band.
 *
 * Owns vertical rhythm only: every value comes from the spacing scale and the
 * component deliberately declares **no** horizontal padding, because
 * `Container` is the only source of page gutters (Requirement 3.4). Compose
 * `<Section><Container>...</Container></Section>`.
 *
 * `backdrop` takes a decorative node (the `TechBackdrop` primitive) and renders
 * it in an `aria-hidden`, non-interactive layer behind the content, so a motif
 * can never receive focus or be announced (Requirement 10.5).
 *
 * Requirements: 1.1, 3.4, 3.7, 10.5
 *
 * @param {object} props
 * @param {'canvas'|'surface'|'deep'} [props.tone='canvas'] Background role.
 * @param {import('react').ReactNode|string} [props.backdrop] Decorative motif layer.
 * @param {'none'|'sm'|'md'|'lg'} [props.pad='md'] Vertical rhythm step.
 * @param {import('react').ElementType} [props.as='section'] Rendered element.
 */

/** Background + text pairing per tone. Every value is token-backed. */
export const sectionTones = {
  canvas: 'bg-canvas text-content',
  surface: 'bg-surface text-content',
  deep: 'bg-surface-high text-content',
}

/** Vertical padding per step, from the spacing scale. */
export const sectionPads = {
  none: 'py-0',
  sm: 'py-[var(--space-6)] md:py-[var(--space-7)]',
  md: 'py-[var(--space-7)] md:py-[var(--space-8)]',
  lg: 'py-[var(--space-8)] md:py-[var(--space-9)]',
}

export const SECTION_TONES = Object.keys(sectionTones)
export const SECTION_PADS = Object.keys(sectionPads)

const DEFAULT_TONE = 'canvas'
const DEFAULT_PAD = 'md'

export function Section({
  tone = DEFAULT_TONE,
  backdrop,
  pad = DEFAULT_PAD,
  as: Tag = 'section',
  className,
  children,
  ...rest
}) {
  const toneName = tone in sectionTones ? tone : DEFAULT_TONE
  const padName = pad in sectionPads ? pad : DEFAULT_PAD
  const hasBackdropNode = isValidElement(backdrop)

  return (
    <Tag
      data-tone={toneName}
      data-pad={padName}
      {...(backdrop ? { 'data-backdrop': hasBackdropNode ? 'node' : String(backdrop) } : {})}
      className={cn(
        'relative w-full',
        sectionTones[toneName],
        sectionPads[padName],
        backdrop && 'isolate overflow-hidden',
        className,
      )}
      {...rest}
    >
      {hasBackdropNode ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {backdrop}
        </div>
      ) : null}
      {children}
    </Tag>
  )
}

export default Section
