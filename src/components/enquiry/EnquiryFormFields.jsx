import { useCallback, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import Field from '@/components/system/Field'
import FormStatus from '@/components/system/FormStatus'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { submitEnquiry } from '@/lib/submissions'
import { ENQUIRY_LIMITS, MESSAGE_KEYS, validateEnquiry } from '@/lib/validation'

/**
 * `EnquiryFormFields` - the one Project_Enquiry_Form, shared by the
 * Enquiry_Modal and the standalone `/enquire` page.
 *
 * Because both surfaces render this component, the validation rules, the
 * character limits, the destination mapping, and the pending / success /
 * failure behavior exist exactly once. Only the post-success side effect
 * differs, and that is the caller's `onSubmitted` callback: the modal closes,
 * the page stays mounted (Requirements 7.11, 7.13).
 *
 * Behavior contract:
 * - Every control renders through `Field`, so each has a persistent associated
 *   label, an exposed required state, and its Requirement 7.7 limit forwarded
 *   as a character limit on the control (Requirements 7.7, 10.6).
 * - `validateEnquiry` runs on submit, and on blur only after the first submit
 *   attempt, so a partially filled form is never marked invalid before the
 *   person asked for it to be checked.
 * - A rejected submit identifies every invalid field individually, sends
 *   nothing, keeps every entered value, and moves focus to the first invalid
 *   control in DOM order (Requirement 7.8).
 * - Pending is single-shot: a synchronous ref guard early-returns from the
 *   handler and the submit control is disabled with a busy state, so repeated
 *   activations produce exactly one submission (Requirements 7.9, 7.10).
 * - Success shows the success status, clears the submitted fields, and calls
 *   `onSubmitted` (Requirement 7.11). Failure shows the failure status, keeps
 *   every entered value, and re-enables submit (Requirements 7.12, 11.7).
 * - The pre-redesign `react-hot-toast` strings still fire on validation
 *   failure, success, and submission failure, so the existing user-visible
 *   signal survives alongside the new field-level detail (Requirement 11.9).
 * - `FormStatus` is mounted in every state and reserves its height, so a status
 *   message displaces surrounding content by no more than its own box
 *   (Requirement 9.7).
 *
 * Requirements: 7.7, 7.8, 7.9, 7.10, 7.11, 7.12, 9.7, 10.6, 11.7, 11.9
 */

/** Toast + status copy, verbatim from the pre-redesign enquiry forms. */
export const ENQUIRY_MESSAGES = {
  validation: 'Name, phone and project details are required',
  pending: 'Submitting...',
  success: 'Enquiry submitted successfully!',
  failure: 'Failed to submit. Please try again.',
}

/** Empty form values: also the reset target after an accepted submission. */
export const EMPTY_ENQUIRY_VALUES = {
  name: '',
  company: '',
  phone: '',
  email: '',
  budget: '',
  timeline: '',
  project_details: '',
}

/**
 * Field descriptors in DOM order. The order is also the tab order and the order
 * "first invalid control" is resolved in (Requirement 7.8). Labels and
 * placeholders are the pre-redesign strings.
 */
export const ENQUIRY_FIELDS = [
  {
    name: 'name',
    label: 'Full Name',
    required: true,
    maxLength: ENQUIRY_LIMITS.name,
    placeholder: 'Your full name',
    autoComplete: 'name',
  },
  {
    name: 'company',
    label: 'Company',
    maxLength: ENQUIRY_LIMITS.company,
    placeholder: 'Company name',
    autoComplete: 'organization',
  },
  {
    name: 'phone',
    label: 'Phone',
    required: true,
    type: 'tel',
    maxLength: ENQUIRY_LIMITS.phone.max,
    placeholder: 'Phone number',
    autoComplete: 'tel',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    maxLength: ENQUIRY_LIMITS.email,
    placeholder: 'Email address',
    autoComplete: 'email',
  },
  {
    name: 'budget',
    label: 'Budget Range',
    maxLength: ENQUIRY_LIMITS.budget,
    placeholder: 'e.g. ₹50,000 - ₹2,00,000',
  },
  {
    name: 'timeline',
    label: 'Timeline',
    maxLength: ENQUIRY_LIMITS.timeline,
    placeholder: 'e.g. 2 weeks, 1 month',
  },
  {
    name: 'project_details',
    label: 'Project Details',
    required: true,
    as: 'textarea',
    rows: 5,
    maxLength: ENQUIRY_LIMITS.project_details,
    placeholder: 'Describe your project, goals, and requirements...',
    fullWidth: true,
  },
]

/**
 * Turn a `MESSAGE_KEYS` value into rendered copy. `Field` takes strings, not
 * keys, which keeps the validation module free of presentation concerns.
 */
export function messageFor(key, field) {
  switch (key) {
    case MESSAGE_KEYS.required:
      return `${field.label} is required`
    case MESSAGE_KEYS.tooLong:
      return `${field.label} must be ${field.maxLength} characters or fewer`
    case MESSAGE_KEYS.phoneLength:
      return `Phone must be between ${ENQUIRY_LIMITS.phone.min} and ${ENQUIRY_LIMITS.phone.max} characters`
    case MESSAGE_KEYS.emailShape:
      return 'Enter a valid email address'
    default:
      return key ? String(key) : undefined
  }
}

/**
 * @param {object} props
 * @param {() => void} [props.onSubmitted] Called after an accepted submission.
 * @param {string} [props.idPrefix='enquiry'] Namespaces control ids so the
 *   modal and the standalone page can be mounted at the same time.
 * @param {string} [props.submitLabel='Submit Enquiry'] Submit control label.
 */
export function EnquiryFormFields({
  onSubmitted,
  idPrefix = 'enquiry',
  submitLabel = 'Submit Enquiry',
  className,
  ...rest
}) {
  const [values, setValues] = useState(EMPTY_ENQUIRY_VALUES)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [statusMessage, setStatusMessage] = useState(undefined)

  // First submit attempt gates blur validation.
  const attemptedRef = useRef(false)
  // Synchronous single-shot guard: a second activation in the same tick as the
  // first cannot reach `submitEnquiry`, even before the disabled state renders.
  const pendingRef = useRef(false)
  const controlRefs = useRef({})

  const registerControl = useCallback(
    (name) => (node) => {
      controlRefs.current[name] = node
    },
    [],
  )

  const focusFirstInvalid = useCallback((nextErrors) => {
    const firstInvalid = ENQUIRY_FIELDS.find((field) => nextErrors[field.name])
    const node = firstInvalid ? controlRefs.current[firstInvalid.name] : null
    if (node && typeof node.focus === 'function') node.focus()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function handleBlur() {
    if (!attemptedRef.current) return
    setErrors(validateEnquiry(values))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (pendingRef.current) return

    attemptedRef.current = true
    const nextErrors = validateEnquiry(values)

    if (Object.keys(nextErrors).length > 0) {
      // Nothing is submitted and no value is touched.
      setErrors(nextErrors)
      setStatus('error')
      setStatusMessage(ENQUIRY_MESSAGES.validation)
      toast.error(ENQUIRY_MESSAGES.validation)
      focusFirstInvalid(nextErrors)
      return
    }

    setErrors({})
    pendingRef.current = true
    setStatus('pending')
    setStatusMessage(ENQUIRY_MESSAGES.pending)

    const result = await submitEnquiry(values)
    pendingRef.current = false

    if (result.ok) {
      setValues(EMPTY_ENQUIRY_VALUES)
      attemptedRef.current = false
      setStatus('success')
      setStatusMessage(ENQUIRY_MESSAGES.success)
      toast.success(ENQUIRY_MESSAGES.success)
      // Last: the caller may unmount this subtree (the modal closes on success).
      if (typeof onSubmitted === 'function') onSubmitted(result)
      return
    }

    setStatus('error')
    setStatusMessage(ENQUIRY_MESSAGES.failure)
    toast.error(ENQUIRY_MESSAGES.failure)
  }

  const pending = status === 'pending'

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      data-slot="enquiry-form"
      data-state={status}
      className={cn('flex flex-col gap-[var(--space-4)]', className)}
      {...rest}
    >
      <div className="grid gap-[var(--space-4)] md:grid-cols-2">
        {ENQUIRY_FIELDS.map((field) => (
          <Field
            key={field.name}
            id={`${idPrefix}-${field.name}`}
            name={field.name}
            label={field.label}
            as={field.as}
            type={field.type}
            rows={field.rows}
            required={Boolean(field.required)}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            value={values[field.name]}
            onChange={handleChange}
            onBlur={handleBlur}
            error={messageFor(errors[field.name], field)}
            ref={registerControl(field.name)}
            className={field.fullWidth ? 'md:col-span-2' : undefined}
          />
        ))}
      </div>

      <FormStatus state={status} message={statusMessage} />

      <div>
        <Button type="submit" variant="brand" size="lg" loading={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default EnquiryFormFields
