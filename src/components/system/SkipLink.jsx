import { cn } from '../../lib/utils'

/**
 * `SkipLink` - first focusable node in every layout.
 *
 * Always targets `#main`, the id each layout puts on its `<main>` element, so
 * keyboard users can bypass the header nav. Hidden until focused, then pinned
 * to the top-left with a token focus ring so it is visible where it lands
 * (Requirement 10.5).
 *
 * Requirements: 10.5
 *
 * @param {object} props
 * @param {string} [props.href='#main'] Target id. Defaults to the layout `<main>`.
 * @param {import('react').ReactNode} [props.children='Skip to main content']
 */

/** The id every layout's `<main>` carries. */
export const MAIN_CONTENT_ID = 'main'

export function SkipLink({
  href = `#${MAIN_CONTENT_ID}`,
  className,
  children = 'Skip to main content',
  ...rest
}) {
  return (
    <a
      href={href}
      data-slot="skip-link"
      className={cn(
        'sr-only',
        'focus-visible:not-sr-only focus-visible:fixed focus-visible:left-[var(--space-4)] focus-visible:top-[var(--space-4)] focus-visible:z-50',
        'focus-visible:inline-flex focus-visible:min-h-[var(--size-touch)] focus-visible:items-center',
        'focus-visible:rounded-[var(--radius-xs)] focus-visible:bg-surface-high focus-visible:px-[var(--space-4)]',
        'focus-visible:text-[length:var(--text-label)] focus-visible:font-semibold focus-visible:text-content',
        'focus-visible:outline-[var(--border-2)] focus-visible:outline-offset-2 focus-visible:outline-focus',
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  )
}

export default SkipLink
