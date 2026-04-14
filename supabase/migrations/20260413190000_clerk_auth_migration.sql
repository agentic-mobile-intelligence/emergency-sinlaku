-- Migrate from Supabase Auth to Clerk Auth
--
-- Clerk user IDs are strings (e.g. user_2abc...), not UUIDs.
-- This migration:
--   1. Adds role column to profiles (if missing)
--   2. Adds clerk_user_id TEXT column to profiles (the new auth identifier)
--   3. Drops UUID FK on organizations.user_id, changes it to TEXT
--   4. Updates all RLS policies to use auth.jwt()->>'sub' (Clerk user ID)
--   5. Drops the Supabase-specific auto-profile trigger (Clerk handles user creation)
--
-- After running this migration, configure:
--   - Clerk JWT template named "supabase" signed with Supabase JWT secret
--   - claims: { "sub": "{{user.id}}" }

-- ── Profiles ──────────────────────────────────────────────────────────────────

-- Add role column (Clerk apps manage role in profiles manually)
alter table public.profiles
  add column if not exists role text not null default 'recipient';

-- Add clerk_user_id as the new auth identifier
alter table public.profiles
  add column if not exists clerk_user_id text unique;

-- Drop FK from profiles.id to auth.users (Clerk users won't have auth.users rows)
alter table public.profiles
  drop constraint if exists profiles_id_fkey;

-- Update insert policy: match clerk_user_id to JWT sub claim
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check ((select auth.jwt()->>'sub') = clerk_user_id);

-- Update update policy: match clerk_user_id to JWT sub claim
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using ((select auth.jwt()->>'sub') = clerk_user_id);

-- ── Organizations ─────────────────────────────────────────────────────────────

-- Drop FK on user_id (Clerk user IDs are not in auth.users)
alter table public.organizations
  drop constraint if exists organizations_user_id_fkey;

-- Change user_id from UUID to TEXT to store Clerk user IDs
alter table public.organizations
  alter column user_id type text using user_id::text;

-- Update insert policy: any authenticated Clerk user can create an org
drop policy if exists "Authenticated users can create organizations" on public.organizations;
create policy "Authenticated users can create organizations"
  on public.organizations for insert
  with check ((select auth.jwt()->>'sub') is not null);

-- Update update policy: only the org owner (by Clerk user ID) can update
drop policy if exists "Org owners can update their organization" on public.organizations;
create policy "Org owners can update their organization"
  on public.organizations for update
  using ((select auth.jwt()->>'sub') = user_id);

-- ── Drop Supabase Auth trigger (Clerk handles user creation) ──────────────────

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
