-- Organization Correction Feedback table
create type feedback_status as enum ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');

create table organization_feedback (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  feedback_type text,
  title text not null,
  description text not null,
  reviewer_name text not null,
  reviewer_email text,
  reviewer_phone text,
  element_selector text,
  element_text text,
  status feedback_status not null default 'PENDING',
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index idx_org_feedback_org_id on organization_feedback(org_id);
create index idx_org_feedback_status on organization_feedback(status);
create index idx_org_feedback_created on organization_feedback(created_at desc);

alter table organization_feedback enable row level security;

create policy "Public can submit feedback"
  on organization_feedback for insert with check (true);

create policy "Public can read feedback by id"
  on organization_feedback for select using (true);

create policy "Admins can update feedback"
  on organization_feedback for update using (auth.role() = 'authenticated');
