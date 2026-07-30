import { cn } from '@/lib/utils'

/**
 * `FormStatus` - the pending / success / error line under a form's submit row.
 *
 * The node is always mounted, including in `idle`, and always reserves the same
 * minimum height. Because the box exists before a message appears, showing a
 * pending, success, or error message displaces surrounding content by no more
 * than this element's own rendered height (Requirement 9.7).
 *
 * `role="status"` with an explicit `aria-live="polite"` means the message is
 * announced when it appears without stealing focus, so the state reaches
 * assistive technology in the same render it becomes visible
 * (Requirement 10.9). The live region is mounted up front - a region added to
 * the DOM at the same time as its text is unreliably announced.
 *
 * State is also carried in `data-state` for styling and assertions, and the
 * pending state adds a non-text indicator so the status is not conveyed by
 * color alone.
 *
 * Requirements: 9.7, 10.9
 *
 * @param {object} props
 * @param {'idle'|'pending'|'success'|'error'} [props.state='idle']
 * @param {import('react').ReactNode} [props.message] Rendered status copy.
 */

export const FORM_STATUS_STATES = ['idle', 'pending', 'success', 'error']

/** Reserved height token: one `--space-6` band fits a single `--text-label` line. */
export const RESERVED_HEIGHT_CLASS = 'min-h-[var(--space-6)]'

const TONES = {
  idle: 'text-content-muted',
  pending: 'text-content-muted',
  success: 'text-success',
  error: 'text-danger',
}

export function FormStatus({ state = 'idle', message, className, ...rest }) {
  const resolved = FORM_STATUS_STATES.includes(state) ? state : 'idle'
  const showMessage = resolved !== 'idle' && Boolean(message)

  return (
    <p
      role="status"
      aria-live="polite"
      data-slot="form-status"
      data-state={resolved}
      className={cn(
        'flex items-center gap-[var(--space-2)] text-[length:var(--text-label)] font-semibold',
        RESERVED_HEIGHT_CLASS,
        TONES[resolved],
        className,
      )}
      {...rest}
    >
      {resolved === 'pending' ? (
        <span
          aria-hidden="true"
          data-slot="form-status-indicator"
          className="motion-decorative size-[var(--space-2)] shrink-0 animate-pulse rounded-pill bg-tech-cyan"
        />
      ) : null}
      {showMessage ? <span data-slot="form-status-message">{message}</span> : null}
    </p>
  )
}

export default FormStatus
