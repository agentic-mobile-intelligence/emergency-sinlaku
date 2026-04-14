-- Announcements: admin-managed priority banners shown on the landing page

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  action_label text,
  action_url text,
  priority integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy "Active announcements viewable by everyone"
  on public.announcements for select
  using (is_active = true);

create policy "Admins can manage announcements"
  on public.announcements for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.announcements (message, action_label, action_url, priority, is_active)
values (
  'FEMA Emergency Declaration approved. Federal disaster relief activated — 75% federal funding for emergency protective measures.',
  'View Emergency Info',
  '/info',
  10,
  true
);
