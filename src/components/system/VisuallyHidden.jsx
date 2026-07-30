import { cn } from '../../lib/utils'

/**
 * `VisuallyHidden` - content exposed to assistive technology only.
 *
 * Uses the `sr-only` clip technique (not `display: none`, not
 * `visibility: hidden`), so the node stays in the accessibility tree and inside
 * live regions while occupying no visual space (Requirement 10.5).
 *
 * Requirements: 10.5
 *
 * @param {object} props
 * @param {import('react').ElementType} [props.as='span'] Rendered element.
 */
export function VisuallyHidden({ as: Tag = 'span', className, children, ...rest }) {
  return (
    <Tag data-slot="visually-hidden" className={cn('sr-only', className)} {...rest}>
      {children}
    </Tag>
  )
}

export default VisuallyHidden
