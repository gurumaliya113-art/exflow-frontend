import { describe, it, expect } from 'vitest'
import {
  ENQUIRY_LIMITS,
  isBlank,
  isEmailShaped,
  validateEnquiry,
  validatePartnership,
} from '../validation'

const validEnquiry = {
  name: 'Ada Lovelace',
  company: '',
  phone: '9876543',
  email: '',
  project_details: 'Need a dashboard.',
  budget: '',
  timeline: '',
}

const rep = (n, ch = 'a') => ch.repeat(n)

describe('isBlank', () => {
  it('treats empty and whitespace-only values as blank', () => {
    expect(isBlank('')).toBe(true)
    expect(isBlank('   \t\n ')).toBe(true)
    expect(isBlank(undefined)).toBe(true)
    expect(isBlank(null)).toBe(true)
  })

  it('treats any non-whitespace character as present', () => {
    expect(isBlank(' a ')).toBe(false)
    expect(isBlank('0')).toBe(false)
  })
})

describe('isEmailShaped', () => {
  it('accepts a non-empty segment on both sides of a single @', () => {
    expect(isEmailShaped('a@b')).toBe(true)
    expect(isEmailShaped('ada@exflow.in')).toBe(true)
  })

  it('rejects missing, empty, or duplicated segments', () => {
    expect(isEmailShaped('ada.exflow.in')).toBe(false)
    expect(isEmailShaped('@exflow.in')).toBe(false)
    expect(isEmailShaped('ada@')).toBe(false)
    expect(isEmailShaped('a@b@c')).toBe(false)
    expect(isEmailShaped(' @ ')).toBe(false)
  })
})

describe('validateEnquiry', () => {
  it('returns an empty object for a valid submission', () => {
    expect(validateEnquiry(validEnquiry)).toEqual({})
  })

  it('flags every blank required field individually', () => {
    const errors = validateEnquiry({ name: '   ', phone: '', project_details: '\n' })
    expect(errors).toEqual({
      name: 'required',
      phone: 'required',
      project_details: 'required',
    })
  })

  it('accepts required fields at their length limits', () => {
    const errors = validateEnquiry({
      ...validEnquiry,
      name: rep(ENQUIRY_LIMITS.name),
      project_details: rep(ENQUIRY_LIMITS.project_details),
    })
    expect(errors).toEqual({})
  })

  it('rejects required fields one character over their limits', () => {
    const errors = validateEnquiry({
      ...validEnquiry,
      name: rep(ENQUIRY_LIMITS.name + 1),
      project_details: rep(ENQUIRY_LIMITS.project_details + 1),
    })
    expect(errors).toEqual({ name: 'tooLong', project_details: 'tooLong' })
  })

  it('accepts phone at both ends of the 7-20 range', () => {
    expect(validateEnquiry({ ...validEnquiry, phone: rep(ENQUIRY_LIMITS.phone.min, '1') })).toEqual({})
    expect(validateEnquiry({ ...validEnquiry, phone: rep(ENQUIRY_LIMITS.phone.max, '1') })).toEqual({})
  })

  it('rejects phone just outside the 7-20 range', () => {
    expect(validateEnquiry({ ...validEnquiry, phone: rep(ENQUIRY_LIMITS.phone.min - 1, '1') }))
      .toEqual({ phone: 'phoneLength' })
    expect(validateEnquiry({ ...validEnquiry, phone: rep(ENQUIRY_LIMITS.phone.max + 1, '1') }))
      .toEqual({ phone: 'phoneLength' })
  })

  it('ignores optional fields that were not entered', () => {
    expect(validateEnquiry({ ...validEnquiry, email: '  ', company: '', budget: '', timeline: '' }))
      .toEqual({})
  })

  it('validates email shape and limit only when entered', () => {
    expect(validateEnquiry({ ...validEnquiry, email: 'nope' })).toEqual({ email: 'emailShape' })
    // "@b.com" is 6 characters, so the local part sets the total length.
    const atLimit = `${rep(ENQUIRY_LIMITS.email - 6)}@b.com`
    const overLimit = `${rep(ENQUIRY_LIMITS.email - 5)}@b.com`
    expect(atLimit).toHaveLength(ENQUIRY_LIMITS.email)
    expect(overLimit).toHaveLength(ENQUIRY_LIMITS.email + 1)
    expect(validateEnquiry({ ...validEnquiry, email: atLimit })).toEqual({})
    expect(validateEnquiry({ ...validEnquiry, email: overLimit })).toEqual({ email: 'tooLong' })
  })

  it('applies the 100-character limit to company, budget, and timeline', () => {
    const at = validateEnquiry({
      ...validEnquiry,
      company: rep(100),
      budget: rep(100),
      timeline: rep(100),
    })
    expect(at).toEqual({})

    const over = validateEnquiry({
      ...validEnquiry,
      company: rep(101),
      budget: rep(101),
      timeline: rep(101),
    })
    expect(over).toEqual({ company: 'tooLong', budget: 'tooLong', timeline: 'tooLong' })
  })

  it('does not mutate the input values', () => {
    const values = { ...validEnquiry, name: '  ' }
    const snapshot = { ...values }
    validateEnquiry(values)
    expect(values).toEqual(snapshot)
  })
})

describe('validatePartnership', () => {
  it('returns an empty object when name and phone have content', () => {
    expect(validatePartnership({ name: 'A', phone: '1' })).toEqual({})
  })

  it('flags name and phone when empty or whitespace-only', () => {
    expect(validatePartnership({ name: '', phone: '   ' })).toEqual({
      name: 'required',
      phone: 'required',
    })
    expect(validatePartnership({})).toEqual({ name: 'required', phone: 'required' })
  })

  it('does not constrain the optional partnership fields', () => {
    expect(
      validatePartnership({
        name: 'A',
        phone: '1',
        company: rep(500),
        email: 'not-an-email',
        investment_interest: rep(500),
        message: rep(9000),
      })
    ).toEqual({})
  })
})
