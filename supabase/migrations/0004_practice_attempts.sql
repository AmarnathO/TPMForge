-- TPMForge — P7: practice attempts (scenario + quiz)

create table if not exists public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  competency_id text not null,
  kind text not null check (kind in ('scenario', 'quiz')),
  prompt jsonb not null default '{}',
  answer jsonb,
  score int check (score between 0 and 100),
  feedback text,
  model_used text,
  tokens_used int,
  created_at timestamptz default now()
);

alter table public.practice_attempts enable row level security;

create policy "Users can view own practice attempts"
  on public.practice_attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert own practice attempts"
  on public.practice_attempts for insert
  with check (auth.uid() = user_id);

create index idx_practice_attempts_user on public.practice_attempts (user_id);
create index idx_practice_attempts_competency on public.practice_attempts (competency_id);
create index idx_practice_attempts_created on public.practice_attempts (created_at desc);
