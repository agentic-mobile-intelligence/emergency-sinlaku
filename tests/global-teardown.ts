/**
 * Playwright global teardown — removes seeded test data.
 * Only runs when SUPABASE_SERVICE_ROLE_KEY is present.
 */
import { createClient } from '@supabase/supabase-js'
import { SEED_ORGS, SEED_OFFERINGS } from './helpers/seed-ids'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export default async function globalTeardown() {
  if (!SERVICE_ROLE_KEY) return

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  // Offerings first (FK constraint)
  await sb.from('offerings').delete().in('id', Object.values(SEED_OFFERINGS))
  await sb.from('organizations').delete().in('id', Object.values(SEED_ORGS))

  console.log('[global-teardown] Removed seed data ✓')
}
