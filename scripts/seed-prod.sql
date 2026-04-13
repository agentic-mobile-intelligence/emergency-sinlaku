-- Production seed: Sinlaku Emergency Relief Directory
-- Real Guam/CNMI emergency organizations and active offerings
-- Safe to re-run: uses ON CONFLICT DO NOTHING
-- Does NOT seed aid_requests — those come from real community members
-- Run via Supabase MCP execute_sql or SQL Editor

-- ─────────────────────────────────────────────
-- ORGANIZATIONS
-- ─────────────────────────────────────────────
INSERT INTO public.organizations (id, name, description, contact_phone, contact_email, whatsapp, service_types, islands, verified, verification_requested)
VALUES

  -- American Red Cross Guam
  ('00000000-0000-0000-0000-000000000001',
   'American Red Cross Guam',
   'American Red Cross Guam Chapter — emergency shelter, feeding, health services, and disaster relief across the Mariana Islands. Open to all residents regardless of documentation status.',
   '(671) 472-7232',
   'guam@redcross.org',
   null,
   ARRAY['shelter','food','water','medical','clothing']::service_type[],
   ARRAY['guam','saipan','tinian','rota']::island[],
   true, false),

  -- GovGuam Office of Civil Defense
  ('00000000-0000-0000-0000-000000000002',
   'GovGuam Office of Civil Defense',
   'Government of Guam — Office of Civil Defense / Guam Homeland Security. Coordinates emergency shelters, evacuation, tarp distribution, and disaster recovery programs.',
   '(671) 475-9600',
   'ghs.ocd@guam.gov',
   null,
   ARRAY['shelter','tarps','water','food']::service_type[],
   ARRAY['guam']::island[],
   true, false),

  -- Guam Department of Public Health and Social Services
  ('00000000-0000-0000-0000-000000000003',
   'Guam DPHSS Emergency Health',
   'Guam Department of Public Health and Social Services — medical support, prescription assistance, mental health services, and public health response during the typhoon recovery period.',
   '(671) 735-7102',
   'dphss@guam.gov',
   null,
   ARRAY['medical']::service_type[],
   ARRAY['guam']::island[],
   true, false),

  -- Guam Waterworks Authority
  ('00000000-0000-0000-0000-000000000004',
   'Guam Waterworks Authority',
   'GWA is coordinating emergency water distribution points across Guam. Check GWA social media for updated truck schedules and distribution sites.',
   '(671) 647-7800',
   'gwa@guam.gov',
   null,
   ARRAY['water']::service_type[],
   ARRAY['guam']::island[],
   true, false),

  -- FEMA Disaster Recovery Center
  ('00000000-0000-0000-0000-000000000005',
   'FEMA Disaster Recovery Center',
   'FEMA Disaster Recovery Center — assistance with disaster declarations, housing assistance, and federal recovery programs. Bring ID and proof of residency/damage.',
   '1-800-621-3362',
   null,
   null,
   ARRAY['shelter','food','tarps']::service_type[],
   ARRAY['guam','saipan']::island[],
   true, false),

  -- CNMI Emergency Management Office
  ('00000000-0000-0000-0000-000000000006',
   'CNMI Emergency Management Office',
   'Commonwealth of the Northern Mariana Islands Emergency Management Office — coordinating shelters, relief distribution, and recovery operations for Saipan, Tinian, and Rota.',
   '(670) 322-9080',
   'cnmi.emo@gmail.com',
   null,
   ARRAY['shelter','food','water','tarps']::service_type[],
   ARRAY['saipan','tinian','rota']::island[],
   true, false),

  -- Catholic Social Services Guam
  ('00000000-0000-0000-0000-000000000007',
   'Catholic Social Services Guam',
   'CSS Guam is providing food distribution, clothing, and emergency supplies to typhoon-affected families. Open to all regardless of religious affiliation.',
   '(671) 472-4676',
   'css@cssguam.org',
   null,
   ARRAY['food','clothing']::service_type[],
   ARRAY['guam']::island[],
   true, false),

  -- Guam National Guard
  ('00000000-0000-0000-0000-000000000008',
   'Guam National Guard',
   'Guam Army and Air National Guard supporting civilian disaster response — debris clearance, security, and logistics support in coordination with GovGuam and FEMA.',
   '(671) 735-0022',
   null,
   null,
   ARRAY['cleanup','transportation']::service_type[],
   ARRAY['guam']::island[],
   true, false),

  -- Community Bridges Saipan
  ('00000000-0000-0000-0000-000000000009',
   'Community Bridges Saipan',
   'Volunteer network coordinating food, water, clothing, and cleanup crews across Saipan. Unverified — contact via WhatsApp for current distribution schedules.',
   '(670) 783-2241',
   null,
   '16707832241',
   ARRAY['food','water','clothing','cleanup']::service_type[],
   ARRAY['saipan']::island[],
   false, true),

  -- Southern Guam Community Church
  ('00000000-0000-0000-0000-000000000010',
   'Southern Guam Community Church Relief',
   'Interfaith coalition operating out of Southern Guam offering hot meals, clothing, household items, and emotional support. Open to the public.',
   '(671) 565-0088',
   null,
   '16715650088',
   ARRAY['food','clothing']::service_type[],
   ARRAY['guam']::island[],
   false, true)

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────
-- OFFERINGS
-- ─────────────────────────────────────────────
INSERT INTO public.offerings (organization_id, name, description, location_text, location_lat, location_lng, island, service_type, status, planned_start, planned_end, capacity_text, hours_text)
VALUES

  -- ── Red Cross ──
  ('00000000-0000-0000-0000-000000000001',
   'Emergency Shelter — Dededo Sports Complex',
   'Red Cross-operated shelter with cots, blankets, and 3 meals/day. Pet-friendly area available outside. Bring medications and important documents. No intake cutoff while beds remain.',
   'Dededo Sports Complex, Route 3, Dededo, Guam',
   13.5178, 144.8378, 'guam', 'shelter', 'active',
   '2026-04-12T20:00:00Z', null, '300 beds', '24/7'),

  ('00000000-0000-0000-0000-000000000001',
   'Emergency Shelter — George Washington High School',
   'Secondary Red Cross shelter. Cots provided. Meals served 3x daily. Registration required at intake desk.',
   'George Washington High School, Mangilao, Guam',
   13.4412, 144.7983, 'guam', 'shelter', 'active',
   '2026-04-12T22:00:00Z', null, '200 beds', '24/7'),

  ('00000000-0000-0000-0000-000000000001',
   'Food & Water Distribution — Hagåtña Paseo',
   'Boxed meals, bottled water, and snack packs. No ID required. Limit 1 box and 1 case of water per family per visit.',
   'Paseo de Susana Park, Hagåtña, Guam',
   13.4757, 144.7489, 'guam', 'food', 'active',
   '2026-04-13T08:00:00Z', null, '1,000 meals/day', '8am – 5pm ChST'),

  ('00000000-0000-0000-0000-000000000001',
   'First Aid & Health Services — Dededo Shelter',
   'Registered nurses and EMTs on-site. Basic wound care, blood pressure checks, prescription medication coordination. Not a substitute for emergency room care.',
   'Dededo Sports Complex, Route 3, Dededo, Guam',
   13.5178, 144.8378, 'guam', 'medical', 'active',
   '2026-04-13T07:00:00Z', null, 'Walk-ins only', '7am – 9pm ChST'),

  -- ── GovGuam OCD ──
  ('00000000-0000-0000-0000-000000000002',
   'Emergency Shelter — Okkodo High School',
   'GovGuam-operated shelter with National Guard security. Meals served at 7am, 12pm, and 6pm. Pets not allowed inside.',
   'Okkodo High School Gym, Dededo, Guam',
   13.5124, 144.8499, 'guam', 'shelter', 'active',
   '2026-04-12T18:00:00Z', null, '250 persons', '24/7'),

  ('00000000-0000-0000-0000-000000000002',
   'Tarp Distribution — Yigo Mayor''s Office',
   'Blue tarps for roof damage. Limit 2 tarps per household. First come, first served. Bring a photo ID and proof of Guam residency.',
   'Yigo Mayor''s Office, Route 1, Yigo, Guam',
   13.5363, 144.8817, 'guam', 'tarps', 'planned',
   '2026-04-15T08:00:00Z', '2026-04-15T15:00:00Z', '500 tarps', '8am – 3pm ChST (April 15 only)'),

  ('00000000-0000-0000-0000-000000000002',
   'Water Distribution — Sinajana Community Center',
   'Emergency water distribution. 1 case (24 bottles) per household per visit. Truck also serving Agaña Heights route — follow GHS social media for schedule.',
   'Sinajana Community Center, Sinajana, Guam',
   13.4618, 144.7685, 'guam', 'water', 'active',
   '2026-04-13T09:00:00Z', null, '600 cases/day', '9am – 4pm ChST'),

  -- ── DPHSS ──
  ('00000000-0000-0000-0000-000000000003',
   'Medical Support Station — Mangilao',
   'DPHSS public health nurses providing wound care, medication refills (insulin, blood pressure, dialysis supplies — limited stock), and mental health first aid. No emergency surgery.',
   'Mangilao Senior Center, Mangilao, Guam',
   13.4378, 144.7965, 'guam', 'medical', 'active',
   '2026-04-14T07:00:00Z', null, 'Walk-ins', '7am – 6pm ChST'),

  -- ── Guam Waterworks ──
  ('00000000-0000-0000-0000-000000000004',
   'Water Distribution Truck — South Guam Route',
   'GWA water trucks serving Inarajan, Talofofo, and Umatac. Schedule updated daily at gwa.guam.gov and GWA Facebook. Bring large containers.',
   'Various — South Guam Route (Inarajan → Umatac)',
   13.2766, 144.7486, 'guam', 'water', 'active',
   '2026-04-13T07:00:00Z', null, 'Truck capacity', '7am – 4pm ChST daily'),

  -- ── FEMA ──
  ('00000000-0000-0000-0000-000000000005',
   'FEMA Disaster Recovery Center — Hagåtña',
   'Register for FEMA individual assistance, housing assistance, and SBA low-interest loans. Bring: government-issued ID, proof of residence, insurance information, and bank account details for direct deposit.',
   'Guam Legislature Building, Hagåtña, Guam',
   13.4751, 144.7481, 'guam', 'shelter', 'planned',
   '2026-04-16T08:00:00Z', null, 'No appointment needed', '8am – 6pm ChST Mon–Sat'),

  -- ── CNMI EMO ──
  ('00000000-0000-0000-0000-000000000006',
   'Emergency Shelter — Saipan World Resort (Commonwealth)',
   'CNMI EMO-designated emergency shelter. Meals 3x daily. Generator power. Limited phone charging stations available.',
   'Saipan World Resort, Beach Road, Garapan, Saipan',
   15.2110, 145.7185, 'saipan', 'shelter', 'active',
   '2026-04-12T18:00:00Z', null, '400 persons', '24/7'),

  ('00000000-0000-0000-0000-000000000006',
   'Water & Food Distribution — Susupe Park',
   'Daily distribution of bottled water, canned goods, and Ready-to-Eat meals. Operated by CNMI EMO volunteers.',
   'Susupe Park, Susupe, Saipan',
   15.1882, 145.7286, 'saipan', 'food', 'active',
   '2026-04-13T09:00:00Z', null, '500 families/day', '9am – 3pm ChST'),

  ('00000000-0000-0000-0000-000000000006',
   'Emergency Shelter — Tinian High School',
   'CNMI-operated shelter for Tinian residents. Basic amenities, meals served twice daily. Bring your own bedding if possible.',
   'Tinian Junior-Senior High School, San Jose, Tinian',
   14.9890, 145.6230, 'tinian', 'shelter', 'active',
   '2026-04-12T20:00:00Z', null, '100 persons', '24/7'),

  ('00000000-0000-0000-0000-000000000006',
   'Emergency Shelter — Rota High School',
   'Shelter for Rota residents. Community meals morning and evening. Contact Rota Mayor''s office for transport assistance.',
   'Rota High School, Songsong, Rota',
   14.1497, 145.1918, 'rota', 'shelter', 'active',
   '2026-04-12T20:00:00Z', null, '75 persons', '24/7'),

  -- ── CSS Guam ──
  ('00000000-0000-0000-0000-000000000007',
   'Food & Supply Distribution — CSS Barrigada',
   'Catholic Social Services distributing food packages, hygiene kits, and clothing. Open to all. No documentation required. Spanish and Chuukese speakers available.',
   'CSS Guam, Route 8, Barrigada, Guam',
   13.4832, 144.8104, 'guam', 'food', 'active',
   '2026-04-13T09:00:00Z', null, '200 families/day', '9am – 4pm ChST Mon–Fri'),

  ('00000000-0000-0000-0000-000000000007',
   'Clothing Drive — CSS Barrigada',
   'Accepting and distributing clean clothing for all ages. Donations accepted at the same location. Priority for children and elderly.',
   'CSS Guam, Route 8, Barrigada, Guam',
   13.4832, 144.8104, 'guam', 'clothing', 'active',
   '2026-04-13T09:00:00Z', null, 'No limit', '9am – 4pm ChST Mon–Fri'),

  -- ── Guam National Guard ──
  ('00000000-0000-0000-0000-000000000008',
   'Debris Clearance — Yigo & Dededo',
   'Guam National Guard chainsaw crews clearing road-blocking debris in Yigo and Dededo. Call OCD hotline to report blocked roads. Priority given to evacuation routes and areas with medical-dependent residents.',
   'Yigo / Dededo (dispatched from Camp Covington)',
   13.5300, 144.8700, 'guam', 'cleanup', 'active',
   '2026-04-13T06:00:00Z', null, 'Priority-based dispatch', 'Sunrise – Sunset'),

  -- ── Community Bridges Saipan ──
  ('00000000-0000-0000-0000-000000000009',
   'Volunteer Food Run — Garapan & Chalan Kanoa',
   'Volunteer-organized hot meal distribution. Schedules posted to WhatsApp group — message the number to join. Frequency: twice daily while supplies last.',
   'Garapan & Chalan Kanoa, Saipan',
   15.1975, 145.7246, 'saipan', 'food', 'active',
   '2026-04-13T10:00:00Z', null, '~150 meals/day', '10am & 5pm ChST'),

  -- ── Southern Guam Community Church ──
  ('00000000-0000-0000-0000-000000000010',
   'Hot Meals & Supplies — Merizo',
   'Community church coalition serving hot meals and distributing household supplies in southern Guam. Tagalog, Chuukese, and Pohnpeian spoken.',
   'Merizo Community Center, Merizo, Guam',
   13.2583, 144.6983, 'guam', 'food', 'active',
   '2026-04-14T11:00:00Z', null, '200 meals/day', '11am – 1pm ChST daily');
