-- TPMForge — P4: resume analysis snapshots

create table if not exists public.resume_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_size int,
  file_type text,
  raw_text text,
  competency_scores jsonb,
  readiness_score int check (readiness_score between 0 and 100),
  radar_data jsonb,
  gap_report jsonb,
  model_used text,
  tokens_used int,
  status text default 'processing',
  error_message text,
  created_at timestamptz default now()
);

alter table public.resume_analyses enable row level security;

create policy "Users can view own resume analyses"
  on public.resume_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own resume analyses"
  on public.resume_analyses for insert
  with check (auth.uid() = user_id);

create index idx_resume_analyses_user on public.resume_analyses (user_id);
create index idx_resume_analyses_created on public.resume_analyses (created_at desc);
