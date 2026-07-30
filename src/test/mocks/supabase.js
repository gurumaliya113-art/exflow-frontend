/**
 * Module-boundary mock for `src/lib/supabase.js`.
 *
 * No test performs network I/O. Tests opt in with a hoisted factory that
 * re-exports this module, so the recorder state below is shared between the
 * mocked module and the test file:
 *
 *   vi.mock('@/lib/supabase', () => import('@/test/mocks/supabase'))
 *   import { insertCalls, setInsertResult, resetSupabaseMock } from '@/test/mocks/supabase'
 *
 * The client mirrors only the surface the app actually uses:
 * `getSupabase().from(table).insert(rows)` resolving to `{ data, error }`,
 * with an optional `.select()` continuation.
 */

/** @type {Array<{ table: string, rows: unknown[] }>} */
export const insertCalls = []

let insertResult = { data: null, error: null }
let configured = true
let insertDelayMs = 0

/** Queue the result every subsequent insert resolves with. */
export function setInsertResult(result) {
  insertResult = { data: null, error: null, ...result }
}

/** Make the next inserts fail with a Supabase-shaped error. */
export function setInsertError(message = 'insert failed') {
  insertResult = { data: null, error: { message } }
}

/** Toggle whether the module reports Supabase as configured. */
export function setConfigured(value) {
  configured = value
}

/** Delay insert resolution so pending-state assertions have a window. */
export function setInsertDelay(ms) {
  insertDelayMs = ms
}

/** Clear recorded calls and restore default success behavior. */
export function resetSupabaseMock() {
  insertCalls.length = 0
  insertResult = { data: null, error: null }
  configured = true
  insertDelayMs = 0
}

function resolveInsert() {
  const result = { ...insertResult }
  if (insertDelayMs > 0) {
    return new Promise((resolve) => setTimeout(() => resolve(result), insertDelayMs))
  }
  return Promise.resolve(result)
}

function createQueryBuilder(table) {
  return {
    insert(rows) {
      insertCalls.push({ table, rows: Array.isArray(rows) ? rows : [rows] })
      const pending = resolveInsert()
      // Support both `await insert(...)` and `await insert(...).select()`.
      return Object.assign(pending, {
        select: () => resolveInsert(),
        single: () => resolveInsert(),
      })
    },
    select() {
      return resolveInsert()
    },
  }
}

export const supabase = {
  from(table) {
    return createQueryBuilder(table)
  },
}

export const SUPABASE_CONFIGURED = true

export function getSupabase() {
  if (!configured) {
    throw new Error('Supabase is not configured.')
  }
  return supabase
}
