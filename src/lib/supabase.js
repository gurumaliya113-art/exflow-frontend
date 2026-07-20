import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ngcmlgcykkrclxufbpmr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nY21sZ2N5a2tyY2x4dWZicG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NjE1ODMsImV4cCI6MjEwMDEzNzU4M30.ljGqzBe9m0Vh_d8KAo9rFkW1z_-Iwh6FW6ts1kCAsGY'

export const SUPABASE_CONFIGURED = !!supabaseAnonKey
export const supabase = SUPABASE_CONFIGURED ? createClient(supabaseUrl, supabaseAnonKey) : null

export function getSupabase() {
  if (!SUPABASE_CONFIGURED || !supabase) {
    throw new Error('Supabase is not configured.')
  }
  return supabase
}
