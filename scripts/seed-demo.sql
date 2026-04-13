-- Seed demo data for Sinlaku Emergency Directory
-- Paste this into Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor → New Query

-- Organizations
INSERT INTO organizations (name, contact_phone, contact_email, service_types, islands, verified, description) VALUES
  ('Guam Red Cross', '(671) 555-0100', 'relief@redcross.guam.example', ARRAY['shelter','food','water','medical']::service_type[], ARRAY['guam','saipan','tinian','rota']::island[], true, 'American Red Cross Guam Chapter — emergency shelter, food, water, first aid across all Mariana Islands.'),
  ('GovGuam Emergency Management', '(671) 555-0200', 'ocd@guam.gov.example', ARRAY['shelter','water','tarps']::service_type[], ARRAY['guam']::island[], true, 'Government of Guam OCD — emergency shelters, water distribution, tarp distribution.'),
  ('Saipan Community Relief', '(670) 555-0300', 'help@saipanrelief.example', ARRAY['food','water','cleanup','clothing']::service_type[], ARRAY['saipan','tinian']::island[], false, 'Volunteer-run relief group for Saipan and Tinian. Food, water, clothing, cleanup.')
ON CONFLICT DO NOTHING;

-- Offerings (using subqueries to get org IDs)
INSERT INTO offerings (organization_id, name, description, location_text, latitude, longitude, island, service_type, status, capacity_text, hours_text) VALUES
  ((SELECT id FROM organizations WHERE name = 'Guam Red Cross' LIMIT 1), 'Emergency Shelter — Dededo Gym', 'Full shelter with cots, blankets, meals. Pet-friendly. Open 24/7.', 'Dededo Sports Complex, Dededo, Guam', 13.5178, 144.8378, 'guam', 'shelter', 'active', '200 beds', '24/7'),
  ((SELECT id FROM organizations WHERE name = 'Guam Red Cross' LIMIT 1), 'Water Distribution — Hagåtña', 'Bottled water. Limit 2 cases per household.', 'Hagåtña Mayors Office, Guam', 13.4757, 144.7489, 'guam', 'water', 'active', '500 cases', '8am-5pm ChST'),
  ((SELECT id FROM organizations WHERE name = 'Guam Red Cross' LIMIT 1), 'First Aid Station — Tamuning', 'Basic first aid, wound care, limited prescription refills.', 'Tamuning Community Center, Guam', 13.4872, 144.7754, 'guam', 'medical', 'planned', 'Walk-ins accepted', '7am-7pm ChST (Apr 15)'),
  ((SELECT id FROM organizations WHERE name = 'GovGuam Emergency Management' LIMIT 1), 'Tarp Distribution — Yigo', 'Blue tarps for roof damage. Limit 2 per household.', 'Yigo Mayors Office, Yigo, Guam', 13.5363, 144.8817, 'guam', 'tarps', 'planned', '300 tarps', '9am-3pm ChST (Apr 16)'),
  ((SELECT id FROM organizations WHERE name = 'GovGuam Emergency Management' LIMIT 1), 'Emergency Shelter — Astumbo', 'GovGuam shelter. Meals 3x daily.', 'Astumbo Elementary School Gym, Dededo, Guam', 13.5231, 144.8500, 'guam', 'shelter', 'active', '150 persons', '24/7'),
  ((SELECT id FROM organizations WHERE name = 'Saipan Community Relief' LIMIT 1), 'Food Distribution — Garapan', 'Hot meals and canned goods. Volunteers welcome.', 'Garapan Community Center, Saipan', 15.2069, 145.7197, 'saipan', 'food', 'active', '300 meals/day', '10am-2pm ChST'),
  ((SELECT id FROM organizations WHERE name = 'Saipan Community Relief' LIMIT 1), 'Cleanup Crew — San Jose, Tinian', 'Volunteer debris removal. Chainsaw and truck crews.', 'San Jose Village, Tinian', 14.9544, 145.6236, 'tinian', 'cleanup', 'planned', '10 volunteers needed', '7am (Apr 17)')
ON CONFLICT DO NOTHING;

-- Aid Requests
INSERT INTO aid_requests (name, island, mobile_phone, household_size, needs, medical_needs, medical_notes, elderly_count, children_count, dogs_nearby, safely_accessible, notes) VALUES
  ('Maria', 'guam', '671-555-1234', 5, ARRAY['water','food','tarps']::service_type[], ARRAY['insulin_medication']::medical_need[], 'Father needs daily insulin — running low.', 1, 2, true, 'yes', 'Yigo, roof partially damaged. Family of 5. Water and food most urgent.'),
  ('Tun Jose', 'saipan', null, 2, ARRAY['medical','water']::service_type[], ARRAY['wheelchair','oxygen_ventilator']::medical_need[], 'Wife on oxygen concentrator — no power.', 2, 0, false, 'unsure', 'San Vicente, Saipan. Cannot leave. Road may be blocked.')
ON CONFLICT DO NOTHING;

-- Update the second request to flag cannot_leave
UPDATE aid_requests SET cannot_leave = true, landline_phone = '670-555-5678', disabled_count = 1 WHERE name = 'Tun Jose';

SELECT 'Seeded: ' || (SELECT count(*) FROM organizations) || ' orgs, ' || (SELECT count(*) FROM offerings) || ' offerings, ' || (SELECT count(*) FROM aid_requests) || ' requests' AS result;
