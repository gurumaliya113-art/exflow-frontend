import { describe, it, expect, beforeEach, vi } from 'vitest'

// Module-boundary mock: no test performs network I/O. The factory re-exports the
// shared mock module so the recorder state below is the same instance the
// implementation sees.
vi.mock('@/lib/supabase', () => import('@/test/mocks/supabase'))

import {
  insertCalls,
  resetSupabaseMock,
  setConfigured,
  setInsertError,
} from '@/test/mocks/supabase'
import {
  ENQUIRY_TABLE,
  PARTNER_TABLE,
  ENQUIRY_ROW_KEYS,
  PARTNER_ROW_KEYS,
  toEnquiryRow,
  toPartnerRow,
  submitEnquiry,
  submitPartnership,
} from '../submissions'

const enquiryValues = {
  name: 'Asha Rao',
  company: 'Acme',
  phone: '9876543210',
  email: 'asha@example.com',
  project_details: 'Need a dashboard.',
  budget: '₹50,000 - ₹2,00,000',
  timeline: '2 weeks',
}

const partnerValues = {
  name: 'Ravi Kumar',
  company: 'Nexus',
  phone: '9812345670',
  email: 'ravi@example.com',
  investment_interest: '₹50,000 - ₹1,00,000',
  message: 'Interested in a regional partnership.',
}

beforeEach(() => {
  resetSupabaseMock()
})

describe('toEnquiryRow', () => {
  it('emits exactly the keys the enquiry destination uses today', () => {
    expect(Object.keys(toEnquiryRow(enquiryValues))).toEqual(ENQUIRY_ROW_KEYS)
  })

  it('carries every value through to its unchanged destination field', () => {
    expect(toEnquiryRow(enquiryValues)).toEqual(enquiryValues)
  })

  it('keeps the key set stable for missing and extra input fields', () => {
    const row = toEnquiryRow({ name: 'Solo', unrelated: 'ignored' })
    expect(Object.keys(row)).toEqual(ENQUIRY_ROW_KEYS)
    expect(row.name).toBe('Solo')
    expect(row.company).toBeUndefined()
    expect(row).not.toHaveProperty('unrelated')
  })
})

describe('toPartnerRow', () => {
  it('emits exactly the keys the partnership destination uses today', () => {
    expect(Object.keys(toPartnerRow(partnerValues))).toEqual(PARTNER_ROW_KEYS)
  })

  it('carries every value through to its unchanged destination field', () => {
    expect(toPartnerRow(partnerValues)).toEqual(partnerValues)
  })

  it('keeps the key set stable for missing and extra input fields', () => {
    const row = toPartnerRow({ phone: '7000000000', project_details: 'ignored' })
    expect(Object.keys(row)).toEqual(PARTNER_ROW_KEYS)
    expect(row.phone).toBe('7000000000')
    expect(row).not.toHaveProperty('project_details')
  })
})

describe('destination tables', () => {
  it('pins the pre-redesign table names', () => {
    expect(ENQUIRY_TABLE).toBe('enquiries')
    expect(PARTNER_TABLE).toBe('partners')
  })
})

describe('submitEnquiry', () => {
  it('inserts one mapped row into enquiries and reports success', async () => {
    const result = await submitEnquiry(enquiryValues)

    expect(result).toEqual({ ok: true, error: null })
    expect(insertCalls).toHaveLength(1)
    expect(insertCalls[0].table).toBe('enquiries')
    expect(insertCalls[0].rows).toEqual([toEnquiryRow(enquiryValues)])
  })

  it('reports a rejected insert as a failure without throwing', async () => {
    setInsertError('insert rejected')

    const result = await submitEnquiry(enquiryValues)

    expect(result.ok).toBe(false)
    expect(result.error).toEqual({ message: 'insert rejected' })
    expect(insertCalls).toHaveLength(1)
  })

  it('reports an unconfigured client as the same failure shape', async () => {
    setConfigured(false)

    const result = await submitEnquiry(enquiryValues)

    expect(result.ok).toBe(false)
    expect(result.error).toBeInstanceOf(Error)
    expect(insertCalls).toHaveLength(0)
  })
})

describe('submitPartnership', () => {
  it('inserts one mapped row into partners and reports success', async () => {
    const result = await submitPartnership(partnerValues)

    expect(result).toEqual({ ok: true, error: null })
    expect(insertCalls).toHaveLength(1)
    expect(insertCalls[0].table).toBe('partners')
    expect(insertCalls[0].rows).toEqual([toPartnerRow(partnerValues)])
  })

  it('reports a rejected insert as a failure without throwing', async () => {
    setInsertError('partner insert rejected')

    const result = await submitPartnership(partnerValues)

    expect(result.ok).toBe(false)
    expect(result.error).toEqual({ message: 'partner insert rejected' })
  })

  it('reports an unconfigured client as the same failure shape', async () => {
    setConfigured(false)

    const result = await submitPartnership(partnerValues)

    expect(result.ok).toBe(false)
    expect(result.error).toBeInstanceOf(Error)
    expect(insertCalls).toHaveLength(0)
  })
})
