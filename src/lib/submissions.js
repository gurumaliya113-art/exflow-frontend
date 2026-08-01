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
 * Web3Forms access key. Paste the key you get (free) after registering with
 * azadgupta1010@gmail.com at https://web3forms.com — every submission is then
 * emailed straight to that inbox, no backend required. Left empty, email is
 * skipped and only the Supabase record is written (so tests and dev are
 * unaffected).
 */
export const WEB3FORMS_ACCESS_KEY = '95672216-f949-4727-a357-0c62ba632285'

/**
 * Best-effort: email the submission to the owner via Web3Forms. Never throws
 * and never blocks the result — the Supabase insert stays the source of truth.
 * @param {string} subject
 * @param {Record<string, any>} fields
 */
async function emailToOwner(subject, fields) {
  if (!WEB3FORMS_ACCESS_KEY || typeof fetch !== 'function') return
  // Never perform network I/O under test (keeps the submission tests hermetic).
  if (import.meta.env?.MODE === 'test') return
  try {
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject,
        from_name: fields.name || 'ExFlow website',
        ...fields,
      }),
    })
  } catch {
    /* email is best-effort; a failure here must not affect the submission */
  }
}

/**
 * Submit an enquiry: store in `enquiries` and email the owner.
 * @param {Record<string, any>} values
 * @returns {Promise<{ ok: boolean, error: any }>}
 */
export async function submitEnquiry(values) {
  const row = toEnquiryRow(values)
  const result = await insertRow(ENQUIRY_TABLE, row)
  await emailToOwner('New ExFlow enquiry', row)
  return result
}

/**
 * Submit a partnership interest: store in `partners` and email the owner.
 * @param {Record<string, any>} values
 * @returns {Promise<{ ok: boolean, error: any }>}
 */
export async function submitPartnership(values) {
  const row = toPartnerRow(values)
  const result = await insertRow(PARTNER_TABLE, row)
  await emailToOwner('New ExFlow partnership enquiry', row)
  return result
}
