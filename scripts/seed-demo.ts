/**
 * Seed demo data for the emergency directory.
 * Run: bun run scripts/seed-demo.ts
 *
 * Seeds 3 organizations with offerings across Guam, Saipan, and Rota.
 * Also seeds 2 sample aid requests.
 */

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ""
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function seed() {
  console.log("Seeding demo data...")

  // --- Organizations ---
  const orgs = [
    {
      name: "Guam Red Cross",
      contact_phone: "(671) 555-0100",
      contact_email: "relief@redcross.guam.example",
      whatsapp: null,
      service_types: ["shelter", "food", "water", "medical"],
      islands: ["guam", "saipan", "tinian", "rota"],
      verified: true,
      verification_requested: false,
      description: "American Red Cross Guam Chapter — providing emergency shelter, food, water, and first aid across all Mariana Islands during Supertyphoon Sinlaku.",
    },
    {
      name: "GovGuam Emergency Management",
      contact_phone: "(671) 555-0200",
      contact_email: "ocd@guam.gov.example",
      whatsapp: null,
      service_types: ["shelter", "water", "tarps"],
      islands: ["guam"],
      verified: true,
      verification_requested: false,
      description: "Government of Guam Office of Civil Defense — coordinating emergency shelters, water distribution, and tarp distribution for Guam residents.",
    },
    {
      name: "Saipan Community Relief",
      contact_phone: "(670) 555-0300",
      contact_email: "help@saipanrelief.example",
      whatsapp: "16705550300",
      service_types: ["food", "water", "cleanup", "clothing"],
      islands: ["saipan", "tinian"],
      verified: false,
      verification_requested: true,
      description: "Volunteer-run community relief group serving Saipan and Tinian. Food packages, water, clothing donations, and cleanup crews.",
    },
  ]

  const { data: orgData, error: orgError } = await supabase
    .from("organizations")
    .upsert(orgs, { onConflict: "name" })
    .select()

  if (orgError) {
    console.error("Error seeding organizations:", orgError.message)
    return
  }

  console.log(`Seeded ${orgData.length} organizations`)

  // --- Offerings ---
  const offerings = [
    // Guam Red Cross
    {
      organization_id: orgData[0].id,
      name: "Emergency Shelter — Dededo Gym",
      description: "Full shelter with cots, blankets, and meals. Pet-friendly area available. Open 24/7 during storm conditions.",
      location_text: "Dededo Sports Complex, Dededo, Guam",
      latitude: 13.5178,
      longitude: 144.8378,
      island: "guam",
      service_type: "shelter",
      status: "active",
      planned_start: "2026-04-13T06:00:00+10:00",
      planned_end: null,
      capacity_text: "200 beds",
      hours_text: "24/7",
    },
    {
      organization_id: orgData[0].id,
      name: "Water Distribution — Hagåtña",
      description: "Bottled water distribution. Limit 2 cases per household. Bring ID.",
      location_text: "Hagåtña Mayor's Office, Hagåtña, Guam",
      latitude: 13.4757,
      longitude: 144.7489,
      island: "guam",
      service_type: "water",
      status: "active",
      planned_start: "2026-04-14T08:00:00+10:00",
      planned_end: "2026-04-14T17:00:00+10:00",
      capacity_text: "500 cases",
      hours_text: "8am - 5pm ChST",
    },
    {
      organization_id: orgData[0].id,
      name: "First Aid Station — Tamuning",
      description: "Basic first aid, wound care, prescription refills (limited). No emergency surgery.",
      location_text: "Tamuning Community Center, Guam",
      latitude: 13.4872,
      longitude: 144.7754,
      island: "guam",
      service_type: "medical",
      status: "planned",
      planned_start: "2026-04-15T07:00:00+10:00",
      planned_end: "2026-04-15T19:00:00+10:00",
      capacity_text: "Walk-ins accepted",
      hours_text: "7am - 7pm ChST (starting Apr 15)",
    },
    // GovGuam
    {
      organization_id: orgData[1].id,
      name: "Tarp Distribution — Yigo",
      description: "Blue tarps for roof damage. Limit 2 per household. First come first served.",
      location_text: "Yigo Mayor's Office, Yigo, Guam",
      latitude: 13.5363,
      longitude: 144.8817,
      island: "guam",
      service_type: "tarps",
      status: "planned",
      planned_start: "2026-04-16T09:00:00+10:00",
      planned_end: "2026-04-16T15:00:00+10:00",
      capacity_text: "300 tarps",
      hours_text: "9am - 3pm ChST (Apr 16)",
    },
    {
      organization_id: orgData[1].id,
      name: "Emergency Shelter — Astumbo Gym",
      description: "GovGuam-operated emergency shelter. Meals provided 3x daily.",
      location_text: "Astumbo Elementary School Gym, Dededo, Guam",
      latitude: 13.5231,
      longitude: 144.8500,
      island: "guam",
      service_type: "shelter",
      status: "active",
      planned_start: "2026-04-13T04:00:00+10:00",
      planned_end: null,
      capacity_text: "150 persons",
      hours_text: "24/7",
    },
    // Saipan Community Relief
    {
      organization_id: orgData[2].id,
      name: "Food Distribution — Garapan",
      description: "Hot meals and canned goods. Volunteers welcome. Bring containers if possible.",
      location_text: "Garapan Community Center, Saipan",
      latitude: 15.2069,
      longitude: 145.7197,
      island: "saipan",
      service_type: "food",
      status: "active",
      planned_start: "2026-04-14T10:00:00+10:00",
      planned_end: "2026-04-14T14:00:00+10:00",
      capacity_text: "300 meals/day",
      hours_text: "10am - 2pm ChST",
    },
    {
      organization_id: orgData[2].id,
      name: "Cleanup Crew — San Jose, Tinian",
      description: "Volunteer cleanup crew for debris removal. Chainsaw and truck crews available.",
      location_text: "San Jose Village, Tinian",
      latitude: 14.9544,
      longitude: 145.6236,
      island: "tinian",
      service_type: "cleanup",
      status: "planned",
      planned_start: "2026-04-17T07:00:00+10:00",
      planned_end: null,
      capacity_text: "10 volunteers needed",
      hours_text: "7am start (Apr 17)",
    },
  ]

  const { data: offeringData, error: offeringError } = await supabase
    .from("offerings")
    .upsert(offerings, { onConflict: "id" })
    .select()

  if (offeringError) {
    console.error("Error seeding offerings:", offeringError.message)
  } else {
    console.log(`Seeded ${offeringData.length} offerings`)
  }

  // --- Aid Requests ---
  const requests = [
    {
      name: "Maria",
      island: "guam",
      mobile_phone: "671-555-1234",
      household_size: 5,
      needs: ["water", "food", "tarps"],
      medical_needs: ["insulin_medication"],
      medical_notes: "Father needs daily insulin — running low on supply.",
      elderly_count: 1,
      children_count: 2,
      disabled_count: 0,
      cannot_leave: false,
      dogs_nearby: true,
      safely_accessible: "yes",
      notes: "House in Yigo, roof partially damaged. Family of 5. Need water and food most urgently. Father is diabetic.",
      status: "open",
    },
    {
      name: "Tun Jose",
      island: "saipan",
      landline_phone: "670-555-5678",
      household_size: 2,
      needs: ["medical", "water"],
      medical_needs: ["wheelchair", "oxygen_ventilator"],
      medical_notes: "Wife on oxygen concentrator — no power since yesterday. Need generator or relocation.",
      elderly_count: 2,
      children_count: 0,
      disabled_count: 1,
      cannot_leave: true,
      dogs_nearby: false,
      safely_accessible: "unsure",
      no_contact_explanation: null,
      notes: "Elderly couple in San Vicente. Wife on oxygen. Cannot leave location. Road may be blocked by fallen tree.",
      status: "open",
    },
  ]

  const { data: requestData, error: requestError } = await supabase
    .from("aid_requests")
    .upsert(requests, { onConflict: "id" })
    .select()

  if (requestError) {
    console.error("Error seeding aid requests:", requestError.message)
  } else {
    console.log(`Seeded ${requestData.length} aid requests`)
  }

  console.log("\nDemo data seeded successfully!")
  console.log("- 3 organizations (2 verified, 1 pending)")
  console.log("- 7 offerings across Guam, Saipan, Tinian")
  console.log("- 2 aid requests (1 standard, 1 cannot-leave high-priority)")
}

seed().catch(console.error)
