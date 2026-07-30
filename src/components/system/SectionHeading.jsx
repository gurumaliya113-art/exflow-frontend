import { Children, Fragment, isValidElement } from 'react'
import { cn } from '../../lib/utils'
import { Eyebrow } from './Eyebrow'

/**
 * `SectionHeading` - the heading block of a Content_Region.
 *
 * Emits exactly one heading element at `level` (2, 3, or 4) and accepts at most
 * one action, which is the Primary_CTA slot. Both rules are structural, not
 * conventions: a region with two headings breaks heading order (Requirement
 * 10.5) and a region with two primary calls to action breaks the single-primary
 * rule (Requirement 3.7). Violations are impossible to express in the rendered
 * markup for the heading (the component owns the tag) and are reported as
 * DEV-only `console.warn`s for the composed slots, so they surface during
 * development without shipping runtime cost.
 *
 * `eyebrow` renders through `Eyebrow` (a `<p>`), so it never adds a level.
 * `lede` is capped at `--measure` for line length (Requirement 3.7).
 *
 * Requirements: 1.1, 3.7, 10.5
 *
 * @param {object} props
 * @param {2|3|4} [props.level=2] Heading level for the emitted element.
 * @param {import('react').ReactNode} [props.eyebrow] Kicker text above the title.
 * @param {import('react').ReactNode} props.title Heading content.
 * @param {import('react').ReactNode} [props.lede] Supporting paragraph.
 * @param {'start'|'center'} [props.align='start'] Text alignment.
 * @param {import('react').ReactNode} [props.action] At most one `Button`.
 */

/** Heading levels a `SectionHeading` may emit. */
export const SECTION_HEADING_LEVELS = [2, 3, 4]

const DEFAULT_LEVEL = 2

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

// Arbitrary `length:` values keep the font-size utility in its own conflict
// group, so it is never merged away by a sibling text-color utility.
const levelStyles = {
  2: 'text-[length:var(--text-heading)] font-bold tracking-[-0.01em]',
  3: 'text-[length:var(--text-heading)] font-bold tracking-[-0.01em]',
  4: 'text-[length:var(--text-label)] font-semibold uppercase tracking-[0.01em]',
}

/** Count heading elements nested anywhere inside a node tree. */
function countNestedHeadings(node) {
  let total = 0
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return
    if (typeof child.type === 'string' && HEADING_TAGS.has(child.type)) total += 1
    if (child.props?.children) total += countNestedHeadings(child.props.children)
  })
  return total
}

/**
 * Element children of a slot, ignoring `null` / whitespace text and looking
 * through fragments, so `<>{a}{b}</>` counts as two actions rather than one.
 */
function elementChildren(node) {
  const out = []
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return
    if (child.type === Fragment) {
      out.push(...elementChildren(child.props?.children))
      return
    }
    out.push(child)
  })
  return out
}

function warnInDev(message) {
  if (import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.warn(`[SectionHeading] ${message}`)
  }
}

/**
 * Validate the composed slots. Exported so the invariant can be asserted
 * directly; returns the list of warning messages that would be emitted.
 *
 * @param {{ title?: unknown, lede?: unknown, action?: unknown }} slots
 * @returns {string[]}
 */
export function checkSectionHeadingSlots({ title, lede, action } = {}) {
  const warnings = []

  const nestedHeadings =
    countNestedHeadings(title) + countNestedHeadings(lede) + countNestedHeadings(action)
  if (nestedHeadings > 0) {
    warnings.push(
      `a Content_Region may contain exactly one heading; ${nestedHeadings} nested heading element(s) were passed in title/lede/action. Pass heading text, not a heading element.`,
    )
  }

  const actions = elementChildren(action)
  if (actions.length > 1) {
    warnings.push(
      `the action slot accepts at most one Button; received ${actions.length}. Keep one Primary_CTA per Content_Region.`,
    )
  }

  const primaries = actions.filter((child) => child.props?.variant === 'brand')
  if (primaries.length > 1) {
    warnings.push(
      `a Content_Region may contain at most one Primary_CTA (variant="brand"); received ${primaries.length}.`,
    )
  }

  return warnings
}

export function SectionHeading({
  level = DEFAULT_LEVEL,
  eyebrow,
  title,
  lede,
  align = 'start',
  action,
  className,
  children,
  ...rest
}) {
  const resolvedLevel = SECTION_HEADING_LEVELS.includes(level) ? level : DEFAULT_LEVEL
  const Heading = `h${resolvedLevel}`
  const centered = align === 'center'

  checkSectionHeadingSlots({ title, lede, action }).forEach(warnInDev)

  // Exactly one action is rendered even if more were passed, so the shipped
  // markup can never violate the single-Primary_CTA rule.
  const actions = elementChildren(action)
  const renderedAction = actions.length > 0 ? actions[0] : null

  return (
    <div
      data-slot="section-heading"
      data-level={resolvedLevel}
      className={cn(
        'flex w-full flex-col gap-[var(--space-4)]',
        renderedAction && 'md:flex-row md:items-end md:justify-between',
        className,
      )}
      {...rest}
    >
      <div
        className={cn(
          'flex flex-col gap-[var(--space-3)]',
          centered ? 'items-center text-center' : 'items-start text-left',
        )}
      >
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Heading className={cn('text-content', levelStyles[resolvedLevel])}>{title}</Heading>
        {lede ? (
          <p className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted">
            {lede}
          </p>
        ) : null}
        {children}
      </div>
      {renderedAction ? (
        <div className={cn('flex shrink-0', centered ? 'justify-center' : 'justify-start')}>
          {renderedAction}
        </div>
      ) : null}
    </div>
  )
}

export default SectionHeading
