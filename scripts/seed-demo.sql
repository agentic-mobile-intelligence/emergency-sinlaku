-- Seed demo data for Sinlaku Emergency Directory
-- Run via Supabase SQL Editor or MCP execute_sql
-- Safe to re-run: truncates before inserting

TRUNCATE offerings, aid_requests, organizations CASCADE;

-- Organizations
INSERT INTO organizations (name, contact_phone, contact_email, whatsapp, service_types, islands, verified, verification_requested, description) VALUES
  ('Guam Red Cross', '(671) 555-0100', 'relief@redcross.guam.example', null,
    ARRAY['shelter','food','water','medical']::service_type[],
    ARRAY['guam','saipan','tinian','rota']::island[],
    true, false,
    'American Red Cross Guam Chapter — providing emergency shelter, food, water, and first aid across all Mariana Islands during Supertyphoon Sinlaku.'),
  ('GovGuam Emergency Management', '(671) 555-0200', 'ocd@guam.gov.example', null,
    ARRAY['shelter','water','tarps']::service_type[],
    ARRAY['guam']::island[],
    true, false,
    'Government of Guam Office of Civil Defense — coordinating emergency shelters, water distribution, and tarp distribution for Guam residents.'),
  ('Saipan Community Relief', '(670) 555-0300', 'help@saipanrelief.example', '16705550300',
    ARRAY['food','water','cleanup','clothing']::service_type[],
    ARRAY['saipan','tinian']::island[],
    false, true,
    'Volunteer-run community relief group serving Saipan and Tinian. Food packages, water, clothing donations, and cleanup crews.');

-- Offerings
INSERT INTO offerings (organization_id, name, description, location_text, location_lat, location_lng, island, service_type, status, planned_start, planned_end, capacity_text, hours_text) VALUES
  -- Guam Red Cross
  ((SELECT id FROM organizations WHERE name = 'Guam Red Cross'),
    'Emergency Shelter — Dededo Gym',
    'Full shelter with cots, blankets, and meals. Pet-friendly area available. Open 24/7 during storm conditions.',
    'Dededo Sports Complex, Dededo, Guam', 13.5178, 144.8378, 'guam', 'shelter', 'active',
    '2026-04-13T06:00:00+10:00', null, '200 beds', '24/7'),
  ((SELECT id FROM organizations WHERE name = 'Guam Red Cross'),
    'Water Distribution — Hagåtña',
    'Bottled water distribution. Limit 2 cases per household. Bring ID.',
    'Hagåtña Mayor''s Office, Hagåtña, Guam', 13.4757, 144.7489, 'guam', 'water', 'active',
    '2026-04-14T08:00:00+10:00', '2026-04-14T17:00:00+10:00', '500 cases', '8am - 5pm ChST'),
  ((SELECT id FROM organizations WHERE name = 'Guam Red Cross'),
    'First Aid Station — Tamuning',
    'Basic first aid, wound care, prescription refills (limited). No emergency surgery.',
    'Tamuning Community Center, Guam', 13.4872, 144.7754, 'guam', 'medical', 'planned',
    '2026-04-15T07:00:00+10:00', '2026-04-15T19:00:00+10:00', 'Walk-ins accepted', '7am - 7pm ChST (starting Apr 15)'),
  -- GovGuam
  ((SELECT id FROM organizations WHERE name = 'GovGuam Emergency Management'),
    'Tarp Distribution — Yigo',
    'Blue tarps for roof damage. Limit 2 per household. First come first served.',
    'Yigo Mayor''s Office, Yigo, Guam', 13.5363, 144.8817, 'guam', 'tarps', 'planned',
    '2026-04-16T09:00:00+10:00', '2026-04-16T15:00:00+10:00', '300 tarps', '9am - 3pm ChST (Apr 16)'),
  ((SELECT id FROM organizations WHERE name = 'GovGuam Emergency Management'),
    'Emergency Shelter — Astumbo Gym',
    'GovGuam-operated emergency shelter. Meals provided 3x daily.',
    'Astumbo Elementary School Gym, Dededo, Guam', 13.5231, 144.8500, 'guam', 'shelter', 'active',
    '2026-04-13T04:00:00+10:00', null, '150 persons', '24/7'),
  -- Saipan Community Relief
  ((SELECT id FROM organizations WHERE name = 'Saipan Community Relief'),
    'Food Distribution — Garapan',
    'Hot meals and canned goods. Volunteers welcome. Bring containers if possible.',
    'Garapan Community Center, Saipan', 15.2069, 145.7197, 'saipan', 'food', 'active',
    '2026-04-14T10:00:00+10:00', '2026-04-14T14:00:00+10:00', '300 meals/day', '10am - 2pm ChST'),
  ((SELECT id FROM organizations WHERE name = 'Saipan Community Relief'),
    'Cleanup Crew — San Jose, Tinian',
    'Volunteer cleanup crew for debris removal. Chainsaw and truck crews available.',
    'San Jose Village, Tinian', 14.9544, 145.6236, 'tinian', 'cleanup', 'planned',
    '2026-04-17T07:00:00+10:00', null, '10 volunteers needed', '7am start (Apr 17)');

-- Aid Requests
INSERT INTO aid_requests (name, island, mobile_phone, household_size, needs, medical_needs, medical_notes, elderly_count, children_count, disabled_count, cannot_relocate, dogs_nearby, safely_accessible, notes) VALUES
  ('Maria', 'guam', '671-555-1234', 5,
    ARRAY['water','food','tarps']::service_type[],
    ARRAY['insulin_medication']::medical_need[],
    'Father needs daily insulin — running low on supply.',
    1, 2, 0, false, true, 'yes',
    'House in Yigo, roof partially damaged. Family of 5. Need water and food most urgently. Father is diabetic.');

INSERT INTO aid_requests (name, island, landline_phone, household_size, needs, medical_needs, medical_notes, elderly_count, children_count, disabled_count, cannot_relocate, dogs_nearby, safely_accessible, no_contact_explanation, notes) VALUES
  ('Tun Jose', 'saipan', '670-555-5678', 2,
    ARRAY['medical','water']::service_type[],
    ARRAY['wheelchair','oxygen_ventilator']::medical_need[],
    'Wife on oxygen concentrator — no power since yesterday. Need generator or relocation.',
    2, 0, 1, true, false, 'unsure', null,
    'Elderly couple in San Vicente. Wife on oxygen. Cannot leave location. Road may be blocked by fallen tree.');

SELECT 'Seeded: ' || (SELECT count(*) FROM organizations) || ' orgs, '
  || (SELECT count(*) FROM offerings) || ' offerings, '
  || (SELECT count(*) FROM aid_requests) || ' requests' AS result;
