-- Emergency Sinlaku schema: organizations, offerings, aid_requests, recipients
-- All timestamps in UTC, displayed as ChST (UTC+10) in the app

-- Enums
create type public.island as enum ('guam', 'saipan', 'tinian', 'rota');
create type public.service_type as enum ('shelter', 'food', 'water', 'medical', 'tarps', 'cleanup', 'clothing', 'transportation');
create type public.offering_status as enum ('active', 'planned', 'closed');
create type public.aid_request_status as enum ('open', 'responding', 'fulfilled', 'unable');
create type public.accessible_status as enum ('yes', 'no', 'unsure');

-- Organizations (service providers)
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  description text,
  contact_phone text,
  contact_email text,
  whatsapp text,
  service_types service_type[] not null default '{}',
  islands island[] not null default '{}',
  verified boolean not null default false,
  verification_requested boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

create policy "Organizations are viewable by everyone"
  on public.organizations for select using (true);

create policy "Authenticated users can create organizations"
  on public.organizations for insert
  with check (auth.uid() is not null);

create policy "Org owners can update their organization"
  on public.organizations for update
  using (auth.uid() = user_id);

-- Offerings (specific services from organizations)
create table public.offerings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  location_text text not null,
  location_lat double precision,
  location_lng double precision,
  island island not null,
  service_type service_type not null,
  status offering_status not null default 'active',
  planned_start timestamptz,
  planned_end timestamptz,
  capacity_text text,
  hours_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.offerings enable row level security;

create policy "Offerings are viewable by everyone"
  on public.offerings for select using (true);

create policy "Org owners can create offerings"
  on public.offerings for insert
  with check (
    auth.uid() = (select user_id from public.organizations where id = organization_id)
  );

create policy "Org owners can update offerings"
  on public.offerings for update
  using (
    auth.uid() = (select user_id from public.organizations where id = organization_id)
  );

create policy "Org owners can delete offerings"
  on public.offerings for delete
  using (
    auth.uid() = (select user_id from public.organizations where id = organization_id)
  );

-- Aid requests (from community members)
create table public.aid_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  island island not null,
  landline_phone text,
  mobile_phone text,
  email text,
  no_contact_explanation text,
  household_size integer not null default 1,
  needs service_type[] not null default '{}',
  dogs_nearby boolean not null default false,
  safely_accessible accessible_status not null default 'unsure',
  notes text,
  status aid_request_status not null default 'open',
  responded_by uuid references public.organizations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Require at least one contact method
  constraint contact_required check (
    landline_phone is not null
    or mobile_phone is not null
    or email is not null
    or no_contact_explanation is not null
  )
);

alter table public.aid_requests enable row level security;

-- All registered providers can see aid requests
create policy "Aid requests viewable by authenticated users"
  on public.aid_requests for select
  using (auth.uid() is not null);

-- Anyone authenticated can submit an aid request
create policy "Authenticated users can create aid requests"
  on public.aid_requests for insert
  with check (auth.uid() is not null);

-- Requesters can update their own requests
create policy "Users can update own aid requests"
  on public.aid_requests for update
  using (auth.uid() = user_id);

-- Providers can update status on aid requests (responding/fulfilled)
create policy "Providers can update aid request status"
  on public.aid_requests for update
  using (
    auth.uid() in (select user_id from public.organizations)
  );

-- Recipients (optional sign-up for community members)
create table public.recipients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  island island not null,
  contact_method text,
  needs service_type[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recipients enable row level security;

create policy "Recipients can view own record"
  on public.recipients for select
  using (auth.uid() = user_id);

create policy "Users can create own recipient record"
  on public.recipients for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recipient record"
  on public.recipients for update
  using (auth.uid() = user_id);

-- Indexes for common queries
create index idx_offerings_island on public.offerings(island);
create index idx_offerings_service_type on public.offerings(service_type);
create index idx_offerings_status on public.offerings(status);
create index idx_offerings_org on public.offerings(organization_id);
create index idx_aid_requests_island on public.aid_requests(island);
create index idx_aid_requests_status on public.aid_requests(status);
create index idx_organizations_verified on public.organizations(verified);

-- Updated_at triggers
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create trigger offerings_updated_at
  before update on public.offerings
  for each row execute function public.set_updated_at();

create trigger aid_requests_updated_at
  before update on public.aid_requests
  for each row execute function public.set_updated_at();

create trigger recipients_updated_at
  before update on public.recipients
  for each row execute function public.set_updated_at();
