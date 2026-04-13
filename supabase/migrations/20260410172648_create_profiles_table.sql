
-- Profiles table linked to Supabase Auth
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

-- Anyone can read profiles (for leaderboard)
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select using (true);

-- Users can update their own profile
create policy "Users can update own profile" 
  on public.profiles for update using ((select auth.uid()) = id);

-- Users can insert their own profile (on signup)
create policy "Users can insert own profile" 
  on public.profiles for insert with check ((select auth.uid()) = id);

-- Auto-create profile on signup via trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

