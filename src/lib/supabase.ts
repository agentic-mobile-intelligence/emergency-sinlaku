import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const rc = (window as any).__RUNTIME_CONFIG__ ?? {}
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || rc.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || rc.VITE_SUPABASE_PUBLISHABLE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase env vars not set — run mcp__supabase__provision_database first. ' +
    'Queries will fail silently until VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are in .env.'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
