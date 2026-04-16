-- Transparent Donation & Relief Fund Tracking System
-- Creates donation campaigns, donations, fund leaders, fund transactions,
-- and the fund_leader_balances view for the public transparency dashboard.
-- All fund data is public by design — transparency eliminates waste.

-- ── Donation Campaigns ───────────────────────────────────────────────────────

create table public.donation_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  goal_amount numeric,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.donation_campaigns enable row level security;

create policy "Donation campaigns are viewable by everyone"
  on public.donation_campaigns for select using (true);

create policy "Admins can manage donation campaigns"
  on public.donation_campaigns for all
  using (public.is_admin());

-- Seed the initial campaign
insert into public.donation_campaigns (name, is_active)
values ('Supertyphoon Sinlaku Emergency Relief', true);

-- ── Donations ────────────────────────────────────────────────────────────────

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.donation_campaigns(id) on delete set null,
  amount numeric not null check (amount > 0),
  donor_name text,
  donor_email text,
  message text,
  island_earmark public.island,
  is_public boolean not null default true,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'failed', 'refunded')),
  payment_method text not null default 'other'
    check (payment_method in ('stripe', 'check', 'cash', 'wire', 'zelle', 'paypal', 'other')),
  stripe_session_id text,
  created_at timestamptz not null default now()
);

alter table public.donations enable row level security;

-- Public can see confirmed, public donations (for the feed)
create policy "Public confirmed donations are viewable"
  on public.donations for select
  using (status = 'confirmed' and is_public = true);

-- Authenticated users can also see their own donations by email
create policy "Donors can view own donations by email"
  on public.donations for select
  using (
    donor_email is not null
    and donor_email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- Anyone can submit a donation pledge (insert)
create policy "Anyone can submit a donation pledge"
  on public.donations for insert
  with check (true);

-- Admins have full access
create policy "Admins can manage donations"
  on public.donations for all
  using (public.is_admin());

create index idx_donations_status on public.donations(status);
create index idx_donations_campaign on public.donations(campaign_id);
create index idx_donations_island on public.donations(island_earmark);
create index idx_donations_email on public.donations(donor_email);
create index idx_donations_created on public.donations(created_at desc);

-- ── Fund Leaders ─────────────────────────────────────────────────────────────

create table public.fund_leaders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  clerk_user_id text,
  display_name text not null,
  contact_phone text,
  contact_email text,
  address text not null,
  island public.island not null,
  intended_services text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'suspended')),
  approved_by text,
  approved_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.fund_leaders enable row level security;

-- Public can see approved fund leaders (transparency)
create policy "Approved fund leaders are viewable by everyone"
  on public.fund_leaders for select
  using (status = 'approved');

-- Admins can see all (including pending/suspended)
create policy "Admins can view all fund leaders"
  on public.fund_leaders for select
  using (public.is_admin());

-- Authenticated users can apply (insert)
create policy "Authenticated users can apply as fund leader"
  on public.fund_leaders for insert
  with check ((select auth.jwt()->>'sub') is not null);

-- Admins can update (approve/suspend)
create policy "Admins can manage fund leaders"
  on public.fund_leaders for update
  using (public.is_admin());

create index idx_fund_leaders_status on public.fund_leaders(status);
create index idx_fund_leaders_island on public.fund_leaders(island);
create index idx_fund_leaders_org on public.fund_leaders(organization_id);

-- ── Fund Transactions ────────────────────────────────────────────────────────

create table public.fund_transactions (
  id uuid primary key default gen_random_uuid(),
  fund_leader_id uuid not null references public.fund_leaders(id) on delete cascade,
  donation_id uuid references public.donations(id) on delete set null,
  amount numeric not null,
  type text not null
    check (type in ('allocation', 'disbursement', 'return')),
  description text not null,
  receipt_url text,
  recorded_by text,
  created_at timestamptz not null default now()
);

alter table public.fund_transactions enable row level security;

-- All transactions are public — this IS the audit trail
create policy "Fund transactions are viewable by everyone"
  on public.fund_transactions for select using (true);

-- Only admins can record transactions
create policy "Admins can record fund transactions"
  on public.fund_transactions for insert
  with check (public.is_admin());

create policy "Admins can update fund transactions"
  on public.fund_transactions for update
  using (public.is_admin());

create index idx_fund_txns_leader on public.fund_transactions(fund_leader_id);
create index idx_fund_txns_type on public.fund_transactions(type);
create index idx_fund_txns_created on public.fund_transactions(created_at desc);

-- ── Fund Leader Balances (View) ──────────────────────────────────────────────
-- Aggregated view for the transparency dashboard — joins fund_leaders +
-- organizations + fund_transactions to produce per-leader financial summary.

create or replace view public.fund_leader_balances as
select
  fl.id,
  fl.display_name,
  o.name as org_name,
  fl.island,
  fl.address,
  fl.contact_email,
  fl.intended_services,
  fl.status,
  o.verified as org_verified,
  coalesce(
    (select sum(ft.amount) from public.fund_transactions ft
     where ft.fund_leader_id = fl.id and ft.type = 'allocation'),
    0
  ) as total_received,
  coalesce(
    (select sum(abs(ft.amount)) from public.fund_transactions ft
     where ft.fund_leader_id = fl.id and ft.type = 'disbursement'),
    0
  ) as total_disbursed,
  coalesce(
    (select sum(ft.amount) from public.fund_transactions ft
     where ft.fund_leader_id = fl.id and ft.type = 'allocation'),
    0
  ) - coalesce(
    (select sum(abs(ft.amount)) from public.fund_transactions ft
     where ft.fund_leader_id = fl.id and ft.type = 'disbursement'),
    0
  ) as balance
from public.fund_leaders fl
join public.organizations o on o.id = fl.organization_id;

-- Grant public read on the view
grant select on public.fund_leader_balances to anon, authenticated;
