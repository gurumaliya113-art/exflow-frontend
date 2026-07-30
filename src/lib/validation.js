/**
 * Pure form-validation logic for the enquiry and partnership forms.
 *
 * Both validators return a field -> messageKey map. An empty object means the
 * submission is valid. Values are never mutated or normalized here, so callers
 * can keep every entered value on failure (Requirements 7.8, 8.4).
 */

/** Character limits for the Project_Enquiry_Form (Requirement 7.7). */
export const ENQUIRY_LIMITS = {
  name: 100,
  company: 100,
  email: 254,
  budget: 100,
  timeline: 100,
  project_details: 5000,
  phone: { min: 7, max: 20 },
}

/** Fields that must contain at least one non-whitespace character. */
export const ENQUIRY_REQUIRED = ['name', 'phone', 'project_details']
export const PARTNERSHIP_REQUIRED = ['name', 'phone']

export const MESSAGE_KEYS = {
  required: 'required',
  tooLong: 'tooLong',
  phoneLength: 'phoneLength',
  emailShape: 'emailShape',
}

function asString(value) {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

/** True when the value is empty once whitespace is removed. */
export function isBlank(value) {
  return asString(value).trim().length === 0
}

/**
 * True when the value has a non-empty segment before and after a single `@`.
 * Whitespace-only segments count as empty (Requirement 7.8).
 */
export function isEmailShaped(value) {
  const parts = asString(value).split('@')
  if (parts.length !== 2) return false
  return parts[0].trim().length > 0 && parts[1].trim().length > 0
}

/**
 * Validates the Project_Enquiry_Form.
 *
 * - name, phone, project_details are required (blank after trimming fails)
 * - name/company/budget/timeline <= 100, email <= 254, project_details <= 5000
 * - phone must be 7-20 characters
 * - email is only validated when entered; it must be email-shaped
 *
 * Requirements: 7.7, 7.8
 */
export function validateEnquiry(values) {
  const v = values || {}
  const errors = {}

  const name = asString(v.name)
  if (isBlank(name)) errors.name = MESSAGE_KEYS.required
  else if (name.length > ENQUIRY_LIMITS.name) errors.name = MESSAGE_KEYS.tooLong

  const details = asString(v.project_details)
  if (isBlank(details)) errors.project_details = MESSAGE_KEYS.required
  else if (details.length > ENQUIRY_LIMITS.project_details) {
    errors.project_details = MESSAGE_KEYS.tooLong
  }

  const phone = asString(v.phone)
  if (isBlank(phone)) errors.phone = MESSAGE_KEYS.required
  else if (
    phone.length < ENQUIRY_LIMITS.phone.min ||
    phone.length > ENQUIRY_LIMITS.phone.max
  ) {
    errors.phone = MESSAGE_KEYS.phoneLength
  }

  const email = asString(v.email)
  if (!isBlank(email)) {
    if (email.length > ENQUIRY_LIMITS.email) errors.email = MESSAGE_KEYS.tooLong
    else if (!isEmailShaped(email)) errors.email = MESSAGE_KEYS.emailShape
  }

  for (const field of ['company', 'budget', 'timeline']) {
    const entered = asString(v[field])
    if (!isBlank(entered) && entered.length > ENQUIRY_LIMITS[field]) {
      errors[field] = MESSAGE_KEYS.tooLong
    }
  }

  return errors
}

/**
 * Validates the Partnership_Form. Only name and phone are required; a value
 * that is empty or whitespace-only fails. Every other field is optional and
 * unconstrained, matching the pre-redesign behavior (Requirements 8.4, 8.5).
 */
export function validatePartnership(values) {
  const v = values || {}
  const errors = {}

  for (const field of PARTNERSHIP_REQUIRED) {
    if (isBlank(v[field])) errors[field] = MESSAGE_KEYS.required
  }

  return errors
}
