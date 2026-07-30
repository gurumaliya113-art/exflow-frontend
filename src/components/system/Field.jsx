import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * `Field` - the single source of form accessibility for the redesign.
 *
 * Every form control in the app renders through this primitive so the wiring
 * below exists exactly once:
 *
 * - `<label htmlFor={id}>` + `id` on the control: a programmatically
 *   associated accessible name that stays available while the control is
 *   rendered. A placeholder is never the label (Requirement 10.6); `placeholder`
 *   is allowed only as an additional example value.
 * - Required state is exposed twice: a visible indicator in the label and
 *   `aria-required="true"` on the control (Requirement 10.6).
 * - `error` renders a `role="alert"` node, sets `aria-invalid="true"`, and is
 *   linked through `aria-describedby`, so the invalid state reaches assistive
 *   technology in the same render it becomes visible (Requirement 10.9).
 * - `hint` and `error` are both referenced by `aria-describedby` in DOM order
 *   (hint, then error) so the announced description matches the visual order.
 * - `maxLength` is forwarded to the control, which is how the per-field limits
 *   in Requirement 7.7 are enforced at the input.
 *
 * The native `required` attribute is deliberately not set: validation is owned
 * by `lib/validation.js` and rendered as field-level messages, and the native
 * attribute would replace those with browser bubbles. `aria-required` carries
 * the state to assistive technology without changing submit behavior.
 *
 * `error` is already-rendered copy. Mapping a `MESSAGE_KEYS` value to text is
 * the caller's job, which keeps this primitive free of validation imports.
 *
 * Requirements: 9.7, 10.6, 10.9
 *
 * @param {object} props
 * @param {string} props.id Control id; also seeds the hint and error node ids.
 * @param {import('react').ReactNode} props.label Persistent visible label.
 * @param {'input'|'textarea'} [props.as='input'] Control element to render.
 * @param {boolean} [props.required=false] Exposes required visually and to AT.
 * @param {string} [props.error] Rendered error copy; presence marks invalid.
 * @param {import('react').ReactNode} [props.hint] Persistent helper text.
 * @param {number} [props.maxLength] Forwarded character limit.
 */
export const Field = forwardRef(function Field(
  {
    id,
    label,
    as = 'input',
    type = 'text',
    required = false,
    error,
    hint,
    maxLength,
    rows,
    className,
    controlClassName,
    labelClassName,
    'aria-describedby': describedByProp,
    ...rest
  },
  ref,
) {
  const Control = as === 'textarea' ? 'textarea' : 'input'
  const hintId = hint ? `${id}-hint` : null
  const errorId = error ? `${id}-error` : null

  // DOM order: hint first (instructions), error second (the correction).
  const describedBy =
    [hintId, errorId, describedByProp].filter(Boolean).join(' ') || undefined

  const invalid = Boolean(error)

  return (
    <div data-slot="field" data-invalid={invalid || undefined} className={cn('flex flex-col gap-[var(--space-2)]', className)}>
      <label
        htmlFor={id}
        className={cn(
          'flex items-center gap-[var(--space-1)] text-[length:var(--text-label)] font-semibold text-content',
          labelClassName,
        )}
      >
        <span>{label}</span>
        {required ? (
          <span data-slot="required-indicator" aria-hidden="true" className="text-danger">
            *
          </span>
        ) : null}
      </label>

      <Control
        id={id}
        ref={ref}
        {...(Control === 'input' ? { type } : { rows: rows ?? 4 })}
        aria-required={required ? 'true' : undefined}
        aria-invalid={invalid ? 'true' : undefined}
        aria-describedby={describedBy}
        maxLength={maxLength}
        className={cn(
          'w-full rounded-sm border bg-surface px-[var(--space-3)] py-[var(--space-3)] text-[length:var(--text-body)] text-content',
          'placeholder:text-content-muted',
          'transition-[color,background-color,border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out)]',
          'hover:border-line-strong',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
          'disabled:cursor-not-allowed disabled:opacity-60',
          as === 'textarea' ? 'min-h-[var(--space-9)] resize-y' : 'min-h-[var(--size-touch)]',
          invalid ? 'border-danger' : 'border-content-muted',
          controlClassName,
        )}
        {...rest}
      />

      {hint ? (
        <p
          id={hintId}
          data-slot="field-hint"
          className="text-[length:var(--text-meta)] font-medium text-content-muted"
        >
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          role="alert"
          data-slot="field-error"
          className="text-[length:var(--text-label)] font-semibold text-danger"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
})

export default Field
