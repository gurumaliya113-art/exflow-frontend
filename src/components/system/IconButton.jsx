import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * `IconButton` - the only approved way to render an icon-only control.
 *
 * `label` is required and is rendered as `aria-label`, so every icon-only
 * Interactive_Control has a programmatically determinable accessible name that
 * identifies its action (Requirement 10.8). The icon itself is wrapped in an
 * `aria-hidden` span so a glyph font or inline SVG never contributes stray
 * text to that name.
 *
 * The target area is at least `--size-touch` (44px) square at every size, so
 * the control satisfies Requirement 3.8 at the mobile widths where it matters;
 * `size` only changes the rendered glyph box, never the hit area.
 *
 * Font sizes are set through an arbitrary font-size property that reads the
 * typography token, rather than through a shorthand text utility named after
 * the token: tailwind-merge classifies those shorthand names as text-COLOR
 * utilities and would drop the size whenever a tone also sets a text color.
 *
 * Requirements: 3.8, 10.8
 *
 * @param {object} props
 * @param {string} props.label Accessible name. Required; describes the action.
 * @param {import('react').ReactNode} [props.icon] Icon node. `children` also works.
 * @param {'sm'|'md'|'lg'} [props.size='md'] Rendered glyph box, not the hit area.
 * @param {'tech'|'brand'|'ghost'|'outline'|'danger'} [props.tone='ghost'] Visual treatment.
 */

/** Minimum target area for every icon-only control (Requirement 3.8). */
export const TOUCH_TARGET_CLASS = 'min-h-[var(--size-touch)] min-w-[var(--size-touch)]'

const TONE_CLASSES = {
  // `brand` is the only tone that paints `--color-brand` (Requirement 1.3).
  brand: 'bg-brand text-brand-ink border-brand hover:bg-brand-hover hover:shadow-raise',
  tech: 'bg-tech-blue text-canvas border-tech-blue hover:bg-tech-cyan hover:shadow-raise',
  outline:
    'bg-transparent text-content border-content-muted hover:bg-surface-high hover:shadow-raise',
  ghost: 'bg-transparent text-content border-transparent hover:bg-surface-high',
  danger: 'bg-danger text-canvas border-danger hover:shadow-raise',
}

const ICON_SIZE_CLASSES = {
  sm: '[&_svg]:size-[var(--size-icon-sm)]',
  md: '[&_svg]:size-[var(--size-icon-md)]',
  lg: '[&_svg]:size-[var(--size-icon-lg)]',
}

export const IconButton = forwardRef(function IconButton(
  {
    label,
    icon,
    size = 'md',
    tone = 'ghost',
    type = 'button',
    className,
    children,
    ...rest
  },
  ref,
) {
  if (import.meta.env?.MODE !== 'production' && !label) {
    // An icon-only control without an accessible name is an a11y defect, not a
    // styling preference, so it fails loudly during development.
    throw new Error('IconButton requires a `label` for its accessible name.')
  }

  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      data-slot="icon-button"
      data-tone={tone}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[var(--radius-pill)]',
        TOUCH_TARGET_CLASS,
        'border-[length:var(--border-1)]',
        '[font-size:var(--text-label)] font-semibold',
        'transition-[color,background-color,border-color,box-shadow,opacity] duration-[var(--duration-fast)] ease-[var(--ease-out)]',
        // Non-color state cues alongside any color change (Requirement 9.1).
        'active:translate-y-px active:shadow-flat',
        'aria-pressed:ring-[length:var(--border-2)] aria-pressed:ring-tech-cyan',
        'disabled:cursor-not-allowed disabled:border-dashed disabled:opacity-50',
        'focus-visible:outline-[var(--border-2)] focus-visible:outline-offset-2 focus-visible:outline-focus',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        ICON_SIZE_CLASSES[size] ?? ICON_SIZE_CLASSES.md,
        TONE_CLASSES[tone] ?? TONE_CLASSES.ghost,
        className,
      )}
      {...rest}
    >
      {/* Hidden from the name computation so `aria-label` is the only source. */}
      <span aria-hidden="true" data-slot="icon" className="inline-flex items-center justify-center">
        {icon ?? children}
      </span>
    </button>
  )
})

export default IconButton
