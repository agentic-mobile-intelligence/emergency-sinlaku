/**
 * Stable UUIDs for test seed data.
 * These are inserted by global-setup.ts and removed by global-teardown.ts.
 * Using fixed IDs makes teardown deterministic.
 */
export const SEED_ORGS = {
  redCross:   '00000000-0000-0000-0001-000000000001',
  fema:       '00000000-0000-0000-0001-000000000002',
  adelup:     '00000000-0000-0000-0001-000000000003',
} as const

export const SEED_OFFERINGS = {
  shelter:  '00000000-0000-0000-0002-000000000001',
  food:     '00000000-0000-0000-0002-000000000002',
  femaDrc:  '00000000-0000-0000-0002-000000000003',
  tarps:    '00000000-0000-0000-0002-000000000004',
} as const

/** Expected UI strings for assertions */
export const SEED_LABELS = {
  offerings: {
    shelter:  'Emergency Shelter — Tiyan High School',
    food:     'Hot Meal Distribution — Hagåtña',
    femaDrc:  'FEMA DRC — Agana Shopping Center',
    tarps:    'Tarp Distribution — Adelup Point',
  },
  orgs: {
    redCross: 'Guam Red Cross Emergency Shelter',
    fema:     'FEMA Disaster Recovery Center — Guam',
    adelup:   'Adelup Tarp & Cleanup Distribution',
  },
  locations: {
    shelter:  'Tiyan High School, Barrigada, Guam',
    food:     'Hagåtña, Guam',
    tarps:    'Adelup Point, Hagåtña, Guam',
  },
} as const

export const TOTAL_GUAM_SEED_COUNT = Object.keys(SEED_OFFERINGS).length // 4
