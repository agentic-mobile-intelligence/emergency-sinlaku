-- Admin role system
-- - Adds email to profiles
-- - public.is_admin() helper for RLS
-- - Trigger: socials@guahan.tech → admin, new profiles → unverified
-- - Admin RLS policies on orgs, volunteer tables, profiles

alter table public.profiles add column if not exists email text;

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where clerk_user_id = (auth.jwt()->>'sub')
      and role = 'admin'
  )
$$;

create or replace function public.enforce_profile_role()
returns trigger language plpgsql as $$
begin
  if new.email = 'socials@guahan.tech' then
    new.role := 'admin';
  elsif TG_OP = 'INSERT' then
    new.role := coalesce(new.role, 'unverified');
  else
    new.role := coalesce(new.role, old.role, 'unverified');
  end if;
  return new;
end;
$$;

create trigger before_profile_role_set
  before insert or update on public.profiles
  for each row execute function public.enforce_profile_role();

create policy "Admins can update any organization"
  on public.organizations for update
  using (public.is_admin());

create policy "Admins can view all volunteer signups"
  on public.volunteer_signups for select
  using (public.is_admin());

create policy "Admins can view all leader signups"
  on public.volunteer_leader_signups for select
  using (public.is_admin());

create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());
