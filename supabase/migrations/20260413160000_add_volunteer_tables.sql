-- Volunteer sheets and signups
-- Sheets: sign-up opportunities posted by orgs
-- Signups: individual volunteer submissions (no account required)

create type public.volunteer_skill as enum (
  'cleanup',
  'food_distribution',
  'shelter_management',
  'transportation',
  'medical_support',
  'emotional_support',
  'childcare',
  'translation',
  'general_labor',
  'other'
);

create type public.volunteer_availability as enum (
  'weekday_mornings',
  'weekday_afternoons',
  'weekday_evenings',
  'weekend_mornings',
  'weekend_afternoons',
  'weekend_evenings',
  'anytime'
);

-- Volunteer sheets (opportunities)
create table public.volunteer_sheets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization_name text not null,
  description text,
  island island not null,
  skills_needed volunteer_skill[] not null default '{}',
  date_text text,
  capacity integer,
  signup_count integer not null default 0,
  contact_info text,
  status offering_status not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.volunteer_sheets enable row level security;

create policy "Volunteer sheets viewable by everyone"
  on public.volunteer_sheets for select using (true);

create policy "Authenticated users can create volunteer sheets"
  on public.volunteer_sheets for insert
  with check (auth.uid() is not null);

create policy "Authenticated users can update volunteer sheets"
  on public.volunteer_sheets for update
  using (auth.uid() is not null);

-- Volunteer signups (no account required)
create table public.volunteer_signups (
  id uuid primary key default gen_random_uuid(),
  sheet_id uuid references public.volunteer_sheets(id) on delete set null,
  display_name text,
  contact text,
  island island,
  skills volunteer_skill[] not null default '{}',
  availability volunteer_availability[] not null default '{}',
  notes text,
  is_public boolean not null default false,
  privacy_acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.volunteer_signups enable row level security;

-- Anyone can submit
create policy "Anyone can submit volunteer signup"
  on public.volunteer_signups for insert
  with check (true);

-- Public signups visible to all; private only via service role
create policy "Public signups viewable by everyone"
  on public.volunteer_signups for select
  using (is_public = true);

-- Increment signup count on new signup
create or replace function public.increment_sheet_signup_count()
returns trigger language plpgsql security definer as $$
begin
  if new.sheet_id is not null then
    update public.volunteer_sheets
    set signup_count = signup_count + 1
    where id = new.sheet_id;
  end if;
  return new;
end;
$$;

create trigger on_volunteer_signup
  after insert on public.volunteer_signups
  for each row execute procedure public.increment_sheet_signup_count();

-- Seed: sample volunteer sheets for Sinlaku relief
insert into public.volunteer_sheets
  (title, organization_name, description, island, skills_needed, date_text, capacity, contact_info, status)
values
  (
    'Debris Cleanup Crews — Guam',
    'GovGuam Office of Civil Defense',
    'Help clear fallen trees, debris, and damaged materials from neighborhoods. No experience required — gloves and equipment provided.',
    'guam',
    '{cleanup, general_labor}',
    'April 14 – 21, 2026',
    100,
    'Call 311 or sign up here',
    'active'
  ),
  (
    'Food Distribution Volunteers — Guam',
    'Red Cross Guam',
    'Assist with food distribution at relief points across Guam. Shifts are 4 hours. Meals provided.',
    'guam',
    '{food_distribution, general_labor}',
    'April 14 – 30, 2026',
    60,
    'Contact Red Cross Guam chapter',
    'active'
  ),
  (
    'Emergency Shelter Support — Saipan',
    'CNMI Department of Public Health',
    'Help manage and support individuals staying at emergency shelters. Duties include check-in, supply distribution, and welfare checks.',
    'saipan',
    '{shelter_management, emotional_support, general_labor}',
    'April 13 – 20, 2026',
    40,
    'Report to Saipan shelter coordinator',
    'active'
  ),
  (
    'Transportation Network — Guam',
    'Guahan.TECH Community Response',
    'Use your vehicle to transport aid supplies, evacuees, or relief workers. Must have valid license and fuel.',
    'guam',
    '{transportation}',
    'Ongoing — April 2026',
    null,
    'Sign up here — we will contact you',
    'active'
  ),
  (
    'Medical Support Volunteers — All Islands',
    'Guam Memorial Hospital',
    'Licensed medical professionals (nurses, EMTs, doctors) to assist at field medical stations. Credentials required.',
    'guam',
    '{medical_support}',
    'April 13 – 20, 2026',
    20,
    'Contact GMH volunteer coordinator',
    'active'
  ),
  (
    'Childcare Support — Guam Shelters',
    'Catholic Social Service',
    'Watch children at evacuation shelters so parents can register for aid, rest, or handle recovery tasks.',
    'guam',
    '{childcare, emotional_support}',
    'April 14 – 18, 2026',
    15,
    'Contact CSS Guam',
    'active'
  ),
  (
    'Chamorro / Chuukese Translation Volunteers',
    'Mariana Islands Community Coalition',
    'Help translate for families who need assistance navigating relief services. Chamorro, Chuukese, Carolinian, and Tagalog speakers welcome.',
    'guam',
    '{translation, emotional_support}',
    'Ongoing — April 2026',
    null,
    'Sign up here — we will assign you',
    'active'
  );
