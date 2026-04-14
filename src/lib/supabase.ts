import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const rc = (window as any).__RUNTIME_CONFIG__ ?? {}
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || rc.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || rc.VITE_SUPABASE_PUBLISHABLE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase env vars not set. ' +
    'Queries will fail silently until VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are in .env.'
  )
}

// Anonymous client — used for public reads (offerings, organizations, island pages)
export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

/**
 * Create a Supabase client that injects a Clerk JWT into every request.
 * The JWT must be signed with Supabase's JWT secret via a Clerk JWT template
 * named "supabase" (set up in Clerk Dashboard → JWT Templates).
 *
 * Supabase RLS policies use auth.jwt()->>'sub' to identify the Clerk user.
 */
export function createAuthClient(getToken: () => Promise<string | null>) {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      fetch: async (url, options = {}) => {
        const token = await getToken()
        const headers = new Headers((options as RequestInit).headers)
        if (token) headers.set('Authorization', `Bearer ${token}`)
        return fetch(url, { ...(options as RequestInit), headers })
      },
    },
  })
}
