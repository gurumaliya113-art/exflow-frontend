/**
 * Submission mappers and clients.
 *
 * `toEnquiryRow` / `toPartnerRow` reproduce the object literals that
 * `components/EnquireModal.jsx`, `pages/EnquirePage.jsx`, and `pages/PartnerPage.jsx`
 * insert today, key-for-key, so the redesign provably does not change any
 * destination field mapping (Requirements 11.4, 11.5).
 *
 * `submitEnquiry` / `submitPartnership` never throw: they resolve to
 * `{ ok: true, error: null }` or `{ ok: false, error }`. The client is resolved
 * through `getSupabase()` inside the `try`, so an unconfigured client produces
 * the same failure path as a rejected insert (Requirement 11.9).
 */

import { getSupabase } from './supabase'

/** Destination table for enquiry submissions (modal + `/enquire`). */
export const ENQUIRY_TABLE = 'enquiries'

/** Destination table for partnership submissions (`/partner`). */
export const PARTNER_TABLE = 'partners'

/** Field keys written to `enquiries`, in the order used today. */
export const ENQUIRY_ROW_KEYS = [
  'name',
  'company',
  'phone',
  'email',
  'project_details',
  'budget',
  'timeline',
]

/** Field keys written to `partners`, in the order used today. */
export const PARTNER_ROW_KEYS = [
  'name',
  'company',
  'phone',
  'email',
  'investment_interest',
  'message',
]

/**
 * Map enquiry form values to the `enquiries` row.
 * @param {Record<string, any>} values
 * @returns {Record<string, any>}
 */
export function toEnquiryRow(values) {
  const form = values || {}
  return {
    name: form.name,
    company: form.company,
    phone: form.phone,
    email: form.email,
    project_details: form.project_details,
    budget: form.budget,
    timeline: form.timeline,
  }
}

/**
 * Map partnership form values to the `partners` row.
 * @param {Record<string, any>} values
 * @returns {Record<string, any>}
 */
export function toPartnerRow(values) {
  const form = values || {}
  return {
    name: form.name,
    company: form.company,
    phone: form.phone,
    email: form.email,
    investment_interest: form.investment_interest,
    message: form.message,
  }
}

/**
 * Insert one row and normalize every failure mode to `{ ok: false, error }`.
 * @param {string} table
 * @param {Record<string, any>} row
 * @returns {Promise<{ ok: boolean, error: any }>}
 */
async function insertRow(table, row) {
  try {
    const client = getSupabase()
    const { error } = await client.from(table).insert([row])
    if (error) return { ok: false, error }
    return { ok: true, error: null }
  } catch (err) {
    return { ok: false, error: err }
  }
}

/**
 * Submit an enquiry to `enquiries`.
 * @param {Record<string, any>} values
 * @returns {Promise<{ ok: boolean, error: any }>}
 */
export async function submitEnquiry(values) {
  return insertRow(ENQUIRY_TABLE, toEnquiryRow(values))
}

/**
 * Submit a partnership interest to `partners`.
 * @param {Record<string, any>} values
 * @returns {Promise<{ ok: boolean, error: any }>}
 */
export async function submitPartnership(values) {
  return insertRow(PARTNER_TABLE, toPartnerRow(values))
}
