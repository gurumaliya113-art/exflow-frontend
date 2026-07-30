import { cn } from '../../lib/utils'

/**
 * `Eyebrow` - the small uppercase kicker above a section title.
 *
 * Renders a `<p>`, never a heading: an eyebrow carries no document structure,
 * so emitting `<h*>` here would insert a phantom level and break heading order
 * (Requirement 10.5). Type is `--text-meta` with the meta tracking already
 * declared in the token layer; color is cyan, never Brand_Accent, because an
 * eyebrow is emphasis and not a conversion action.
 *
 * `icon` is decorative and rendered `aria-hidden`, so the accessible name of
 * the eyebrow is exactly its text.
 *
 * Requirements: 1.1, 3.7, 10.5
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.icon] Decorative leading glyph.
 * @param {import('react').ReactNode} props.children Eyebrow text.
 */
export function Eyebrow({ icon, className, children, ...rest }) {
  return (
    <p
      data-slot="eyebrow"
      className={cn(
        'flex items-center gap-[var(--space-2)] text-[length:var(--text-meta)] font-medium uppercase tracking-[0.08em] text-tech-cyan',
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span aria-hidden="true" className="inline-flex shrink-0 items-center">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </p>
  )
}

export default Eyebrow
