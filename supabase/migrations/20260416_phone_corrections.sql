-- Phone number corrections submitted by community members
create table if not exists public.phone_corrections (
  id uuid primary key default gen_random_uuid(),
  contact_label text not null,
  current_number text not null,
  suggested_number text not null,
  notes text,
  submitted_by_user_id text, -- Clerk user ID, null for anonymous
  submitted_by_name text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Public insert (anonymous + authenticated)
alter table public.phone_corrections enable row level security;

create policy "Anyone can submit a phone correction"
  on public.phone_corrections for insert
  with check (true);

create policy "Admins can read all phone corrections"
  on public.phone_corrections for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.clerk_user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub')
        and profiles.role = 'admin'
    )
  );

create policy "Admins can update phone corrections"
  on public.phone_corrections for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.clerk_user_id = (current_setting('request.jwt.claims', true)::jsonb->>'sub')
        and profiles.role = 'admin'
    )
  );
