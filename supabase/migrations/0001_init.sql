-- TPMForge — Initial migration (Phase A: P1–P2)
-- Run this in the Supabase SQL Editor. Extends the auth.users table.

-- 1. Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  headline text,
  current_work_role text,
  target_role text,
  target_companies text[] default '{}',
  timeline_weeks int,
  weekly_hours int,
  career_goal_certification text,
  onboarding_completed boolean default false,
  onboarding_completed_at timestamptz,
  timezone text default 'UTC',
  locale text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Newsletter / waitlist subscribers
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  source text default 'landing',
  confirmed boolean default false,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  preferences jsonb default '{"frequency": "weekly", "categories": []}',
  created_at timestamptz default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Anyone can insert their own email into the waitlist.
create policy "Anyone can join waitlist"
  on public.newsletter_subscribers for insert
  with check (true);

-- Users can see their own subscription.
create policy "Users can view own subscription"
  on public.newsletter_subscribers for select
  using (auth.uid() = user_id);

-- Admin-only updates (confirmation, unsubscribe).
create policy "Admins manage subscribers"
  on public.newsletter_subscribers for update
  using (auth.role() = 'authenticated' and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.email = 'admin@tpmforge.app'
  ));
