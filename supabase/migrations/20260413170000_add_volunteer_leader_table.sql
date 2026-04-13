-- Volunteer leader signups
-- Leaders: people who want to coordinate or lead volunteer teams

create table public.volunteer_leader_signups (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  contact text,
  island island,
  skills volunteer_skill[] not null default '{}',
  availability volunteer_availability[] not null default '{}',
  experience text,
  team_capacity integer,
  notes text,
  is_public boolean not null default false,
  privacy_acknowledged boolean not null,
  created_at timestamptz not null default now()
);

alter table public.volunteer_leader_signups enable row level security;

-- Anyone can submit
create policy "Anyone can submit volunteer leader signup"
  on public.volunteer_leader_signups for insert
  with check (true);

-- Public signups visible to all; private only via service role
create policy "Public leader signups viewable by everyone"
  on public.volunteer_leader_signups for select
  using (is_public = true);
