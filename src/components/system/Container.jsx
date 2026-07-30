import { cn } from '../../lib/utils'
import { containerWidths } from '../../lib/tokens'

/**
 * `Container` - the single source of horizontal page padding.
 *
 * No other component in the system may declare horizontal page padding; nested
 * padding is what causes the drifting gutters Requirement 3.4 forbids. Widths
 * come from the token mirror (`lib/tokens.js` `containerWidths`) and resolve
 * through the matching CSS custom property so the CSS layer stays the runtime
 * source of truth, with the mirrored value as a fallback.
 *
 * Padding steps `--space-4` (16px) -> `--space-5` (24px) at the `md` breakpoint
 * (768px), which is the same boundary the chrome primitives switch on.
 *
 * Requirements: 1.1, 1.8, 3.4
 *
 * @param {object} props
 * @param {'prose'|'narrow'|'wide'|'max'} [props.width='wide'] Named content width.
 * @param {import('react').ElementType} [props.as='div'] Rendered element.
 * @param {string} [props.className]
 * @param {object} [props.style]
 * @param {import('react').ReactNode} [props.children]
 */

/** CSS custom property backing each named width. */
export const containerWidthVars = {
  prose: '--container-prose',
  narrow: '--container-narrow',
  wide: '--container-wide',
  max: '--container-max',
}

/** Widths a `Container` accepts, in ascending order. */
export const CONTAINER_WIDTHS = ['prose', 'narrow', 'wide', 'max']

const DEFAULT_WIDTH = 'wide'

/**
 * Resolve a width name to the `max-width` value applied by `Container`.
 * Unknown names fall back to the default width rather than rendering unbounded.
 *
 * @param {string} width
 * @returns {string} e.g. `var(--container-wide, 1200px)`
 */
export function resolveContainerWidth(width) {
  const name = CONTAINER_WIDTHS.includes(width) ? width : DEFAULT_WIDTH
  return `var(${containerWidthVars[name]}, ${containerWidths[name]}px)`
}

export function Container({
  width = DEFAULT_WIDTH,
  as: Tag = 'div',
  className,
  style,
  children,
  ...rest
}) {
  const name = CONTAINER_WIDTHS.includes(width) ? width : DEFAULT_WIDTH

  return (
    <Tag
      data-container-width={name}
      className={cn(
        'mx-auto w-full px-[var(--space-4)] md:px-[var(--space-5)]',
        className,
      )}
      style={{ maxWidth: resolveContainerWidth(name), ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export default Container
