/**
 * Playwright global setup — seeds known test organizations + offerings.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in the environment to bypass RLS.
 * If the key is absent, setup is skipped (assumes data already exists,
 * e.g. seeded manually via `bun run test:seed`).
 */
import { createClient } from '@supabase/supabase-js'
import { SEED_ORGS, SEED_OFFERINGS } from './helpers/seed-ids'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export default async function globalSetup() {
  if (!SERVICE_ROLE_KEY) {
    console.log('[global-setup] SUPABASE_SERVICE_ROLE_KEY not set — skipping seed (assuming data exists)')
    return
  }

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  // Upsert organizations
  const { error: orgErr } = await sb.from('organizations').upsert([
    {
      id: SEED_ORGS.redCross,
      name: 'Guam Red Cross Emergency Shelter',
      description: 'American Red Cross — providing emergency shelter, food, and basic needs following Supertyphoon Sinlaku.',
      contact_phone: '671-472-7234',
      service_types: ['shelter', 'food', 'water'],
      islands: ['guam'],
      verified: true,
    },
    {
      id: SEED_ORGS.fema,
      name: 'FEMA Disaster Recovery Center — Guam',
      description: 'Federal Emergency Management Agency disaster recovery assistance for Guam residents.',
      contact_phone: '1-800-621-3362',
      service_types: ['shelter', 'medical', 'transportation'],
      islands: ['guam'],
      verified: true,
    },
    {
      id: SEED_ORGS.adelup,
      name: 'Adelup Tarp & Cleanup Distribution',
      description: 'GovGuam distribution point for tarps, cleanup supplies, and debris removal coordination.',
      contact_phone: '671-475-9600',
      service_types: ['tarps', 'cleanup'],
      islands: ['guam'],
      verified: true,
    },
  ], { onConflict: 'id' })

  if (orgErr) throw new Error(`[global-setup] org upsert failed: ${orgErr.message}`)

  // Upsert offerings
  const { error: offerErr } = await sb.from('offerings').upsert([
    {
      id: SEED_OFFERINGS.shelter,
      organization_id: SEED_ORGS.redCross,
      name: 'Emergency Shelter — Tiyan High School',
      description: 'Red Cross emergency shelter with cots, meals, and basic necessities.',
      location_text: 'Tiyan High School, Barrigada, Guam',
      location_lat: 13.4801, location_lng: 144.8013,
      island: 'guam', service_type: 'shelter', status: 'active',
      hours_text: '24/7', capacity_text: '300 persons',
    },
    {
      id: SEED_OFFERINGS.food,
      organization_id: SEED_ORGS.redCross,
      name: 'Hot Meal Distribution — Hagåtña',
      description: 'Three meals per day, no registration required.',
      location_text: 'Skinner Plaza, Hagåtña, Guam',
      location_lat: 13.4773, location_lng: 144.7489,
      island: 'guam', service_type: 'food', status: 'active',
      hours_text: '7am–7pm daily',
    },
    {
      id: SEED_OFFERINGS.femaDrc,
      organization_id: SEED_ORGS.fema,
      name: 'FEMA DRC — Agana Shopping Center',
      description: 'Apply for FEMA individual assistance, SBA loans, and disaster unemployment.',
      location_text: 'Agana Shopping Center, Hagåtña, Guam',
      location_lat: 13.4741, location_lng: 144.7515,
      island: 'guam', service_type: 'shelter', status: 'active',
      hours_text: 'Mon–Sat 8am–6pm',
    },
    {
      id: SEED_OFFERINGS.tarps,
      organization_id: SEED_ORGS.adelup,
      name: 'Tarp Distribution — Adelup Point',
      description: 'Free tarps for roof damage. One per household, bring ID.',
      location_text: 'Adelup Point, Hagåtña, Guam',
      location_lat: 13.4860, location_lng: 144.7430,
      island: 'guam', service_type: 'tarps', status: 'active',
      hours_text: '8am–4pm Mon–Fri', capacity_text: '1 tarp per household',
    },
  ], { onConflict: 'id' })

  if (offerErr) throw new Error(`[global-setup] offerings upsert failed: ${offerErr.message}`)

  console.log('[global-setup] Seeded 3 orgs + 4 Guam offerings ✓')
}
